// SQLiteはデバイス依存のため、repositoryのロジック層をモックでテスト
import {
  buildInsertSession,
  buildMarkComplete,
  buildGetProgress,
  buildGetTodaySessionCount,
  buildGetCompletedDates,
} from '../../src/db/repository';

describe('buildInsertSession', () => {
  it('正しいSQL文を生成する', () => {
    const sql = buildInsertSession('2026-03-22', 5, '2026-03-22T09:00:00Z', '2026-03-22T09:01:00Z');
    expect(sql).toContain('INSERT INTO daily_sessions');
    expect(sql).toContain('2026-03-22');
  });
});

describe('buildMarkComplete', () => {
  it('正しいSQL文を生成する', () => {
    const sql = buildMarkComplete(5, '2026-03-22T09:01:00Z');
    expect(sql).toContain('UPDATE lesson_progress');
    expect(sql).toContain('day_number = 5');
  });
});

describe('buildGetProgress', () => {
  it('SELECT文を返す', () => {
    const sql = buildGetProgress();
    expect(sql).toContain('SELECT');
    expect(sql).toContain('lesson_progress');
  });
});

describe('buildGetTodaySessionCount', () => {
  it('日付とday番号を含むCOUNTクエリを生成する', () => {
    const sql = buildGetTodaySessionCount('2026-03-22', 5);
    expect(sql).toContain('COUNT(*)');
    expect(sql).toContain('daily_sessions');
    expect(sql).toContain('2026-03-22');
    expect(sql).toContain('5');
  });
});

describe('buildGetCompletedDates', () => {
  it('lesson_progressとのJOINクエリを生成する（完全完了した日のみ）', () => {
    const sql = buildGetCompletedDates();
    expect(sql).toContain('daily_sessions');
    expect(sql).toContain('lesson_progress');
    expect(sql).toContain('completed_at IS NOT NULL');
  });
});
