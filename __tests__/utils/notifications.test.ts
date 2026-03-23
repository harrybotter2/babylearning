import {
  buildDailyTrigger,
  isValidTimeString,
  parseTimeString,
  scheduleDailyReminder,
  cancelDailyReminder,
  requestNotificationPermission,
  scheduleTestNotification,
} from '../../src/utils/notifications';
import * as Notifications from 'expo-notifications';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('isValidTimeString', () => {
  it('正しいHH:MM形式はtrue', () => {
    expect(isValidTimeString('09:00')).toBe(true);
    expect(isValidTimeString('21:30')).toBe(true);
    expect(isValidTimeString('00:00')).toBe(true);
    expect(isValidTimeString('23:59')).toBe(true);
  });

  it('不正な形式はfalse', () => {
    expect(isValidTimeString('25:00')).toBe(false);
    expect(isValidTimeString('09:60')).toBe(false);
    expect(isValidTimeString('abc')).toBe(false);
    expect(isValidTimeString('')).toBe(false);
    expect(isValidTimeString('9:00')).toBe(false); // 1桁はfalse
  });
});

describe('parseTimeString', () => {
  it('"09:30" → { hour: 9, minute: 30 }', () => {
    expect(parseTimeString('09:30')).toEqual({ hour: 9, minute: 30 });
  });

  it('"21:00" → { hour: 21, minute: 0 }', () => {
    expect(parseTimeString('21:00')).toEqual({ hour: 21, minute: 0 });
  });
});

describe('buildDailyTrigger', () => {
  it('type:daily, hour, minute を含むオブジェクトを返す', () => {
    const trigger = buildDailyTrigger('08:00');
    expect(trigger.type).toBe('daily');
    expect(trigger.hour).toBe(8);
    expect(trigger.minute).toBe(0);
  });

  it('時刻が正確に変換される', () => {
    const trigger = buildDailyTrigger('20:45');
    expect(trigger.hour).toBe(20);
    expect(trigger.minute).toBe(45);
  });
});

describe('scheduleDailyReminder', () => {
  it('不正な時刻文字列の場合は null を返しスケジュールしない', async () => {
    const result = await scheduleDailyReminder('invalid');
    expect(result).toBeNull();
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('正しい時刻でスケジュールを登録し ID を返す', async () => {
    const id = await scheduleDailyReminder('09:00');
    expect(id).toBe('mock-notification-id');
    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
    // scheduleNotificationAsync is called twice: once for daily, once for weekly reminder
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2);
  });

  it('スケジュール時に channelId が渡される', async () => {
    await scheduleDailyReminder('09:00');
    const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
    expect(call.trigger.channelId).toBe('science-dots-daily');
  });

  it('スケジュール時に type:daily と正しい時刻が渡される', async () => {
    await scheduleDailyReminder('21:30');
    const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
    expect(call.trigger.type).toBe('daily');
    expect(call.trigger.hour).toBe(21);
    expect(call.trigger.minute).toBe(30);
  });
});

describe('cancelDailyReminder', () => {
  it('cancelAllScheduledNotificationsAsync を呼ぶ', async () => {
    await cancelDailyReminder();
    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
  });
});

describe('requestNotificationPermission', () => {
  it('granted の場合は true を返す', async () => {
    const result = await requestNotificationPermission();
    expect(result).toBe(true);
  });

  it('denied の場合は false を返す', async () => {
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });
    const result = await requestNotificationPermission();
    expect(result).toBe(false);
  });
});

describe('scheduleTestNotification', () => {
  it('scheduleNotificationAsync を呼ぶ', async () => {
    await scheduleTestNotification();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
  });

  it('timeInterval トリガーで10秒後に設定される', async () => {
    await scheduleTestNotification();
    const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
    expect(call.trigger.type).toBe('timeInterval');
    expect(call.trigger.seconds).toBe(10);
    expect(call.trigger.repeats).toBe(false);
  });

  it('channelId が渡される', async () => {
    await scheduleTestNotification();
    const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
    expect(call.trigger.channelId).toBe('science-dots-daily');
  });
});
