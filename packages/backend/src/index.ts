// src/index.ts
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { authRouter } from "./routes/users";
import cors from 'cors';
import bodyParser from "body-parser";

dotenv.config({ path: '../../../.env'});

const app: Express = express();
const port = process.env.PASSAGE_SERVER_PORT;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/auth', authRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server + Watching for changes');
});

async function main(){
  console.log('starting server...')
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}

main();