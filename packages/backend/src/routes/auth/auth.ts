import { Router, Request, Response } from "express";
import crypto from 'crypto';
import { PrismaClient } from "@prisma/client";

export const authRouter = Router();
const prisma = new PrismaClient();

function checkUsernamePasswordPayload(req: Request) {
  let username = req.body.username;
  let password = req.body.password;
  if (!username || !password || typeof(username) !== 'string' || typeof(password) !== 'string') {
    return false;
  }
  return true;
}

authRouter.post('/register/password', async (req: Request, res: Response) => {
	if(!checkUsernamePasswordPayload(req)){
    return res.status(400).send("Bad Request").end();
  }
  const username = req.body.username as string;
	const password = req.body.password as string;
  const user = await prisma.user.findUnique({where: {username: username}});
  if(user !== null){
      return res.status(404).send("User already exists").end();
  }
  try {
    const salt = crypto.randomBytes(16);
    const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512');
    await prisma.user.create({data:{username, hashedPassword, salt}});
  } catch (err) {
    return res.status(500).send("Internal Server Error").end();
  }
  (req.session as any).username = username;
  return res.status(200).send("OK").end();
});

authRouter.post('/login/password', async (req: Request, res: Response) => {
  if(!checkUsernamePasswordPayload(req)){
    return res.status(400).send("Bad Request").end();
  }
  const username = req.body.username as string;
	const password = req.body.password as string;
  const user = await prisma.user.findUnique({where: {username: username}});
  if(user === null){
      return res.status(404).send("User does not exist").end();
  }
  const hashedPassword = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512');
  if(!crypto.timingSafeEqual(user.hashedPassword, hashedPassword)) {
    return res.status(401).send("Unauthorized").end();
  }
  (req.session as any).username = username
  return res.status(200).send("OK").end();
})
