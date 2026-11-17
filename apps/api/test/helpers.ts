import { createApp } from "../src/app.js";
import { fixedClock } from "../src/lib/clock.js";
import { Db, type Data } from "../src/store/db.js";
import { buildSeed } from "../src/store/seed.js";

export const NOW = new Date("2026-03-10T08:00:00.000Z"); // a Tuesday, 09:00 in Paris
export const JOB_KEY = "test-job-key";

export function emptyData(): Data {
  return {
    companies: [],
    employees: [],
    devices: [],
    encryptionReports: [],
    outbox: [],
    tickets: [],
  };
}

// A fresh app on its own in-memory database. Pass `data` to start from a hand-made fixture,
// or leave it out to start from the seed at NOW.
export function makeTestApp(data: Data = buildSeed(NOW)) {
  const db = Db.inMemory(data);
  const clock = fixedClock(NOW);
  const app = createApp({ db, clock, jobKey: JOB_KEY });
  return { app, db, clock };
}
