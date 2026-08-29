import { Router, type Router as RouterType } from "express";
import { currentUser, requireUser } from "../lib/auth.js";
import { listInstallationsForUser } from "../lib/store.js";

export const sessionRouter: RouterType = Router();

sessionRouter.get("/me", requireUser, async (req, res) => {
  const user = currentUser(req);
  const connections = await listInstallationsForUser(user.userId);

  res.json({
    userId: user.userId,
    email: user.email,
    githubConnections: connections.map((record) => ({
      installationId: record.installationId,
      accountLogin: record.accountLogin,
      connectedAt: record.connectedAt,
    })),
  });
});
