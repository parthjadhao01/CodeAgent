import cors from "cors";
import express from "express";
import { env } from "./env.js";
import { githubRouter } from "./routes/github.js";
import { sessionRouter } from "./routes/session.js";

const app = express();

app.use(cors({ origin: env.webAppUrl }));
app.use(express.json());

app.use("/api/github", githubRouter);
app.use("/api/session", sessionRouter);

app.listen(env.port, () => {
  console.log(`api listening on http://localhost:${env.port}`);
});
