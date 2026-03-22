const TIMEZONE = 'Asia/Tokyo';

/**
 * JST での今日の日付を YYYY-MM-DD 形式で返す
 */
export function getTodayJST(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: TIMEZONE });
}

/**
 * 2つの日付文字列（YYYY-MM-DD）が同じ日かどうかを返す
 */
export function isSameDay(a: string, b: string): boolean {
  return a === b;
}

/**
 * 完了日付の配列から、today を基準とした連続学習日数（ストリーク）を計算する。
 * 今日が含まれない場合は 0 を返す。
 */
export function calcStreak(completedDates: string[], today: string): number {
  if (completedDates.length === 0) return 0;

  const sorted = [...new Set(completedDates)].sort().reverse();

  if (sorted[0] !== today) return 0;

  let streak = 1;
  let current = today;

  for (let i = 1; i < sorted.length; i++) {
    const expected = getPreviousDay(current);
    if (sorted[i] === expected) {
      streak++;
      current = expected;
    } else {
      break;
    }
  }

  return streak;
}

function getPreviousDay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00+09:00');
  date.setDate(date.getDate() - 1);
  return date.toLocaleDateString('sv-SE', { timeZone: TIMEZONE });
}
