import * as Notifications from 'expo-notifications';

export const CHANNEL_ID = 'science-dots-daily';

export interface DailyTrigger {
  type: 'daily';
  hour: number;
  minute: number;
}

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidTimeString(time: string): boolean {
  return TIME_PATTERN.test(time);
}

export function parseTimeString(time: string): { hour: number; minute: number } {
  const [hourStr, minuteStr] = time.split(':');
  return { hour: parseInt(hourStr, 10), minute: parseInt(minuteStr, 10) };
}

export function buildDailyTrigger(timeString: string): DailyTrigger {
  const { hour, minute } = parseTimeString(timeString);
  return { type: 'daily', hour, minute };
}

/**
 * 毎日の通知をスケジュールする。既存の通知はキャンセルしてから再登録。
 */
export async function scheduleDailyReminder(timeString: string): Promise<string | null> {
  if (!isValidTimeString(timeString)) return null;

  await Notifications.cancelAllScheduledNotificationsAsync();
  const trigger = buildDailyTrigger(timeString);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Science Dots',
      body: '今日のドッツカードを見せる時間です！',
      sound: true,
    },
    trigger: { ...trigger, channelId: CHANNEL_ID } as Notifications.NotificationTriggerInput,
  });

  await scheduleWeeklyReminder();

  return id;
}

/**
 * 通知の許可をリクエストする。
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * スケジュール済みの通知をすべてキャンセルする。
 */
export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * 10秒後にテスト通知を送る。
 */
export async function scheduleTestNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Science Dots テスト通知',
      body: '通知は正常に動作しています！',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 10,
      repeats: false,
      channelId: CHANNEL_ID,
    },
  });
}

/**
 * 毎週日曜日20時にウィークリーリマインダーをスケジュールする。
 * Expo の weekday: 1 = 日曜日（JavaScript の Date.getDay() と同じ）
 */
export async function scheduleWeeklyReminder(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Science Dots',
      body: '今週も赤ちゃんとの時間をありがとう！来週も一緒に続けましょう 🌸',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1, // 日曜日
      hour: 20,
      minute: 0,
      channelId: CHANNEL_ID,
    },
  });
}
