import { useCallback, useRef, useState } from 'react';
import { buildLessonCards, CourseId, LessonCard } from './useLesson';
import { markComplete, insertSession } from '../db/client';
import { getTodayJST } from '../utils/dateUtils';
import { SESSIONS_PER_DAY } from './useHomeScreen';

export interface SessionSummary {
  date: string;
  lessonDay: number;
  startedAt: string;
  completedAt: string;
}

/**
 * currentIndex >= totalCards のとき完了と判定する純粋関数。
 */
export function isSessionComplete(totalCards: number, currentIndex: number): boolean {
  return currentIndex >= totalCards;
}

/**
 * セッションサマリーオブジェクトを生成する純粋関数。
 */
export function buildSessionSummary(
  date: string,
  lessonDay: number,
  startedAt: string,
  completedAt: string,
): SessionSummary {
  return { date, lessonDay, startedAt, completedAt };
}

interface UseLessonSessionOptions {
  currentDay: number;
  courseId: CourseId;
  soundEnabled: boolean;
  todaySessionCount: number;
  onComplete: () => void;
}

interface LessonSessionState {
  cards: LessonCard[];
  handleFlashComplete: () => Promise<void>;
}

/**
 * レッスンセッションを管理するカスタムフック。
 * FlashCard の onComplete イベントを受け取り、DB保存 + 完了コールバックを実行する。
 * ドーマン法に従い1日3セッション: 3回目のみ markComplete（completed_at を更新）する。
 */
export function useLessonSession({
  currentDay,
  courseId,
  soundEnabled,
  todaySessionCount,
  onComplete,
}: UseLessonSessionOptions): LessonSessionState {
  const [cards] = useState<LessonCard[]>(() =>
    buildLessonCards({ courseId, dayNumber: currentDay }),
  );
  const startedAtRef = useRef(new Date().toISOString());

  // 音声読み上げは FlashCard が soundEnabled を受け取り内部で制御する

  const handleFlashComplete = useCallback(async () => {
    const completedAt = new Date().toISOString();
    const date = getTodayJST();
    const newSessionCount = todaySessionCount + 1;

    try {
      await insertSession(date, currentDay, startedAtRef.current, completedAt);
      // 3回目のセッションが完了した時のみ日を確定させる
      if (newSessionCount >= SESSIONS_PER_DAY) {
        await markComplete(currentDay);
      }
    } finally {
      onComplete();
    }
  }, [currentDay, todaySessionCount, onComplete]);

  return { cards, handleFlashComplete };
}
