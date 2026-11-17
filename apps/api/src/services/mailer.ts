import type { OutboxEmail } from "../domain.js";
import type { Clock } from "../lib/clock.js";
import { newId } from "../lib/ids.js";
import type { Repositories } from "../repositories/index.js";

export interface SendEmailInput {
  companyId: string;
  to: string;
  subject: string;
  body: string;
  // Free-form labels kept with the email, e.g. { kind: 'stale-devices-digest' }.
  tags?: Record<string, string>;
}

// The only way to send an email. In this case study nothing leaves the machine: emails are
// written to the outbox, which you can read with GET /api/outbox.
export function createMailer(repos: Repositories, clock: Clock) {
  return {
    send(input: SendEmailInput): OutboxEmail {
      return repos.outbox.insert({
        id: newId("mail"),
        companyId: input.companyId,
        to: input.to,
        subject: input.subject,
        body: input.body,
        sentAt: clock.now().toISOString(),
        tags: input.tags ?? {},
      });
    },
  };
}

export type Mailer = ReturnType<typeof createMailer>;
