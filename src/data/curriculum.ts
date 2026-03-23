export type Phase = 'recognition' | 'equation' | 'abstraction' | 'deepening';

export interface CurriculumDay {
  dayNumber: number;
  phase: Phase;
  dotsPerSession: number;
  sessionsPerDay: number;
  equationsPerSession: number;
}

export const TOTAL_DAYS = 178;

const PHASE_RANGES: { phase: Phase; from: number; to: number }[] = [
  { phase: 'recognition', from: 1,   to: 50  },
  { phase: 'equation',    from: 51,  to: 100 },
  { phase: 'abstraction', from: 101, to: 140 },
  { phase: 'deepening',   from: 141, to: 178 },
];

export function getPhase(dayNumber: number): Phase {
  const found = PHASE_RANGES.find((r) => dayNumber >= r.from && dayNumber <= r.to);
  if (!found) throw new RangeError(`Day ${dayNumber} is out of range (1-${TOTAL_DAYS})`);
  return found.phase;
}

/**
 * 指定した日のカリキュラム定義を返す。
 * 要件書 §6.2 の178日プログラム構成に準拠。
 */
export function getCurriculumDay(dayNumber: number): CurriculumDay {
  if (dayNumber < 1 || dayNumber > TOTAL_DAYS) {
    throw new RangeError(`Day ${dayNumber} is out of range (1-${TOTAL_DAYS})`);
  }

  const phase = getPhase(dayNumber);

  switch (phase) {
    case 'recognition':
      return { dayNumber, phase, dotsPerSession: 10, sessionsPerDay: 3, equationsPerSession: 0 };
    case 'equation':
      return { dayNumber, phase, dotsPerSession: 10, sessionsPerDay: 3, equationsPerSession: 3 };
    case 'abstraction':
      return { dayNumber, phase, dotsPerSession: 10, sessionsPerDay: 3, equationsPerSession: 3 };
    case 'deepening':
      return { dayNumber, phase, dotsPerSession: 8,  sessionsPerDay: 3, equationsPerSession: 5 };
  }
}
