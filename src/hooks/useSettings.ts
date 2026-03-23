import { useState, useEffect, useCallback } from 'react';
import { SettingsRow, getSettings, updateSettings } from '../db/client';
import { CourseId } from './useLesson';
import { scheduleDailyReminder, cancelDailyReminder, requestNotificationPermission } from '../utils/notifications';

export interface AppSettings {
  courseId: CourseId;
  soundEnabled: boolean;
  notificationTime: string | null;
  babyBirthDate: string | null;
  onboardingCompleted: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  courseId: '0-6M',
  soundEnabled: true,
  notificationTime: null,
  babyBirthDate: null,
  onboardingCompleted: false,
};

/**
 * DBレコードをAppSettingsに変換する純粋関数（テスト可能）。
 */
export function buildSettingsState(row: SettingsRow | null): AppSettings {
  if (!row) return { ...DEFAULT_SETTINGS };
  return {
    courseId: row.course_id as CourseId,
    soundEnabled: row.sound_enabled === 1,
    notificationTime: row.notification_time,
    babyBirthDate: row.baby_birth_date ?? null,
    onboardingCompleted: row.onboarding_completed === 1,
  };
}

/**
 * 設定のロード・保存・通知スケジュールを管理するカスタムフック。
 */
export function useSettings(): {
  settings: AppSettings;
  loading: boolean;
  save: (next: AppSettings) => Promise<void>;
} {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings().then((row) => {
      setSettings(buildSettingsState(row));
      setLoading(false);
    });
  }, []);

  const save = useCallback(async (next: AppSettings) => {
    await updateSettings(next.courseId, 1.0, next.soundEnabled, next.notificationTime, next.babyBirthDate ?? null, next.onboardingCompleted);
    setSettings(next);

    if (next.notificationTime) {
      const granted = await requestNotificationPermission();
      if (granted) {
        await scheduleDailyReminder(next.notificationTime);
      }
    } else {
      await cancelDailyReminder();
    }
  }, []);

  return { settings, loading, save };
}
