import { join } from "node:path";
import { createApp } from "./app.js";
import { systemClock } from "./lib/clock.js";
import { Db } from "./store/db.js";
import { buildSeed } from "./store/seed.js";

const port = Number(process.env.PORT ?? 4000);
const jobKey = process.env.JOB_KEY ?? "local-job-key";

// Data lives in apps/api/.data/db.json. `npm run reset` deletes it; the next start re-seeds.
const db = Db.fromFile(
  join(import.meta.dirname, "..", ".data", "db.json"),
  () => buildSeed(systemClock.now()),
);

createApp({ db, clock: systemClock, jobKey, devRoutes: true }).listen(
  port,
  () => {
    console.log(`api listening on http://localhost:${port}`);
  },
);
