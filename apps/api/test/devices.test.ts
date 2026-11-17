import request from "supertest";
import { describe, expect, it } from "vitest";
import { emptyData, makeTestApp } from "./helpers.js";

function fixture() {
  const data = emptyData();
  data.companies.push({
    id: "cmp_a",
    name: "A",
    timezone: "Europe/Paris",
    settings: {},
  });
  data.employees.push(
    {
      id: "emp_admin",
      companyId: "cmp_a",
      firstName: "Ada",
      lastName: "Admin",
      email: "ada@a.test",
      role: "admin",
      status: "active",
    },
    {
      id: "emp_bob",
      companyId: "cmp_a",
      firstName: "Bob",
      lastName: "B",
      email: "bob@a.test",
      role: "employee",
      status: "active",
    },
  );
  data.devices.push({
    id: "dev_1",
    companyId: "cmp_a",
    serialNumber: "SN1",
    model: "MacBook Air",
    platform: "macos",
    ownerId: "emp_bob",
    enrolledAt: "2026-01-01T00:00:00.000Z",
    lastSeenAt: "2026-03-10T06:00:00.000Z",
  });
  data.encryptionReports.push({
    id: "rep_1",
    companyId: "cmp_a",
    deviceId: "dev_1",
    reportedAt: "2026-03-10T06:00:00.000Z",
    diskEncryptionEnabled: true,
  });
  return data;
}

describe("GET /api/devices", () => {
  it("refuses an unauthenticated caller", async () => {
    const { app } = makeTestApp(fixture());

    const res = await request(app).get("/api/devices");

    expect(res.status).toBe(401);
  });

  it("lists only the devices of the caller company", async () => {
    const { app } = makeTestApp(fixture());

    const res = await request(app)
      .get("/api/devices")
      .set("x-user-id", "emp_admin");

    expect(res.status).toBe(200);
    expect(res.body.devices.map((d: { id: string }) => d.id)).toEqual([
      "dev_1",
    ]);
  });

  it("returns the owner and the encryption state of each device", async () => {
    const { app } = makeTestApp(fixture());

    const res = await request(app)
      .get("/api/devices")
      .set("x-user-id", "emp_admin");

    expect(res.body.devices[0].owner).toEqual({
      id: "emp_bob",
      name: "Bob B",
      status: "active",
    });
    expect(res.body.devices[0].diskEncryption).toEqual({
      enabled: true,
      reportedAt: "2026-03-10T06:00:00.000Z",
      compliance: "compliant",
    });
  });
});

describe("GET /api/devices/:id/encryption-reports", () => {
  it("returns the reports of a device of the caller company", async () => {
    const { app } = makeTestApp(fixture());

    const res = await request(app)
      .get("/api/devices/dev_1/encryption-reports")
      .set("x-user-id", "emp_bob");

    expect(res.status).toBe(200);
    expect(res.body.reports).toHaveLength(1);
  });

  it("answers 404 for an unknown device", async () => {
    const { app } = makeTestApp(fixture());

    const res = await request(app)
      .get("/api/devices/dev_nope/encryption-reports")
      .set("x-user-id", "emp_bob");

    expect(res.status).toBe(404);
  });
});
