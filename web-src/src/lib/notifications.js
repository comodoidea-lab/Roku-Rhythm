import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

const DAILY_REMINDER_ID = 8729;

export function supportsDailyReminder() {
  return Capacitor.isNativePlatform();
}

export async function getDailyReminderEnabled() {
  if (!supportsDailyReminder()) return false;

  const { notifications } = await LocalNotifications.getPending();
  return notifications.some(
    (notification) => notification.id === DAILY_REMINDER_ID,
  );
}

export async function setDailyReminderEnabled(enabled) {
  if (!supportsDailyReminder()) {
    return {
      enabled: false,
      reason: "unsupported",
    };
  }

  if (!enabled) {
    await LocalNotifications.cancel({
      notifications: [{ id: DAILY_REMINDER_ID }],
    });
    return { enabled: false };
  }

  let permission = await LocalNotifications.checkPermissions();
  if (permission.display !== "granted") {
    permission = await LocalNotifications.requestPermissions();
  }

  if (permission.display !== "granted") {
    return {
      enabled: false,
      reason: "permission-denied",
    };
  }

  await LocalNotifications.cancel({
    notifications: [{ id: DAILY_REMINDER_ID }],
  });
  await LocalNotifications.schedule({
    notifications: [
      {
        id: DAILY_REMINDER_ID,
        title: "Roku Rhythm",
        body: "今日の六曜とバイオリズムを確認しましょう。",
        schedule: {
          on: {
            hour: 8,
            minute: 0,
          },
        },
      },
    ],
  });

  return { enabled: true };
}
