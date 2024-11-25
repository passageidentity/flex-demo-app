import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PassageFlex, WebAuthnDevices } from "@passageidentity/passage-flex-node";

export const userRouter = Router();

const prisma = new PrismaClient();
const passage = new PassageFlex({ appId: process.env.PASSAGE_APP_ID ?? '', apiKey: process.env.PASSAGE_API_KEY ?? '' });

userRouter.get('/', async (req: Request, res: Response) => {
    const username = (req.session as any).username;
    if(!username){
        return res.status(401).send("Not logged in").end();
    }
    const user = await prisma.user.findUnique({where: {username: username}});
    if(user === null){
        return res.status(404).send("User does not exist").end();
    }
    let passkeys: WebAuthnDevices [] = [];
    if(user.passageExternalId !== null) {
        passkeys = await passage.user.listDevices(user.passageExternalId!);
    }
    return res.status(200).json({username, passkeys}).end();
});

userRouter.post('/revokePasskey', async (req: Request, res: Response) => {
    const username = (req.session as any).username;
    if(!username){
        return res.status(401).send("Not logged in").end();
    }
    const id = req.body.id as string;
    if (!id || typeof(id) !== 'string') {
        return res.status(400).send("Missing passkey id").end();
    }
    const user = await prisma.user.findUnique({where: {username: username}});
    if(user === null){
        return res.status(404).send("User does not exist").end();
    }
    if(user.passageExternalId === null) {
        return res.status(404).send("User has no passkeys.").end();
    }
    try {
        await passage.user.revokeDevice({externalId: user.passageExternalId!, deviceId:id});
        return res.status(200).send('OK').end();
    } catch {
        return res.status(500).send("Internal Server Error").end();
    }
});

userRouter.post('/logout', async (req: Request, res: Response) => {
    req.session.destroy(() => {
        res.status(200).send('OK').end();
    });
});
