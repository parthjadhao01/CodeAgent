import { Router, type Router as RouterType } from "express";
import { currentUser, requireUser } from "../lib/auth.js";
import { listInstallationsForUser } from "../lib/store.js";

export const sessionRouter: RouterType = Router();

sessionRouter.get("/me", requireUser, (req, res) => {
  const user = currentUser(req);

  res.json({
    userId: user.userId,
    email: user.email,
    githubConnections: listInstallationsForUser(user.userId).map((record) => ({
      installationId: record.installationId,
      accountLogin: record.accountLogin,
      connectedAt: record.connectedAt,
    })),
  });
});
