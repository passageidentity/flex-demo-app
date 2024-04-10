// src/index.ts
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { authRouter } from "./routes/users";

dotenv.config({ path: '../../../.env'});

const app: Express = express();
const port = process.env.PASSAGE_SERVER_PORT;

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server + Watching for changes');
});

app.use('/auth', authRouter);

async function main(){
  console.log('starting server...')
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}

main();