import { Router, type Router as RouterType } from "express";
import { exchangeUserCode, getInstallationAccount } from "../lib/githubApp.js";
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

    res.json({ installationId, accountLogin });
  } catch (error) {
    res.status(502).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});
