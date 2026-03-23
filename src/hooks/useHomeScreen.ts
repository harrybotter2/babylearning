import { useState, useEffect, useCallback } from 'react';
import { ProgressRow, getProgress, getCompletedDates, getTodaySessionCount } from '../db/client';
import { calcNextDay } from './useProgress';
import { calcStreak, getTodayJST } from '../utils/dateUtils';
import { TOTAL_DAYS } from '../data/curriculum';

export const SESSIONS_PER_DAY = 3;

export interface HomeState {
  currentDay: number;
  streak: number;
  completedDayNumbers: Set<number>;
  todayDone: boolean;
  todaySessionCount: number;
  isComplete: boolean;
  loading: boolean;
}

/**
 * DBから取得したデータをホーム画面表示用の状態に変換する純粋関数。
 * テスト可能にするためフックから分離する。
 */
export function buildHomeState(
  progress: ProgressRow[],
  completedDates: string[],
  today: string,
  todaySessionCount: number,
): Omit<HomeState, 'loading'> {
  const completed = progress.filter((p) => p.completed_at !== null);
  const lastCompleted = completed.length > 0 ? Math.max(...completed.map((p) => p.day_number)) : 0;
  const todayDone = todaySessionCount >= SESSIONS_PER_DAY;

  // 今日3回完了済みなら currentDay を進めない（翌日分を先に見せない）
  const currentDay = todayDone ? Math.max(1, lastCompleted) : calcNextDay(lastCompleted);

  const completedDayNumbers = new Set(completed.map((p) => p.day_number));
  const streak = calcStreak(completedDates, today);
  const isComplete = lastCompleted >= TOTAL_DAYS;

  return { currentDay, streak, completedDayNumbers, todayDone, todaySessionCount, isComplete };
}

/**
 * DBからホーム画面に必要なデータをロードするカスタムフック。
 */
export function useHomeScreen(): HomeState & { reload: () => Promise<void> } {
  const [state, setState] = useState<HomeState>({
    currentDay: 1,
    streak: 0,
    completedDayNumbers: new Set(),
    todayDone: false,
    todaySessionCount: 0,
    isComplete: false,
    loading: true,
  });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const [progress, completedDates] = await Promise.all([getProgress(), getCompletedDates()]);
      const today = getTodayJST();
      const completed = progress.filter((p) => p.completed_at !== null);
      const lastCompleted = completed.length > 0 ? Math.max(...completed.map((p) => p.day_number)) : 0;
      const nextDay = calcNextDay(lastCompleted);
      const todaySessionCount = await getTodaySessionCount(today, nextDay);
      const computed = buildHomeState(progress, completedDates, today, todaySessionCount);
      setState({ ...computed, loading: false });
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}
