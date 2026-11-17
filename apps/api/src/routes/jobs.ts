import { Router } from "express";
import { runStaleDevicesDigest } from "../jobs/staleDevicesDigest.js";
import type { Clock } from "../lib/clock.js";
import type { Repositories } from "../repositories/index.js";
import type { Mailer } from "../services/mailer.js";

// POST /internal/jobs/<name> — one endpoint per scheduled job. See AGENTS.md, "Scheduled jobs".
export function jobsRouter(deps: {
  repos: Repositories;
  mailer: Mailer;
  clock: Clock;
}) {
  const router = Router();

  router.post("/stale-devices-digest", (_req, res) => {
    res.json(runStaleDevicesDigest(deps));
  });

  return router;
}
