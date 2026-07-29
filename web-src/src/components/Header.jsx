import { Settings } from "lucide-react";

export default function Header({ onOpenSettings }) {
  return (
    <header className="app-header mb-8 flex flex-col items-center">
      <div className="relative flex w-full items-center justify-center px-14">
        <h1 className="app-title flex items-center whitespace-nowrap text-4xl font-bold text-gray-900 dark:text-white">
          <img
            src="/favicon.svg"
            alt=""
            className="app-title-logo mr-2 rounded-2xl"
            aria-hidden="true"
          />
          Roku Rhythm
        </h1>
        <button
          type="button"
          aria-label="設定を開く"
          onClick={onOpenSettings}
          className="app-settings-button absolute right-0 top-1/2 inline-flex min-h-12 min-w-12 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
        >
          <Settings size={26} aria-hidden="true" />
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        六曜とバイオリズム
      </p>
    </header>
  );
}
