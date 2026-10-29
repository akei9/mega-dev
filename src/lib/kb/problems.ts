// #4471 split into the problems its reports show. Counted the desk's way: each report under the cause
// its tenant and form point to (causes.ts). The reports the desk read as a one-day move
// (desk-notes.json) stay counted where they're filed, and are a problem of their own on top.
import { groupByCause, readAs, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = Cause | 'one-day';

export type ProblemRow = {
  problem: Problem | 'unplaced';
  reports: Report[];
  tenants: number;
  firstSeen: string;
  lastSeen: string;
  // Reports intake tagged as something else (`meta.intakeTag` is a guess from the browser).
  taggedOther: number;
  // For one-day: the cause each of its reports is counted under. Empty for the others.
  countedUnder: string[];
};

export function splitTicket(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDay: readonly string[],
): { merged: number; rows: ProblemRow[] } {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const groups = groupByCause(merged, tenantOf);
  const rows: ProblemRow[] = groups.map((g) => ({
    problem: g.cause,
    reports: g.reports,
    tenants: g.tenants,
    firstSeen: g.firstSeen,
    lastSeen: g.lastSeen,
    taggedOther: g.reports.filter((r) => r.meta.intakeTag !== g.cause).length,
    countedUnder: [],
  }));

  const moved = merged.filter((r) => oneDay.includes(r.id));
  if (moved.length) {
    const days = moved.map((r) => r.receivedAt.slice(0, 10)).sort();
    rows.push({
      problem: 'one-day',
      reports: moved,
      tenants: new Set(moved.map((r) => r.tenant)).size,
      firstSeen: days[0],
      lastSeen: days[days.length - 1],
      taggedOther: moved.length,
      countedUnder: groups.filter((g) => readAs(g, oneDay) > 0).map((g) => g.cause),
    });
  }
  return { merged: merged.length, rows };
}
