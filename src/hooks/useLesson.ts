export type CourseId = '0-6M' | '6-18M' | '18-36M';

export interface LessonCard {
  type: 'dots' | 'equation';
  count: number;
  flashSpeedMs: number;
  // 等式カード用（type === 'equation'）
  operandA?: number;
  operandB?: number;
  operator?: '+' | '-';
  result?: number;
}

const FLASH_SPEED: Record<CourseId, number> = {
  '0-6M': 1500,
  '6-18M': 1000,
  '18-36M': 700,
};

const DOTS_PER_SESSION = 10;
const EQUATIONS_PER_SESSION_PHASE2 = 3;
const EQUATIONS_PER_SESSION_PHASE4 = 5;
const DOTS_PER_SESSION_PHASE4 = 8;

interface BuildLessonOptions {
  courseId: CourseId;
  dayNumber: number;
}

/**
 * 指定した日のレッスンカード一覧を生成する。
 * - Phase 1 (Day 1-50): 10枚のドットカードのみ
 * - Phase 2 (Day 51-100): 10枚ドット + 3等式
 * - Phase 3 (Day 101-140): 10枚ドット + 3等式（多様表象）
 * - Phase 4 (Day 141-178): 8枚ドット + 5等式
 */
export function buildLessonCards({ courseId, dayNumber }: BuildLessonOptions): LessonCard[] {
  const flashSpeedMs = FLASH_SPEED[courseId];
  const cards: LessonCard[] = [];

  const dotsCount = dayNumber >= 141 ? DOTS_PER_SESSION_PHASE4 : DOTS_PER_SESSION;
  const dotCards = generateDotCards(dotsCount, dayNumber, flashSpeedMs);
  cards.push(...dotCards);

  if (dayNumber >= 51) {
    const eqCount = dayNumber >= 141 ? EQUATIONS_PER_SESSION_PHASE4 : EQUATIONS_PER_SESSION_PHASE2;
    const eqCards = generateEquationCards(eqCount, dayNumber, flashSpeedMs);
    cards.push(...eqCards);
  }

  return cards;
}

function generateDotCards(count: number, dayNumber: number, flashSpeedMs: number): LessonCard[] {
  const numbers = pickUniqueNumbers(count, dayNumber);
  return numbers.map((n) => ({
    type: 'dots' as const,
    count: n,
    flashSpeedMs,
  }));
}

function generateEquationCards(count: number, dayNumber: number, flashSpeedMs: number): LessonCard[] {
  const cards: LessonCard[] = [];
  for (let i = 0; i < count; i++) {
    const operator: '+' | '-' = Math.random() < 0.7 ? '+' : '-';
    const maxNum = Math.min(50, 10 + Math.floor(dayNumber / 10));
    const a = Math.floor(Math.random() * maxNum) + 1;
    const b = operator === '+' ? Math.floor(Math.random() * (maxNum - a)) + 1 : Math.floor(Math.random() * a) + 1;
    const result = operator === '+' ? a + b : a - b;
    cards.push({
      type: 'equation',
      count: result,
      flashSpeedMs,
      operandA: a,
      operandB: b,
      operator,
      result,
    });
  }
  return cards;
}

/**
 * 連続して同じ数が出ないようにシャッフルした数列を生成する。
 * dayNumber をシードとして使い、日ごとに異なる数列を生成する。
 */
function pickUniqueNumbers(count: number, dayNumber: number): number[] {
  // Weber則: 比率1:2から始まり段階的に難しくなる数列を用意
  const pool = buildNumberPool(dayNumber);
  const shuffled = seededShuffle(pool, dayNumber + Date.now());

  const result: number[] = [];
  for (const n of shuffled) {
    if (result.length >= count) break;
    if (result.length === 0 || result[result.length - 1] !== n) {
      result.push(n);
    }
  }

  // 足りない場合は補完
  while (result.length < count) {
    const candidate = Math.floor(Math.random() * 100) + 1;
    if (result[result.length - 1] !== candidate) {
      result.push(candidate);
    }
  }

  return result;
}

/**
 * dayNumber に応じた難易度の数プールを生成する。
 * 比率依存設計: 初期は大きな比率（1:2）、後半は小さな比率（5:6）
 */
function buildNumberPool(dayNumber: number): number[] {
  if (dayNumber <= 20) {
    // Phase 1 初期: 大きな比率（1:2）のペア — 比較しやすい
    return [2, 4, 6, 8, 10, 20, 40, 60, 80, 100, 3, 6, 9, 12, 15, 30, 45, 60, 75, 90];
  } else if (dayNumber <= 50) {
    // Phase 1 後半: 中程度の比率（3:4）
    return Array.from({ length: 50 }, (_, i) => (i + 1) * 2);
  } else {
    // Phase 2以降: より細かい比率（5:6）、全域から
    return Array.from({ length: 100 }, (_, i) => i + 1);
  }
}

function seededShuffle(arr: number[], seed: number): number[] {
  const copy = [...arr];
  let s = seed % 2147483647;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
