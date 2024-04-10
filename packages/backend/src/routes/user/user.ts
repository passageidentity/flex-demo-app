import { Router, Request, Response } from "express";

export const userRouter = Router();

userRouter.get('/', (req: Request, res: Response) => {
    const currentUser = (req.session as any).username;
    if(!currentUser){
        return res.status(401).send("Not logged in").end();
    }
    return res.status(200).json({username: currentUser}).end();
});
