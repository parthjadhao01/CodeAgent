import { Router, type Router as RouterType } from "express";
import { verifySessionToken } from "../lib/session.js";

export const sessionRouter: RouterType = Router();

sessionRouter.post("/verify", (req, res) => {
  const { token } = req.body as { token?: string };

  if (!token) {
    res.status(400).json({ error: "token is required" });
    return;
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired session" });
    return;
  }

  res.json(payload);
});
