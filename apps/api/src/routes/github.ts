import { Router, type Router as RouterType } from "express";
import {
  exchangeUserCode,
  getInstallationAccount,
  listInstallationRepositories,
} from "../lib/githubApp.js";
import { createSessionToken } from "../lib/session.js";
import { saveInstallation } from "../lib/store.js";

export const githubRouter: RouterType = Router();

githubRouter.post("/callback", async (req, res) => {
  const { code, installationId, setupAction } = req.body as {
    code?: string;
    installationId?: string;
    setupAction?: string;
  };

  if (!code || !installationId) {
    res.status(400).json({ error: "code and installationId are required" });
    return;
  }

  if (setupAction && setupAction !== "install" && setupAction !== "update") {
    res.status(400).json({ error: `Unsupported setupAction: ${setupAction}` });
    return;
  }

  try {
    const [userAccessToken, accountLogin] = await Promise.all([
      exchangeUserCode(code),
      getInstallationAccount(installationId),
    ]);

    saveInstallation({
      installationId,
      accountLogin,
      userAccessToken,
      connectedAt: new Date().toISOString(),
    });

    const sessionToken = createSessionToken({ installationId, accountLogin });

    res.json({ installationId, accountLogin, sessionToken });
  } catch (error) {
    res.status(502).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

githubRouter.get("/repos", async (req, res) => {
  const { installationId } = req.query;

  if (typeof installationId !== "string") {
    res.status(400).json({ error: "installationId is required" });
    return;
  }

  try {
    const repositories = await listInstallationRepositories(installationId);
    res.json({ repositories });
  } catch (error) {
    res.status(502).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});
