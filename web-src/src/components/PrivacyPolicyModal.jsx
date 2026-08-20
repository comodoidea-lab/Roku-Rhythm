import { X } from "lucide-react";

// Keep the in-app support destination independent of a development branch.
// The public privacy-policy page is still a separate release gate.
const SUPPORT_URL = "mailto:info@comodoidea.com";

export default function PrivacyPolicyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-policy-title"
    >
      <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 dark:bg-gray-800">
        <button
          type="button"
          aria-label="プライバシーポリシーを閉じる"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700"
        >
          <X size={20} />
        </button>

        <h2
          id="privacy-policy-title"
          className="pr-10 text-xl font-semibold text-gray-900 dark:text-white"
        >
          プライバシーポリシー
        </h2>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          最終更新日: 2026年7月29日
        </p>

        <div className="mt-6 space-y-5 text-sm leading-6 text-gray-700 dark:text-gray-200">
          <section>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              端末内に保存する情報
            </h3>
            <p>
              Roku Rhythmは、入力されたニックネーム、生年月日、表示設定を利用者の端末内にのみ保存します。
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              データの収集と送信
            </h3>
            <p>
              入力情報、利用履歴その他の個人データを、開発者または第三者のサーバーへ送信・収集しません。広告、アクセス解析、利用者追跡も行いません。
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              通知と共有
            </h3>
            <p>
              毎朝の通知は、利用者が許可した場合だけ端末の機能を使って予約されます。結果を共有する場合はOSの共有画面が開き、共有先は利用者自身が選択します。
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              データの削除
            </h3>
            <p>
              設定画面の「端末内データを削除」から、保存したプロフィールと設定を削除できます。アプリを削除した場合も端末内データは削除されます。
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              お問い合わせ
            </h3>
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-blue-600 underline dark:text-blue-400"
            >
              Roku Rhythm サポート
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
