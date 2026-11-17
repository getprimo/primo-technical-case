import type {
  Company,
  Device,
  Employee,
  EncryptionReport,
  OutboxEmail,
  Ticket,
} from "../domain.js";
import type { Db } from "../store/db.js";

// Data access. Every read of tenant data takes the companyId it is scoped to.

export function createRepositories(db: Db) {
  const { data } = db;

  return {
    companies: {
      findById: (id: string): Company | undefined =>
        data.companies.find((c) => c.id === id),
      list: (): Company[] => data.companies,
      updateSettings(
        id: string,
        settings: Record<string, unknown>,
      ): Company | undefined {
        const company = data.companies.find((c) => c.id === id);
        if (!company) return undefined;
        company.settings = { ...company.settings, ...settings };
        db.save();
        return company;
      },
    },

    employees: {
      findById: (companyId: string, id: string): Employee | undefined =>
        data.employees.find((e) => e.companyId === companyId && e.id === id),
      listByCompany: (companyId: string): Employee[] =>
        data.employees.filter((e) => e.companyId === companyId),
      // Used by the auth middleware only: the caller is not authenticated yet, so there is no
      // company to scope to.
      findByIdUnscoped: (id: string): Employee | undefined =>
        data.employees.find((e) => e.id === id),
    },

    devices: {
      listByCompany: (companyId: string | undefined): Device[] =>
        data.devices.filter((d) => !companyId || d.companyId === companyId),
      findById: (companyId: string, id: string): Device | undefined =>
        data.devices.find((d) => d.companyId === companyId && d.id === id),
    },

    encryptionReports: {
      listByDevice: (companyId: string, deviceId: string): EncryptionReport[] =>
        data.encryptionReports
          .filter((r) => r.companyId === companyId && r.deviceId === deviceId)
          .sort((a, b) => a.reportedAt.localeCompare(b.reportedAt)),
      latestByDevice(
        companyId: string,
        deviceId: string,
      ): EncryptionReport | undefined {
        const reports = this.listByDevice(companyId, deviceId);
        return reports[reports.length - 1];
      },
    },

    outbox: {
      insert(email: OutboxEmail): OutboxEmail {
        data.outbox.push(email);
        db.save();
        return email;
      },
      listByCompany: (companyId: string): OutboxEmail[] =>
        data.outbox.filter((e) => e.companyId === companyId),
    },

    tickets: {
      insert(ticket: Ticket): Ticket {
        data.tickets.push(ticket);
        db.save();
        return ticket;
      },
      listByCompany: (companyId: string): Ticket[] =>
        data.tickets.filter((t) => t.companyId === companyId),
    },
  };
}

export type Repositories = ReturnType<typeof createRepositories>;
