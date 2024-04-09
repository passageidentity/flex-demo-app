import { Router, Request, Response } from "express";

export const usersRouter = Router();

usersRouter.post('/register', async (req: Request, res: Response) => {
    res.statusCode = 501;
    res.send("Not Implemented");
});

usersRouter.post('/login', async (req: Request, res: Response) => {
  res.statusCode = 501;
  res.send("Not Implemented");
})
