import type { Experience } from "../data/experiences";

export interface StripRoleSegment {
  readonly kind: "role";
  readonly experience: Experience;
  readonly start: string;
  readonly end: string;
  /** Segment width as a percentage of the strip. */
  readonly width: number;
  /** "Ringkas · Software Engineer" */
  readonly label: string;
  /** Width of the name label: the segment plus any gap that follows it. */
  readonly labelWidth: number;
}

export interface StripGapSegment {
  readonly kind: "gap";
  readonly start: string;
  readonly end: string;
  readonly width: number;
  /** Months covered by the gap, e.g. "SEP–NOV 2022". */
  readonly label: string;
  /** Left edge of the gap, as a percentage of the strip. */
  readonly offset: number;
}

export type StripSegment = StripRoleSegment | StripGapSegment;

export interface StripTick {
  readonly label: string;
  /** Position as a percentage of the strip. */
  readonly position: number;
}

export interface SeasonStrip {
  readonly segments: readonly StripSegment[];
  readonly ticks: readonly StripTick[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
const DAY_MS = 86_400_000;
/** Year ticks closer than this to either end of the strip are dropped. */
const TICK_EDGE_CLEARANCE = 6;

/** "Aug 2024" → UTC midnight on the 1st of that month. */
export function parseMonth(value: string): Date {
  const match = /^([A-Z][a-z]{2}) (\d{4})$/.exec(value.trim());
  const month = match ? MONTHS.indexOf(match[1] as (typeof MONTHS)[number]) : -1;
  if (!match || month < 0) throw new Error(`Unrecognised month: "${value}"`);
  return new Date(Date.UTC(Number(match[2]), month, 1));
}

function addMonths(date: Date, months: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function monthLabel(date: Date): string {
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** Months from `start` up to (not including) `end`: "SEP–NOV 2022", "NOV 2022–JAN 2023", "SEP 2022". */
function gapLabel(start: Date, end: Date): string {
  const last = addMonths(end, -1);
  const first = MONTHS[start.getUTCMonth()].toUpperCase();
  const final = MONTHS[last.getUTCMonth()].toUpperCase();
  if (start.getTime() === last.getTime()) return `${first} ${start.getUTCFullYear()}`;
  if (start.getUTCFullYear() === last.getUTCFullYear()) return `${first}–${final} ${last.getUTCFullYear()}`;
  return `${first} ${start.getUTCFullYear()}–${final} ${last.getUTCFullYear()}`;
}

/**
 * Chronological (left → right) day-scale strip from the first role's start month to `now`.
 * A role starts on the 1st of its start month and ends on the 1st of the month after its
 * `endDate`, so it covers its whole end month. Time between roles becomes a gap segment.
 */
export function seasonStrip(experiences: readonly Experience[], now: Date): SeasonStrip {
  const today = startOfUtcDay(now);
  const roles = [...experiences]
    .map((experience) => ({
      experience,
      start: parseMonth(experience.startDate),
      end: experience.endDate === null ? today : addMonths(parseMonth(experience.endDate), 1),
    }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  if (roles.length === 0) return { segments: [], ticks: [] };

  const origin = roles[0].start;
  const span = today.getTime() - origin.getTime();
  if (span <= 0) throw new Error("seasonStrip: `now` must be after the first start date");
  const pct = (date: Date): number => ((Math.min(date.getTime(), today.getTime()) - origin.getTime()) / span) * 100;

  const segments: StripSegment[] = [];
  roles.forEach((role, i) => {
    const width = pct(role.end) - pct(role.start);
    const next = roles[i + 1];
    const gapWidth = next && next.start > role.end ? pct(next.start) - pct(role.end) : 0;
    segments.push({
      kind: "role",
      experience: role.experience,
      start: isoDay(role.start),
      end: isoDay(role.end),
      width,
      label: `${role.experience.shortCompany} · ${role.experience.jobTitle}`,
      labelWidth: width + gapWidth,
    });
    if (gapWidth > 0) {
      segments.push({
        kind: "gap",
        start: isoDay(role.end),
        end: isoDay(next.start),
        width: gapWidth,
        label: gapLabel(role.end, next.start),
        offset: pct(role.end),
      });
    }
  });

  const ticks: StripTick[] = [{ label: monthLabel(origin), position: 0 }];
  for (let year = origin.getUTCFullYear() + 1; year <= today.getUTCFullYear(); year++) {
    const position = pct(new Date(Date.UTC(year, 0, 1)));
    if (position > TICK_EDGE_CLEARANCE && position < 100 - TICK_EDGE_CLEARANCE) {
      ticks.push({ label: String(year), position });
    }
  }
  ticks.push({ label: "Now", position: 100 });

  return { segments, ticks };
}

/** Items (e.g. certifications) whose "Mon YYYY" date falls inside a gap segment. */
export function datedWithin<T extends { readonly date: string }>(
  items: readonly T[],
  gap: StripGapSegment,
): readonly T[] {
  const start = new Date(`${gap.start}T00:00:00Z`).getTime();
  const end = new Date(`${gap.end}T00:00:00Z`).getTime();
  return items
    .filter((item) => {
      const at = parseMonth(item.date).getTime();
      return at >= start && at < end;
    })
    .sort((a, b) => parseMonth(a.date).getTime() - parseMonth(b.date).getTime());
}
