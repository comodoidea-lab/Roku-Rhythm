import { Settings } from "lucide-react";

export default function Header({ onOpenSettings }) {
  return (
    <div className="mb-8 flex flex-col items-center">
      <h1 className="flex items-center text-4xl font-bold text-gray-900 dark:text-white">
        <img
          src="/favicon.svg"
          alt="Roku Rhythm"
          className="mr-2 rounded-2xl"
          style={{ width: "2.25rem", height: "2.25rem" }}
        />
        Roku Rhythm
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        六曜とバイオリズム
      </p>
      <button
        type="button"
        aria-label="設定を開く"
        onClick={onOpenSettings}
        className="absolute right-4 top-4 rounded-full p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <Settings className="text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  );
}
