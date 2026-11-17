// The entities of mini-Primo. Every entity but Company belongs to exactly one company (tenant).

export interface Company {
  id: string;
  name: string;
  timezone: string; // IANA, e.g. "Europe/Paris"
  settings: Record<string, unknown>;
}

export type EmployeeRole = "admin" | "employee";
export type EmployeeStatus = "active" | "offboarded";

export interface Employee {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: EmployeeRole;
  status: EmployeeStatus;
}

export interface Device {
  id: string;
  companyId: string;
  serialNumber: string;
  model: string;
  platform: "macos" | "windows";
  ownerId: string | null; // null = in stock, not assigned to anyone
  enrolledAt: string; // ISO
  lastSeenAt: string; // ISO, last time the MDM heard from the device
}

// One row per MDM sync (once a day, around 06:00 UTC) per device that checked in since the
// previous sync. A device that did not check in has no row for that day.
// diskEncryptionEnabled is null when the MDM could not read the encryption state.
export interface EncryptionReport {
  id: string;
  companyId: string;
  deviceId: string;
  reportedAt: string; // ISO
  diskEncryptionEnabled: boolean | null;
}

// Every email the platform sends lands here (see services/mailer.ts).
export interface OutboxEmail {
  id: string;
  companyId: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string; // ISO
  tags: Record<string, string>;
}

export type TicketStatus = "open" | "closed";

export interface Ticket {
  id: string;
  companyId: string;
  title: string;
  description: string;
  deviceId: string | null;
  employeeId: string | null;
  status: TicketStatus;
  createdAt: string; // ISO
}
