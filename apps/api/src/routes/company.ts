import { Router } from "express";
import { auth } from "../middleware/auth.js";
import type { Repositories } from "../repositories/index.js";

export function companyRouter(repos: Repositories) {
  const router = Router();

  // GET /api/me — who is calling, and their company.
  router.get("/me", (req, res) => {
    const { userId, companyId } = auth(req);
    res.json({
      user: repos.employees.findById(companyId, userId),
      company: repos.companies.findById(companyId),
    });
  });

  // GET /api/outbox — the emails sent by the platform for the caller's company (dev helper).
  router.get("/outbox", (req, res) => {
    res.json({ emails: repos.outbox.listByCompany(auth(req).companyId) });
  });

  // GET /api/tickets — the tickets of the caller's company.
  router.get("/tickets", (req, res) => {
    res.json({ tickets: repos.tickets.listByCompany(auth(req).companyId) });
  });

  return router;
}
