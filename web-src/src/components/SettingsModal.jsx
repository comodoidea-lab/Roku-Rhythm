import { X } from "lucide-react";

function Toggle({ label, checked, onChange, disabled = false }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          disabled={disabled}
          aria-label={label}
          className="peer sr-only"
        />
        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800" />
      </label>
    </div>
  );
}

export default function SettingsModal({
  isOpen,
  onClose,
  darkMode,
  onDarkModeChange,
  showDetailedStats,
  onShowDetailedStatsChange,
  dailyReminder,
  dailyReminderSupported,
  reminderMessage,
  onDailyReminderChange,
  onOpenPrivacy,
  onDeleteData,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 dark:bg-gray-800">
        <button
          type="button"
          aria-label="設定を閉じる"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2
          id="settings-title"
          className="mb-4 text-xl font-semibold text-gray-900 dark:text-white"
        >
          設定
        </h2>

        <div className="space-y-4">
          <Toggle
            label="ダークモード"
            checked={darkMode}
            onChange={onDarkModeChange}
          />
          <Toggle
            label="詳細な統計を表示"
            checked={showDetailedStats}
            onChange={onShowDetailedStatsChange}
          />

          <div>
            <Toggle
              label="毎朝8時にお知らせ"
              checked={dailyReminder}
              onChange={onDailyReminderChange}
              disabled={!dailyReminderSupported}
            />
            {!dailyReminderSupported ? (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                通知はインストールしたアプリで利用できます。
              </p>
            ) : null}
            {reminderMessage ? (
              <p
                className="mt-1 text-xs text-gray-600 dark:text-gray-300"
                aria-live="polite"
              >
                {reminderMessage}
              </p>
            ) : null}
          </div>

          <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
            <a
              href="#privacy-policy"
              onClick={(event) => {
                event.preventDefault();
                onOpenPrivacy();
              }}
              className="text-sm font-medium text-blue-600 underline dark:text-blue-400"
            >
              プライバシーポリシー
            </a>
          </div>

          <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
            <button
              type="button"
              onClick={onDeleteData}
              className="w-full rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              端末内データを削除
            </button>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
          バージョン: 1.0.0
        </div>
      </div>
    </div>
  );
}
