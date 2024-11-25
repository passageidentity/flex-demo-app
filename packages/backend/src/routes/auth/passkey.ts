import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PassageFlex } from "@passageidentity/passage-flex-node";

export const passkeyRouter = Router();

const prisma = new PrismaClient();
const passage = new PassageFlex({ appId: process.env.PASSAGE_APP_ID ?? '', apiKey: process.env.PASSAGE_API_KEY ?? '' });

function checkUsernamePayload(req: Request) {
  let username = req.body.username;
  if (!username || typeof(username) !== 'string') {
    return false;
  }
  return true;
}

passkeyRouter.post('/add', async (req: Request, res: Response) => {
    const username = (req.session as any).username;
    if(!username){
        return res.status(401).send("Not logged in").end();
    }
    let user = await prisma.user.findUnique({where: {username: username}});
    if(user === null){
        return res.status(404).send("User does not exist").end();
    }
    if(user.passageExternalId === null){
       user = await prisma.user.update({where: {username: username}, data: {passageExternalId: username}});
    }
    const transactionId = await passage.auth.createRegisterTransaction({ externalId: user.passageExternalId!, passkeyDisplayName: user.username });
    return res.status(200).json({transactionId: transactionId}).end();
});

passkeyRouter.post('/login', async (req: Request, res: Response) => {
    if(!checkUsernamePayload(req)){
        return res.status(400).send("Bad Request").end();
    }
    const username = req.body.username as string;
    const user = await prisma.user.findUnique({where: {username: username}});
    if(user === null){
        return res.status(404).send("User does not exist").end();
    }
    if(user.passageExternalId === null) {
        return res.status(401).send("User has no passkeys").end();
    }
    try {
        const transactionId = await passage.auth.createAuthenticateTransaction(user.passageExternalId!);
        return res.status(200).json({transactionId: transactionId}).end();
    } catch {
        return res.status(401).send("User has no passkeys").end();
    }
});

passkeyRouter.post('/verify', async (req: Request, res: Response) => {
    const nonce = req.body.nonce as string;
    if (!nonce || typeof(nonce) !== 'string') {
        return res.status(400).send("Bad Request").end();
    }
    try {
        const externalId = await passage.auth.verifyNonce(nonce);
        const user = await prisma.user.findUnique({where: {passageExternalId: externalId}});
        if(user === null){
            return res.status(404).send("User does not exist").end();
        }
        (req.session as any).username = user.username;
        return res.status(200).send("OK").end();
    } catch {
        res.status(401).json({ error: 'Error occured verifying nonce.' });
    }
});
