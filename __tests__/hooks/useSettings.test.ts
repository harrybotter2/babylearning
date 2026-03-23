import { buildSettingsState, DEFAULT_SETTINGS } from '../../src/hooks/useSettings';

describe('buildSettingsState', () => {
  it('DBレコードがnullの場合はデフォルト設定を返す', () => {
    const result = buildSettingsState(null);
    expect(result).toEqual(DEFAULT_SETTINGS);
  });

  it('DBレコードからAppSettingsを正しく変換する', () => {
    const row = {
      course_id: '6-18M',
      flash_speed: 1.0,
      sound_enabled: 1,
      notification_time: '08:00',
      baby_birth_date: null,
      onboarding_completed: 1,
    };
    const result = buildSettingsState(row);
    expect(result.courseId).toBe('6-18M');
    expect(result.soundEnabled).toBe(true);
    expect(result.notificationTime).toBe('08:00');
  });

  it('sound_enabled=0 の場合 soundEnabled=false', () => {
    const row = {
      course_id: '0-6M',
      flash_speed: 1.0,
      sound_enabled: 0,
      notification_time: null,
      baby_birth_date: null,
      onboarding_completed: 0,
    };
    const result = buildSettingsState(row);
    expect(result.soundEnabled).toBe(false);
    expect(result.notificationTime).toBeNull();
  });

  it('全コースIDが許容される', () => {
    const courses = ['0-6M', '6-18M', '18-36M'] as const;
    courses.forEach((courseId) => {
      const row = {
        course_id: courseId,
        flash_speed: 1.0,
        sound_enabled: 1,
        notification_time: null,
        baby_birth_date: null,
        onboarding_completed: 0,
      };
      const result = buildSettingsState(row);
      expect(result.courseId).toBe(courseId);
    });
  });

  it('onboarding_completed=1 の場合 onboardingCompleted=true', () => {
    const row = {
      course_id: '0-6M',
      flash_speed: 1.0,
      sound_enabled: 1,
      notification_time: null,
      baby_birth_date: null,
      onboarding_completed: 1,
    };
    const result = buildSettingsState(row);
    expect(result.onboardingCompleted).toBe(true);
  });

  it('onboarding_completed=0 の場合 onboardingCompleted=false', () => {
    const row = {
      course_id: '0-6M',
      flash_speed: 1.0,
      sound_enabled: 1,
      notification_time: null,
      baby_birth_date: null,
      onboarding_completed: 0,
    };
    const result = buildSettingsState(row);
    expect(result.onboardingCompleted).toBe(false);
  });

  it('DEFAULT_SETTINGS は onboardingCompleted=false', () => {
    expect(DEFAULT_SETTINGS.onboardingCompleted).toBe(false);
  });
});
