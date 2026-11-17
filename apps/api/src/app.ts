import express from "express";
import type { Clock } from "./lib/clock.js";
import { authenticate, requireJobKey } from "./middleware/auth.js";
import { createRepositories } from "./repositories/index.js";
import { companyRouter } from "./routes/company.js";
import { devicesRouter } from "./routes/devices.js";
import { jobsRouter } from "./routes/jobs.js";
import { createMailer } from "./services/mailer.js";
import type { Db } from "./store/db.js";

export interface AppDeps {
  db: Db;
  clock: Clock;
  jobKey: string;
  // Dev-only routes (the user switcher of the web app). Off in tests and production.
  devRoutes?: boolean;
}

export function createApp({ db, clock, jobKey, devRoutes = false }: AppDeps) {
  const repos = createRepositories(db);
  const mailer = createMailer(repos, clock);
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  if (devRoutes) {
    // GET /dev/users — every active user, so the web app can impersonate one locally.
    app.get("/dev/users", (_req, res) => {
      res.json({
        users: db.data.employees
          .filter((e) => e.status === "active")
          .map((e) => ({
            id: e.id,
            name: `${e.firstName} ${e.lastName}`,
            role: e.role,
            company: repos.companies.findById(e.companyId)?.name,
          })),
      });
    });
  }

  app.use(
    "/internal/jobs",
    requireJobKey(jobKey),
    jobsRouter({ repos, mailer, clock }),
  );

  const api = express.Router();
  api.use(authenticate(repos));
  api.use("/", companyRouter(repos));
  api.use("/devices", devicesRouter(repos));
  app.use("/api", api);

  return app;
}
