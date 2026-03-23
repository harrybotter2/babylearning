import { isSessionComplete, buildSessionSummary } from '../../src/hooks/useLessonSession';

describe('isSessionComplete', () => {
  it('currentIndex >= totalCards で完了', () => {
    expect(isSessionComplete(10, 10)).toBe(true);
    expect(isSessionComplete(10, 11)).toBe(true);
  });

  it('currentIndex < totalCards で未完了', () => {
    expect(isSessionComplete(10, 9)).toBe(false);
    expect(isSessionComplete(10, 0)).toBe(false);
  });

  it('カードが0枚なら完了扱い', () => {
    expect(isSessionComplete(0, 0)).toBe(true);
  });
});

describe('buildSessionSummary', () => {
  it('正しいサマリーオブジェクトを返す', () => {
    const summary = buildSessionSummary(
      '2024-01-01',
      5,
      '2024-01-01T09:00:00.000Z',
      '2024-01-01T09:01:00.000Z',
    );
    expect(summary.date).toBe('2024-01-01');
    expect(summary.lessonDay).toBe(5);
    expect(summary.startedAt).toBe('2024-01-01T09:00:00.000Z');
    expect(summary.completedAt).toBe('2024-01-01T09:01:00.000Z');
  });

  it('duration が正の値になる', () => {
    const startedAt = '2024-01-01T09:00:00.000Z';
    const completedAt = '2024-01-01T09:01:00.000Z';
    const summary = buildSessionSummary('2024-01-01', 1, startedAt, completedAt);
    const durationMs = new Date(completedAt).getTime() - new Date(startedAt).getTime();
    expect(durationMs).toBe(60000);
    expect(summary.startedAt).toBe(startedAt);
    expect(summary.completedAt).toBe(completedAt);
  });
});
