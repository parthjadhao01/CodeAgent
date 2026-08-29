import { Router, type Router as RouterType } from "express";
import {
  exchangeUserCode,
  getInstallationAccount,
  listInstallationRepositories,
} from "../lib/githubApp.js";
import { currentUser, requireUser } from "../lib/auth.js";
import { saveInstallation, userOwnsInstallation } from "../lib/store.js";

export const githubRouter: RouterType = Router();

// Every route here is a repo *connection* on top of an existing platform
// session — installing the GitHub App never signs anyone in.
githubRouter.use(requireUser);

githubRouter.post("/callback", async (req, res) => {
  const user = currentUser(req);
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
    const [, accountLogin] = await Promise.all([
      exchangeUserCode(code),
      getInstallationAccount(installationId),
    ]);

    await saveInstallation({
      installationId,
      userId: user.userId,
      accountLogin,
      connectedAt: new Date().toISOString(),
    });

    res.json({ installationId, accountLogin });
  } catch (error) {
    res.status(502).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

githubRouter.get("/repos", async (req, res) => {
  const user = currentUser(req);
  const { installationId } = req.query;

  if (typeof installationId !== "string") {
    res.status(400).json({ error: "installationId is required" });
    return;
  }

  if (!(await userOwnsInstallation(user.userId, installationId))) {
    res.status(403).json({ error: "That installation is not connected to your account" });
    return;
  }

  try {
    const repositories = await listInstallationRepositories(installationId);
    res.json({ repositories });
  } catch (error) {
    res.status(502).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});
