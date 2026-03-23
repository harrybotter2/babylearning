export type MilestoneType = 'first_lesson' | 'week_1' | 'month_1' | 'complete';

const TOTAL_DAYS = 178;

const MILESTONE_MAP: Record<number, MilestoneType> = {
  1: 'first_lesson',
  7: 'week_1',
  30: 'month_1',
  178: 'complete',
};

/**
 * 完了した日の翌日を返す。178日完了後は178のまま。
 */
export function calcNextDay(lastCompletedDay: number): number {
  if (lastCompletedDay <= 0) return 1;
  if (lastCompletedDay >= TOTAL_DAYS) return TOTAL_DAYS;
  return lastCompletedDay + 1;
}

/**
 * 指定した日のマイルストーン一覧を返す。
 */
export function buildMilestoneCheck(dayNumber: number): MilestoneType[] {
  const milestone = MILESTONE_MAP[dayNumber];
  return milestone ? [milestone] : [];
}
