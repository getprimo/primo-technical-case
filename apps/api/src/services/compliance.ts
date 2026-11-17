import type { EncryptionReport } from "../domain.js";

export type ComplianceStatus = "compliant" | "non_compliant";

// The Devices page shows one badge per device. Product decision (2024): a device whose
// encryption state we cannot confirm is shown as non-compliant, so admins look at it.
export function diskEncryptionCompliance(
  latest: EncryptionReport | undefined,
): ComplianceStatus {
  return latest?.diskEncryptionEnabled === true ? "compliant" : "non_compliant";
}
