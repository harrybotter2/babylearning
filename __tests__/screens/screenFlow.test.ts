/**
 * 画面遷移ロジックの検証テスト。
 * App.tsx の表示分岐・buildHomeState・ビルドSettingsState を組み合わせて
 * オンボーディング → ホーム → レッスン → Day178完走 の全フローを検証する。
 */
import { buildHomeState } from '../../src/hooks/useHomeScreen';
import { buildSettingsState } from '../../src/hooks/useSettings';
import { DEFAULT_SETTINGS } from '../../src/hooks/useSettings';
import { TOTAL_DAYS } from '../../src/data/curriculum';

// App.tsx の画面表示分岐ロジックを純粋関数として再現
function resolveScreen(
  settings: ReturnType<typeof buildSettingsState>,
  homeState: ReturnType<typeof buildHomeState>,
): 'onboarding' | 'home' {
  if (!settings.onboardingCompleted) return 'onboarding';
  return 'home';
}

describe('オンボーディング → ホーム 遷移', () => {
  it('onboardingCompleted=false → オンボーディング画面を表示', () => {
    const settings = buildSettingsState(null); // DEFAULT_SETTINGS → onboardingCompleted: false
    const home = buildHomeState([], [], '2026-03-22', 0);
    expect(resolveScreen(settings, home)).toBe('onboarding');
  });

  it('onboardingCompleted=true → ホーム画面を表示', () => {
    const settings = buildSettingsState({
      course_id: '0-6M',
      flash_speed: 1.0,
      sound_enabled: 1,
      notification_time: null,
      baby_birth_date: null,
      onboarding_completed: 1,
    });
    const home = buildHomeState([], [], '2026-03-22', 0);
    expect(resolveScreen(settings, home)).toBe('home');
    expect(settings.onboardingCompleted).toBe(true);
  });

  it('通知なしでオンボーディング完了しても notificationTime=null のままホームへ遷移できる', () => {
    // 通知なし（notificationTime: null）かつ onboardingCompleted: true
    const settings = buildSettingsState({
      course_id: '6-18M',
      flash_speed: 1.0,
      sound_enabled: 1,
      notification_time: null,
      baby_birth_date: null,
      onboarding_completed: 1,
    });
    expect(settings.notificationTime).toBeNull();
    expect(settings.onboardingCompleted).toBe(true);
    const home = buildHomeState([], [], '2026-03-22', 0);
    expect(resolveScreen(settings, home)).toBe('home');
  });
});

describe('ホーム画面の状態遷移', () => {
  const today = '2026-03-22';

  it('Day1 から順番に進められる（Day1→2→3）', () => {
    const p1 = [{ day_number: 1, completed_at: '2026-03-01T10:00:00Z', session_count: 1 }];
    const s1 = buildHomeState(p1, ['2026-03-01'], today, 0);
    expect(s1.currentDay).toBe(2);
    expect(s1.todayDone).toBe(false);

    const p2 = [
      { day_number: 1, completed_at: '2026-03-01T10:00:00Z', session_count: 1 },
      { day_number: 2, completed_at: '2026-03-02T10:00:00Z', session_count: 1 },
    ];
    const s2 = buildHomeState(p2, ['2026-03-01', '2026-03-02'], today, 0);
    expect(s2.currentDay).toBe(3);
  });

  it('今日3セッション完了後は todayDone=true で currentDay が進まない', () => {
    const progress = [
      { day_number: 1, completed_at: '2026-03-20T10:00:00Z', session_count: 1 },
      { day_number: 2, completed_at: '2026-03-22T10:00:00Z', session_count: 1 }, // 今日
    ];
    const state = buildHomeState(progress, ['2026-03-20', '2026-03-22'], today, 3);
    expect(state.todayDone).toBe(true);
    expect(state.currentDay).toBe(2); // Day3 には進まない
  });

  it('1週間（Day7）到達の検証', () => {
    const progress = Array.from({ length: 7 }, (_, i) => ({
      day_number: i + 1,
      completed_at: `2026-03-${String(i + 1).padStart(2, '0')}T10:00:00Z`,
      session_count: 1,
    }));
    const dates = Array.from({ length: 7 }, (_, i) => `2026-03-${String(i + 1).padStart(2, '0')}`);
    const state = buildHomeState(progress, dates, today, 0);
    expect(state.currentDay).toBe(8);
    expect(state.completedDayNumbers.has(7)).toBe(true);
  });

  it('Day50（認識期の最終日）から Day51（等式期）へ進める', () => {
    const progress = Array.from({ length: 50 }, (_, i) => ({
      day_number: i + 1,
      completed_at: `2026-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`,
      session_count: 1,
    }));
    const state = buildHomeState(progress, [], today, 0);
    expect(state.currentDay).toBe(51);
    expect(state.isComplete).toBe(false);
  });

  it('最終日（Day178）まで到達できる', () => {
    const progress = Array.from({ length: TOTAL_DAYS }, (_, i) => ({
      day_number: i + 1,
      completed_at: `2025-01-01T00:00:00Z`,
      session_count: 1,
    }));
    const state = buildHomeState(progress, [], today, 0);
    expect(state.currentDay).toBe(TOTAL_DAYS);
    expect(state.isComplete).toBe(true);
    expect(state.completedDayNumbers.size).toBe(TOTAL_DAYS);
  });

  it('isComplete=false の場合は Day178 未満', () => {
    const progress = Array.from({ length: TOTAL_DAYS - 1 }, (_, i) => ({
      day_number: i + 1,
      completed_at: `2025-01-01T00:00:00Z`,
      session_count: 1,
    }));
    const state = buildHomeState(progress, [], today, 0);
    expect(state.isComplete).toBe(false);
    expect(state.currentDay).toBe(TOTAL_DAYS);
  });
});

describe('DEFAULT_SETTINGS の初期値', () => {
  it('onboardingCompleted のデフォルトは false', () => {
    expect(DEFAULT_SETTINGS.onboardingCompleted).toBe(false);
  });

  it('新規ユーザーは必ずオンボーディングを通る', () => {
    const settings = { ...DEFAULT_SETTINGS };
    expect(settings.onboardingCompleted).toBe(false);
  });
});

describe('全178日カリキュラムの整合性', () => {
  it('178日分の進捗を順番に積み重ねて isComplete になれる', () => {
    // シミュレーション: Day1から1日ずつ完了していく
    let progress: { day_number: number; completed_at: string; session_count: number }[] = [];
    const today = '2026-03-22';

    for (let day = 1; day <= TOTAL_DAYS; day++) {
      progress = [...progress, { day_number: day, completed_at: '2025-01-01T00:00:00Z', session_count: 1 }];
    }

    const state = buildHomeState(progress, [], today, 0);
    expect(state.isComplete).toBe(true);
    expect(state.currentDay).toBe(TOTAL_DAYS);
  });
});
