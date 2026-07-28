import { X } from "lucide-react";

function Toggle({ label, checked, onChange }) {
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
          className="peer sr-only"
        />
        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800" />
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
  onLogout,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
        <button
          type="button"
          aria-label="設定を閉じる"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
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
          <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
            <button
              type="button"
              onClick={onLogout}
              className="w-full rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              ログアウト
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
