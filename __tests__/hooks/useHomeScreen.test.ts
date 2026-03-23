/**
 * useHomeScreen のロジック（純粋関数部分）のユニットテスト。
 */
import { buildHomeState, SESSIONS_PER_DAY } from '../../src/hooks/useHomeScreen';

describe('buildHomeState', () => {
  it('completedDays が空の場合は currentDay=1, streak=0', () => {
    const today = '2024-01-10';
    const state = buildHomeState([], [], today, 0);

    expect(state.currentDay).toBe(1);
    expect(state.streak).toBe(0);
    expect(state.completedDayNumbers.size).toBe(0);
    expect(state.todaySessionCount).toBe(0);
  });

  it('Day 1-3 が過去に完了 かつ 今日未完了 → currentDay=4', () => {
    const today = '2024-01-04';
    const progress = [
      { day_number: 1, completed_at: '2024-01-01T10:00:00Z', session_count: 1 },
      { day_number: 2, completed_at: '2024-01-02T10:00:00Z', session_count: 1 },
      { day_number: 3, completed_at: '2024-01-03T10:00:00Z', session_count: 1 },
    ];
    const completedDates = ['2024-01-01', '2024-01-02', '2024-01-03'];

    const state = buildHomeState(progress, completedDates, today, 0);

    expect(state.currentDay).toBe(4);
    expect(state.completedDayNumbers.has(1)).toBe(true);
    expect(state.completedDayNumbers.has(3)).toBe(true);
    expect(state.completedDayNumbers.has(4)).toBe(false);
  });

  it('今日3セッション完了していれば currentDay は進まない（同じ日のレッスン繰り返し可能）', () => {
    const today = '2024-01-04';
    const progress = [
      { day_number: 1, completed_at: '2024-01-01T10:00:00Z', session_count: 1 },
      { day_number: 2, completed_at: '2024-01-02T10:00:00Z', session_count: 1 },
      { day_number: 3, completed_at: '2024-01-03T10:00:00Z', session_count: 1 },
      { day_number: 4, completed_at: '2024-01-04T10:00:00Z', session_count: 1 },
    ];
    const completedDates = ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04'];

    const state = buildHomeState(progress, completedDates, today, SESSIONS_PER_DAY);

    // 今日完了済みなので Day 4 のまま（Day 5 に進まない）
    expect(state.currentDay).toBe(4);
    expect(state.todayDone).toBe(true);
  });

  it('178日完了した場合は currentDay=178 のまま（完走）', () => {
    const today = '2024-06-30';
    const progress = Array.from({ length: 178 }, (_, i) => ({
      day_number: i + 1,
      completed_at: `2024-0${Math.floor(i / 30) + 1}-01T00:00:00Z`,
      session_count: 1,
    }));

    const state = buildHomeState(progress, [], today, 0);
    expect(state.currentDay).toBe(178);
    expect(state.isComplete).toBe(true);
  });

  it('todaySessionCount >= 3 の場合 todayDone=true', () => {
    const today = '2024-01-05';
    const progress = [
      { day_number: 1, completed_at: '2024-01-01T10:00:00Z', session_count: 1 },
      { day_number: 2, completed_at: '2024-01-05T10:00:00Z', session_count: 1 },
    ];
    const completedDates = ['2024-01-01', '2024-01-05'];

    const state = buildHomeState(progress, completedDates, today, 3);
    expect(state.todayDone).toBe(true);
    expect(state.currentDay).toBe(2);
  });

  it('todaySessionCount < 3 なら todayDone=false', () => {
    const today = '2024-01-05';
    const progress = [
      { day_number: 1, completed_at: '2024-01-01T10:00:00Z', session_count: 1 },
    ];
    const completedDates = ['2024-01-01'];

    const state = buildHomeState(progress, completedDates, today, 1);
    expect(state.todayDone).toBe(false);
    expect(state.todaySessionCount).toBe(1);
    expect(state.currentDay).toBe(2);
  });

  it('今日未完了なら todayDone=false かつ currentDay が進む', () => {
    const today = '2024-01-05';
    const progress = [
      { day_number: 1, completed_at: '2024-01-01T10:00:00Z', session_count: 1 },
    ];
    const completedDates = ['2024-01-01'];

    const state = buildHomeState(progress, completedDates, today, 0);
    expect(state.todayDone).toBe(false);
    expect(state.currentDay).toBe(2);
  });

  it('SESSIONS_PER_DAY は 3', () => {
    expect(SESSIONS_PER_DAY).toBe(3);
  });
});
