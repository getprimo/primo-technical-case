import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type {
  Company,
  Device,
  Employee,
  EncryptionReport,
  OutboxEmail,
  Ticket,
} from "../domain.js";

export interface Data {
  companies: Company[];
  employees: Employee[];
  devices: Device[];
  encryptionReports: EncryptionReport[];
  outbox: OutboxEmail[];
  tickets: Ticket[];
}

// A deliberately tiny database: everything in memory, written to a JSON file after each
// mutation when a file path is given. Repositories are the only code that touches `data`.
export class Db {
  private constructor(
    public data: Data,
    private readonly filePath?: string,
  ) {}

  static inMemory(data: Data): Db {
    return new Db(structuredClone(data));
  }

  static fromFile(filePath: string, seed: () => Data): Db {
    const data = existsSync(filePath)
      ? (JSON.parse(readFileSync(filePath, "utf8")) as Data)
      : seed();
    const db = new Db(data, filePath);
    db.save();
    return db;
  }

  save(): void {
    if (!this.filePath) return;
    mkdirSync(dirname(this.filePath), { recursive: true });
    writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
  }
}
