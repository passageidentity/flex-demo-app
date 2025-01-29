// src/index.ts
import express, { Express } from "express";
import dotenv from "dotenv";
import { passkeyRouter, passwordRouter } from "./routes/auth";
import cors from 'cors';
import bodyParser from "body-parser";
import session from 'express-session';
import crypto from 'crypto';
import { userRouter } from "./routes/user";
import { PrismaClient } from "@prisma/client";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '../../../.env'});

const app: Express = express();
const port = process.env.PASSAGE_SERVER_PORT;

app.use(
  cors({
    credentials: true,
  })
);
app.use(session({
	secret: crypto.createHmac('sha256', 'Passage').digest('hex'),
	resave: true,
	saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7},
  store: new PrismaSessionStore(
    new PrismaClient(),
    {
      checkPeriod: 2 * 60 * 1000,  //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    },
  ),
}));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/api/auth/password', passwordRouter);
app.use('/api/auth/passkey', passkeyRouter);
app.use('/api/auth/user', userRouter);

// This code makes sure that any request that does not matches a static file
// in the build folder, will just serve index.html. Client side routing is
// going to make sure that the correct content will be loaded.
app.use((req, res, next) => {
  if (/(.ico|.js|.css|.jpg|.png|.map|.svg)$/i.test(req.path)) {
      next();
  } else {
      res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.header('Expires', '-1');
      res.header('Pragma', 'no-cache');
      res.sendFile(path.join(__dirname, '../../../packages/frontend/dist/index.html'));
  }
});
// serve the react app
app.use(express.static(path.join(__dirname, '../../../packages/frontend/dist')));

async function main(){
  console.log('starting server...')
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}

main();