import cors from "cors";
import express from "express";
import { connect } from "@repo/db";
import { env } from "./env.js";
import { githubRouter } from "./routes/github.js";
import { sessionRouter } from "./routes/session.js";

const app = express();

// credentials: the browser must send the platform session cookie with
// cross-origin calls from the web app.
app.use(cors({ origin: env.webAppUrl, credentials: true }));
app.use(express.json());

app.use("/api/github", githubRouter);
app.use("/api/session", sessionRouter);


async function main(): Promise<void> {
  await connect(env.mongoUrl);
  app.listen(env.port, () => {
    console.log(`api listening on http://localhost:${env.port}`);
  });
}

main().catch((error) => {
  console.error("api failed to start:", error);
  process.exit(1);
});
