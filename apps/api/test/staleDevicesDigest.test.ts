import request from "supertest";
import { describe, expect, it } from "vitest";
import { JOB_KEY, makeTestApp } from "./helpers.js";

describe("POST /internal/jobs/stale-devices-digest", () => {
  it("refuses a call without the job key", async () => {
    const { app } = makeTestApp();

    const res = await request(app).post("/internal/jobs/stale-devices-digest");

    expect(res.status).toBe(401);
  });

  it("emails the admins of each company that has a stale device", async () => {
    const { app, db } = makeTestApp();

    const res = await request(app)
      .post("/internal/jobs/stale-devices-digest")
      .set("x-job-key", JOB_KEY);

    expect(res.status).toBe(200);
    // Only Acme has a device unseen for 30+ days (dev_acme_12, 45 days).
    expect(db.data.outbox.map((e) => e.to)).toEqual(["alice@acme.test"]);
    expect(db.data.outbox[0]?.body).toContain('MacBook Pro 13"');
  });
});
