/**
 * SQLite用のSQL文を生成するファクトリ関数群。
 * テスト可能にするためSQL文字列の生成をロジックとして分離する。
 * 実際のDB実行は expo-sqlite を使う db/client.ts が担当する。
 */

export const SCHEMA = `
  CREATE TABLE IF NOT EXISTS user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id TEXT NOT NULL DEFAULT '0-6M',
    flash_speed REAL NOT NULL DEFAULT 1.0,
    sound_enabled INTEGER NOT NULL DEFAULT 1,
    notification_time TEXT DEFAULT NULL
  );

  CREATE TABLE IF NOT EXISTS lesson_progress (
    day_number INTEGER PRIMARY KEY,
    completed_at TEXT,
    session_count INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS daily_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    lesson_day INTEGER NOT NULL,
    started_at TEXT NOT NULL,
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS milestones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    achieved_at TEXT NOT NULL,
    day_number INTEGER NOT NULL
  );
`;

export function buildInsertSession(
  date: string,
  lessonDay: number,
  startedAt: string,
  completedAt: string,
): string {
  return `INSERT INTO daily_sessions (date, lesson_day, started_at, completed_at) VALUES ('${date}', ${lessonDay}, '${startedAt}', '${completedAt}')`;
}

export function buildMarkComplete(dayNumber: number, completedAt: string): string {
  return `UPDATE lesson_progress SET completed_at = '${completedAt}', session_count = session_count + 1 WHERE day_number = ${dayNumber}`;
}

export function buildGetProgress(): string {
  return `SELECT day_number, completed_at, session_count FROM lesson_progress ORDER BY day_number ASC`;
}

export function buildUpsertProgress(dayNumber: number): string {
  return `INSERT OR IGNORE INTO lesson_progress (day_number, session_count) VALUES (${dayNumber}, 0)`;
}

export function buildGetSettings(): string {
  return `SELECT * FROM user_settings LIMIT 1`;
}

export function buildUpdateSettings(
  courseId: string,
  flashSpeed: number,
  soundEnabled: boolean,
  notificationTime: string | null,
): string {
  const sound = soundEnabled ? 1 : 0;
  const notif = notificationTime ? `'${notificationTime}'` : 'NULL';
  return `UPDATE user_settings SET course_id = '${courseId}', flash_speed = ${flashSpeed}, sound_enabled = ${sound}, notification_time = ${notif}`;
}

export function buildGetCompletedDates(): string {
  return `SELECT DISTINCT date FROM daily_sessions WHERE completed_at IS NOT NULL ORDER BY date DESC`;
}
