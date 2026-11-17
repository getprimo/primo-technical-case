// Code never calls `new Date()` for "now": it asks the clock, so tests can pin time.
export interface Clock {
  now(): Date;
}

export const systemClock: Clock = { now: () => new Date() };

export function fixedClock(
  at: Date | string,
): Clock & { set(at: Date | string): void } {
  let current = new Date(at);
  return {
    now: () => new Date(current),
    set: (next) => {
      current = new Date(next);
    },
  };
}
