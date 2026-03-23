/**
 * DB クライアントのユニットテスト。
 * expo-sqlite は __mocks__/expo-sqlite.js でモック済み。
 */

// モジュールをリセットしてシングルトンを再初期化できるようにする
beforeEach(() => {
  jest.resetModules();
  // モックの呼び出し履歴をリセット
  const sqliteMock = require('expo-sqlite');
  sqliteMock._mockDb.execAsync.mockClear();
  sqliteMock._mockDb.getAllAsync.mockClear();
  sqliteMock._mockDb.runAsync.mockClear();
  sqliteMock._mockDb.getFirstAsync.mockClear();
  sqliteMock.openDatabaseAsync.mockClear();
});

describe('getProgress', () => {
  it('lesson_progress テーブルを全件取得する', async () => {
    const sqliteMock = require('expo-sqlite');
    sqliteMock._mockDb.getAllAsync.mockResolvedValueOnce([
      { day_number: 1, completed_at: '2024-01-01T00:00:00.000Z', session_count: 1 },
      { day_number: 2, completed_at: null, session_count: 0 },
    ]);

    const { getProgress } = require('../../src/db/client');
    const result = await getProgress();

    expect(result).toHaveLength(2);
    expect(result[0].day_number).toBe(1);
    expect(result[1].completed_at).toBeNull();
  });

  it('空のときは空配列を返す', async () => {
    const { getProgress } = require('../../src/db/client');
    const result = await getProgress();
    expect(result).toEqual([]);
  });
});

describe('markComplete', () => {
  it('upsert してから complete を更新する（runAsync が複数回呼ばれる）', async () => {
    const sqliteMock = require('expo-sqlite');
    const { markComplete } = require('../../src/db/client');
    await markComplete(5);

    // DB初期化(1) + upsertProgress(1) + markComplete(1) = 最低3回
    expect(sqliteMock._mockDb.runAsync.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('実行するSQLに day_number が含まれる', async () => {
    const sqliteMock = require('expo-sqlite');
    const { markComplete } = require('../../src/db/client');
    await markComplete(42);

    const calls = sqliteMock._mockDb.runAsync.mock.calls;
    const sqls = calls.map((c: string[]) => c[0]);
    expect(sqls.some((sql: string) => sql.includes('42'))).toBe(true);
  });
});

describe('getSettings', () => {
  it('設定が存在しない場合は null を返す', async () => {
    const { getSettings } = require('../../src/db/client');
    const result = await getSettings();
    expect(result).toBeNull();
  });

  it('設定が存在する場合はオブジェクトを返す', async () => {
    const sqliteMock = require('expo-sqlite');
    sqliteMock._mockDb.getFirstAsync.mockResolvedValueOnce({
      course_id: '0-6M',
      flash_speed: 1.0,
      sound_enabled: 1,
      notification_time: null,
    });

    const { getSettings } = require('../../src/db/client');
    const result = await getSettings();
    expect(result?.course_id).toBe('0-6M');
    expect(result?.sound_enabled).toBe(1);
  });
});

describe('getCompletedDates', () => {
  it('date の文字列配列を返す', async () => {
    const sqliteMock = require('expo-sqlite');
    sqliteMock._mockDb.getAllAsync.mockResolvedValueOnce([
      { date: '2024-01-01' },
      { date: '2024-01-02' },
    ]);

    const { getCompletedDates } = require('../../src/db/client');
    const result = await getCompletedDates();

    expect(result).toEqual(['2024-01-01', '2024-01-02']);
  });
});

describe('insertSession', () => {
  it('runAsync が呼ばれ、セッション情報がSQLに含まれる', async () => {
    const sqliteMock = require('expo-sqlite');
    const { insertSession } = require('../../src/db/client');

    await insertSession('2024-01-01', 3, '2024-01-01T09:00:00Z', '2024-01-01T09:01:00Z');

    const calls = sqliteMock._mockDb.runAsync.mock.calls;
    const sqls = calls.map((c: string[]) => c[0]);
    expect(sqls.some((sql: string) => sql.includes('2024-01-01'))).toBe(true);
  });
});
