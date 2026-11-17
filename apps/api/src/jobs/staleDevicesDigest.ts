import type { Clock } from "../lib/clock.js";
import { daysBetween } from "../lib/dates.js";
import type { Repositories } from "../repositories/index.js";
import type { Mailer } from "../services/mailer.js";

const STALE_AFTER_DAYS = 30;

// Weekly job: emails each company's admins the list of devices that have not checked in for
// 30 days. Called by the scheduler every Monday at 09:00 Europe/Paris.
export function runStaleDevicesDigest(deps: {
  repos: Repositories;
  mailer: Mailer;
  clock: Clock;
}) {
  const { repos, mailer, clock } = deps;
  const now = clock.now();
  let sent = 0;

  for (const company of repos.companies.list()) {
    const stale = repos.devices
      .listByCompany(company.id)
      .filter(
        (d) => daysBetween(new Date(d.lastSeenAt), now) >= STALE_AFTER_DAYS,
      );
    if (stale.length === 0) continue;

    const admins = repos.employees
      .listByCompany(company.id)
      .filter((e) => e.role === "admin" && e.status === "active");
    const lines = stale.map(
      (d) =>
        `- ${d.model} (${d.serialNumber}), last seen ${d.lastSeenAt.slice(0, 10)}`,
    );

    for (const admin of admins) {
      mailer.send({
        companyId: company.id,
        to: admin.email,
        subject: `${stale.length} device(s) have not checked in for ${STALE_AFTER_DAYS} days`,
        body: `Hi ${admin.firstName},\n\nThese devices have not been seen recently:\n${lines.join("\n")}\n`,
        tags: { kind: "stale-devices-digest" },
      });
      sent++;
    }
  }

  return { sent };
}
