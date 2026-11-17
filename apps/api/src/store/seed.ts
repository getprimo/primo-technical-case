import type { Company, Device, Employee, EncryptionReport } from "../domain.js";
import { daysAgo } from "../lib/dates.js";
import type { Data } from "./db.js";

// The seed is built relative to "now" so the data always looks fresh, whatever day you run it.
// Reports cover the last 60 days. A day with no report means the device did not check in.

type ReportValue = boolean | null | undefined; // undefined = no report that day
type Pattern = (daysAgo: number) => ReportValue;

const HISTORY_DAYS = 60;

const always =
  (value: boolean | null): Pattern =>
  () =>
    value;
const offForLast =
  (days: number): Pattern =>
  (d) =>
    d < days ? false : true;

const companies: Company[] = [
  {
    id: "cmp_acme",
    name: "Acme Robotics",
    timezone: "Europe/Paris",
    settings: {},
  },
  { id: "cmp_globex", name: "Globex", timezone: "Europe/Paris", settings: {} },
  {
    id: "cmp_initech",
    name: "Initech",
    timezone: "America/New_York",
    settings: {},
  },
];

const employees: Employee[] = [
  emp(
    "emp_acme_alice",
    "cmp_acme",
    "Alice",
    "Martin",
    "alice@acme.test",
    "admin",
  ),
  emp("emp_acme_bruno", "cmp_acme", "Bruno", "Petit", "bruno@acme.test"),
  emp("emp_acme_chloe", "cmp_acme", "Chloé", "Durand", "chloe@acme.test"),
  emp(
    "emp_acme_david",
    "cmp_acme",
    "David",
    "Leroy",
    "david@acme.test",
    "employee",
    "offboarded",
  ),
  emp("emp_acme_emma", "cmp_acme", "Emma", "Moreau", "emma@acme.test"),
  emp("emp_acme_farid", "cmp_acme", "Farid", "Benali", "farid@acme.test"),
  emp("emp_acme_gina", "cmp_acme", "Gina", "Rossi", "gina@freelance.test"),
  emp("emp_acme_hugo", "cmp_acme", "Hugo", "Blanc", "hugo@acme.test"),
  emp(
    "emp_globex_ines",
    "cmp_globex",
    "Inès",
    "Lambert",
    "ines@globex.test",
    "admin",
  ),
  emp("emp_globex_gina", "cmp_globex", "Gina", "Rossi", "gina@freelance.test"),
  emp(
    "emp_globex_jules",
    "cmp_globex",
    "Jules",
    "Fontaine",
    "jules@globex.test",
  ),
  emp(
    "emp_initech_kim",
    "cmp_initech",
    "Kim",
    "Nguyen",
    "kim@initech.test",
    "admin",
  ),
  emp("emp_initech_leo", "cmp_initech", "Leo", "Brooks", "leo@initech.test"),
];

interface DeviceSpec {
  id: string;
  companyId: string;
  ownerId: string | null;
  model: string;
  platform?: Device["platform"];
  enrolledDaysAgo?: number;
  pattern: Pattern;
}

const deviceSpecs: DeviceSpec[] = [
  {
    id: "dev_acme_01",
    companyId: "cmp_acme",
    ownerId: "emp_acme_alice",
    model: 'MacBook Pro 14"',
    pattern: always(true),
  },
  {
    id: "dev_acme_02",
    companyId: "cmp_acme",
    ownerId: "emp_acme_bruno",
    model: 'MacBook Air 13"',
    pattern: always(false),
  },
  {
    id: "dev_acme_03",
    companyId: "cmp_acme",
    ownerId: "emp_acme_chloe",
    model: 'MacBook Air 13"',
    pattern: offForLast(4),
  },
  {
    id: "dev_acme_04",
    companyId: "cmp_acme",
    ownerId: "emp_acme_david",
    model: 'MacBook Pro 16"',
    pattern: offForLast(20),
  },
  {
    id: "dev_acme_05",
    companyId: "cmp_acme",
    ownerId: "emp_acme_emma",
    model: 'MacBook Air 15"',
    // off for a while, fixed, then off again 5 days ago
    pattern: (d) => (d < 5 ? false : d < 12 ? true : d < 21 ? false : true),
  },
  {
    id: "dev_acme_06",
    companyId: "cmp_acme",
    ownerId: "emp_acme_farid",
    model: 'MacBook Pro 14"',
    // the MDM has not been able to read the encryption state for 15 days
    pattern: (d) => (d < 15 ? null : true),
  },
  {
    id: "dev_acme_07",
    companyId: "cmp_acme",
    ownerId: null,
    model: 'MacBook Air 13"',
    pattern: always(false),
  },
  {
    id: "dev_acme_08",
    companyId: "cmp_acme",
    ownerId: "emp_acme_gina",
    model: 'MacBook Air 13"',
    pattern: offForLast(10),
  },
  {
    id: "dev_acme_09",
    companyId: "cmp_acme",
    ownerId: "emp_acme_hugo",
    model: 'MacBook Pro 14"',
    // off for 13 days, but the device was offline (no check-in) 3 to 6 days ago
    pattern: (d) => (d >= 3 && d <= 6 ? undefined : d < 13 ? false : true),
  },
  {
    id: "dev_acme_10",
    companyId: "cmp_acme",
    ownerId: "emp_acme_hugo",
    model: "ThinkPad X1 Carbon",
    platform: "windows",
    pattern: always(false),
  },
  {
    id: "dev_acme_11",
    companyId: "cmp_acme",
    ownerId: "emp_acme_emma",
    model: 'MacBook Air 13"',
    enrolledDaysAgo: 1,
    pattern: () => undefined, // enrolled yesterday, no report yet
  },
  {
    id: "dev_acme_12",
    companyId: "cmp_acme",
    ownerId: "emp_acme_chloe",
    model: 'MacBook Pro 13"',
    // has not checked in for 45 days; its last reports said "off"
    pattern: (d) => (d < 45 ? undefined : d < 50 ? false : true),
  },
  {
    id: "dev_globex_01",
    companyId: "cmp_globex",
    ownerId: "emp_globex_gina",
    model: 'MacBook Air 13"',
    pattern: offForLast(9),
  },
  {
    id: "dev_globex_02",
    companyId: "cmp_globex",
    ownerId: "emp_globex_ines",
    model: 'MacBook Pro 14"',
    pattern: always(true),
  },
  {
    id: "dev_globex_03",
    companyId: "cmp_globex",
    ownerId: "emp_globex_jules",
    model: 'MacBook Air 15"',
    pattern: offForLast(8),
  },
  {
    id: "dev_initech_01",
    companyId: "cmp_initech",
    ownerId: "emp_initech_kim",
    model: 'MacBook Pro 16"',
    pattern: always(false),
  },
  {
    id: "dev_initech_02",
    companyId: "cmp_initech",
    ownerId: "emp_initech_leo",
    model: 'MacBook Air 13"',
    pattern: always(true),
  },
];

export function buildSeed(now: Date): Data {
  const devices: Device[] = [];
  const encryptionReports: EncryptionReport[] = [];

  deviceSpecs.forEach((spec, index) => {
    const enrolledDaysAgo = spec.enrolledDaysAgo ?? HISTORY_DAYS + 30;
    let lastSeen = daysAgo(now, enrolledDaysAgo);

    for (let d = Math.min(HISTORY_DAYS, enrolledDaysAgo) - 1; d >= 0; d--) {
      const at = daysAgo(now, d);
      if (at > now) continue;
      const value = spec.pattern(d);
      if (value === undefined) continue;
      encryptionReports.push({
        id: `rep_${spec.id}_${d}`,
        companyId: spec.companyId,
        deviceId: spec.id,
        reportedAt: at.toISOString(),
        diskEncryptionEnabled: value,
      });
      lastSeen = at;
    }

    devices.push({
      id: spec.id,
      companyId: spec.companyId,
      serialNumber: `C02${String(100000 + index * 7919).slice(0, 6)}XYZ`,
      model: spec.model,
      platform: spec.platform ?? "macos",
      ownerId: spec.ownerId,
      enrolledAt: daysAgo(now, enrolledDaysAgo).toISOString(),
      lastSeenAt: lastSeen.toISOString(),
    });
  });

  return {
    companies: structuredClone(companies),
    employees: structuredClone(employees),
    devices,
    encryptionReports,
    outbox: [],
    tickets: [],
  };
}

function emp(
  id: string,
  companyId: string,
  firstName: string,
  lastName: string,
  email: string,
  role: Employee["role"] = "employee",
  status: Employee["status"] = "active",
): Employee {
  return { id, companyId, firstName, lastName, email, role, status };
}
