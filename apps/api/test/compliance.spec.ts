import { describe, expect, it } from "vitest";
import { diskEncryptionCompliance } from "../src/services/compliance.js";

const report = (diskEncryptionEnabled: boolean | null) => ({
  id: "rep",
  companyId: "cmp",
  deviceId: "dev",
  reportedAt: "2026-03-10T06:00:00.000Z",
  diskEncryptionEnabled,
});

describe("diskEncryptionCompliance", () => {
  it("is compliant when the last report says encrypted", () => {
    expect(diskEncryptionCompliance(report(true))).toBe("compliant");
  });

  it("is non-compliant when the last report says not encrypted", () => {
    expect(diskEncryptionCompliance(report(false))).toBe("non_compliant");
  });

  it("shows an unknown state as non-compliant on the Devices page", () => {
    expect(diskEncryptionCompliance(report(null))).toBe("non_compliant");
    expect(diskEncryptionCompliance(undefined)).toBe("non_compliant");
  });
});
