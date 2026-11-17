# mini-Primo

Read this before working in the repository. `CLAUDE.md` is a symlink to this file.

## What this is

A small version of Primo, a platform that manages the laptops of companies. A **company** is a
customer (a tenant). It has **employees**; some are admins. Employees are assigned **devices**.
An MDM checks the devices every day and writes one **encryption report** per device that checked
in. The platform sends **emails** and opens **tickets** for the company's IT team.

## Layout

```
apps/api            Express + TypeScript API
  src/domain.ts       the entities
  src/app.ts          wiring: routes, middleware, dependencies
  src/routes/         HTTP routes, one file per area
  src/jobs/           scheduled jobs (see below)
  src/services/       mailer, compliance
  src/repositories/   data access, the only code that touches the database
  src/store/          the JSON-file database and the seed
  test/               tests (*.test.ts through HTTP, *.spec.ts for pure functions)
apps/web            React + Vite app, talks to the API through src/api.ts
```

## Commands

| What                      | Command          |
| ------------------------- | ---------------- |
| Run API + web             | `npm run dev`    |
| Typecheck + tests         | `npm run check`  |
| Tests only                | `npm test`       |
| Wipe local data           | `npm run reset`  |
| Pack your work to send it | `npm run submit` |

Run `npm run check` before every commit.

## Rules of the codebase

- **Tenancy.** Every request acts for one company: `auth(req).companyId`. Every read and write of
  tenant data is scoped to it. A user must never see or change another company's data.
- **Time.** Never call `new Date()` for "now": take the `Clock` from the dependencies. Tests pin
  it with `fixedClock`. Dates are stored as ISO strings in UTC.
- **Emails** go through `services/mailer.ts` only. Nothing is really sent: emails land in the
  outbox (`GET /api/outbox`).
- **Tickets** are rows in `tickets` (`GET /api/tickets`). They are read by the company's IT team.
- **Data access** goes through `repositories/`. Add a repository function rather than reaching
  into `db.data` from a route or a job.
- **Tests.** Every behaviour change comes with a test. A bug fix comes with a test that fails
  before the fix. Route tests go through HTTP with `supertest` and `makeTestApp()`.

## Scheduled jobs

A job is a `POST /internal/jobs/<name>` endpoint, protected by the `x-job-key` header. The
scheduler calls it at a fixed time (Europe/Paris). It is a third-party scheduler, and like most of
them it delivers **at least once**: when a call times out (30 s) or fails, it calls again.

To run a job locally:

```bash
curl -X POST localhost:4000/internal/jobs/stale-devices-digest -H 'x-job-key: local-job-key'
```

## The MDM data

- `encryptionReports` holds one row per device per daily sync (around 06:00 UTC), only for the
  devices that checked in since the previous sync. A device that is off or offline has no row.
- `diskEncryptionEnabled` is `true`, `false`, or `null` when the MDM could not read the state.
- `device.lastSeenAt` is the last time the MDM heard from the device.
