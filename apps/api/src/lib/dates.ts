const DAY_MS = 24 * 60 * 60 * 1000;

export function daysAgo(now: Date, days: number, hourUtc = 6): Date {
  const d = new Date(now.getTime() - days * DAY_MS);
  d.setUTCHours(hourUtc, 0, 0, 0);
  return d;
}

export function daysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / DAY_MS);
}
