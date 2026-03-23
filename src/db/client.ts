import * as SQLite from 'expo-sqlite';
import {
  SCHEMA,
  buildGetProgress,
  buildUpsertProgress,
  buildMarkComplete,
  buildInsertSession,
  buildGetSettings,
  buildUpdateSettings,
  buildGetCompletedDates,
  buildGetTodaySessionCount,
} from './repository';

export interface ProgressRow {
  day_number: number;
  completed_at: string | null;
  session_count: number;
}

export interface SettingsRow {
  course_id: string;
  flash_speed: number;
  sound_enabled: number;
  notification_time: string | null;
  baby_birth_date: string | null;
  onboarding_completed: number;
}

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const database = await SQLite.openDatabaseAsync('science_dots.db');
      await database.execAsync(SCHEMA);
      await database.runAsync('INSERT OR IGNORE INTO user_settings (id) VALUES (1)');
      try {
        await database.execAsync(`ALTER TABLE user_settings ADD COLUMN baby_birth_date TEXT DEFAULT NULL`);
      } catch (_) { /* column already exists */ }
      try {
        await database.execAsync(`ALTER TABLE user_settings ADD COLUMN onboarding_completed INTEGER NOT NULL DEFAULT 0`);
      } catch (_) { /* column already exists */ }
      return database;
    })();
  }
  return dbPromise;
}

export async function getProgress(): Promise<ProgressRow[]> {
  const database = await getDb();
  return database.getAllAsync<ProgressRow>(buildGetProgress());
}

export async function upsertProgress(dayNumber: number): Promise<void> {
  const database = await getDb();
  await database.runAsync(buildUpsertProgress(dayNumber));
}

export async function markComplete(dayNumber: number): Promise<void> {
  const database = await getDb();
  const completedAt = new Date().toISOString();
  await upsertProgress(dayNumber);
  await database.runAsync(buildMarkComplete(dayNumber, completedAt));
}

export async function insertSession(
  date: string,
  lessonDay: number,
  startedAt: string,
  completedAt: string,
): Promise<void> {
  const database = await getDb();
  await database.runAsync(buildInsertSession(date, lessonDay, startedAt, completedAt));
}

export async function getSettings(): Promise<SettingsRow | null> {
  const database = await getDb();
  return database.getFirstAsync<SettingsRow>(buildGetSettings());
}

export async function updateSettings(
  courseId: string,
  flashSpeed: number,
  soundEnabled: boolean,
  notificationTime: string | null,
  babyBirthDate: string | null,
  onboardingCompleted: boolean = false,
): Promise<void> {
  const database = await getDb();
  await database.runAsync(buildUpdateSettings(courseId, flashSpeed, soundEnabled, notificationTime, babyBirthDate, onboardingCompleted));
}

export async function getCompletedDates(): Promise<string[]> {
  const database = await getDb();
  const rows = await database.getAllAsync<{ date: string }>(buildGetCompletedDates());
  return rows.map((r) => r.date);
}

export async function getTodaySessionCount(date: string, dayNumber: number): Promise<number> {
  const database = await getDb();
  const row = await database.getFirstAsync<{ count: number }>(buildGetTodaySessionCount(date, dayNumber));
  return row?.count ?? 0;
}
