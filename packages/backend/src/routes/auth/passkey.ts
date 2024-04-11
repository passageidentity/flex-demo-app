import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

export const passkeyRouter = Router();
const prisma = new PrismaClient();

const baseUrl = `https://api.passage.id/v1/apps/${process.env.PASSAGE_APP_ID}`;
const apiKey = process.env.PASSAGE_API_KEY;

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
    const user = await prisma.user.findUnique({where: {username: username}});
    if(user === null){
        return res.status(404).send("User does not exist").end();
    }
    if(user.passageExternalId === null){
        await prisma.user.update({where: {username: username}, data: {passageExternalId: username}});
    }
    // Get a nonce from the Passage BE API for passkey registration
    const url = `${baseUrl}/transactions/register`;
    const body = {
        external_id: username,
        passkey_display_name: username,
    };
    const apiRes = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
    });
    return res.status(200).json(await apiRes.json()).end();
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
    // Get a nonce from the Passage BE API for passkey authentication
    const url = `${baseUrl}/transactions/authenticate`;
    const body = {
        external_id: user.passageExternalId,
    };
    const apiRes = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
    });
    if(!apiRes.ok){
        return res.status(401).send("User has no passkeys").end();
    }
    return res.status(200).json(await apiRes.json()).end();
});

passkeyRouter.post('/verify', async (req: Request, res: Response) => {
    const nonce = req.body.nonce as string;
    const url = `${baseUrl}/authenticate/verify`;
    const body = {
        nonce,
    };
    const apiRes = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
    });
    if (apiRes.status === 200) {
        const resBody = await apiRes.json();
        const externalId = resBody.external_id;
        const user = await prisma.user.findUnique({where: {passageExternalId: externalId}});
        if(user === null){
            return res.status(404).send("User does not exist").end();
        }
        (req.session as any).username = user.username;
        return res.status(200).send("OK").end();
    } else {
        res.status(apiRes.status).json({ error: 'Error occured verifying nonce.' });
    }
});
