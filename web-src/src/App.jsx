import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { ChevronRight, ReceiptText } from "lucide-react";
import BiorhythmChart from "./components/BiorhythmChart";
import BiorhythmTable from "./components/BiorhythmTable";
import Header from "./components/Header";
import LoginForm from "./components/LoginForm";
import PrivacyPolicyModal from "./components/PrivacyPolicyModal";
import ReceiptSheet from "./components/ReceiptSheet";
import SettingsModal from "./components/SettingsModal";
import { calculateBiorhythm } from "./lib/biorhythm";
import { getRokuyo, toJapanTime } from "./lib/date";
import {
  getDailyReminderEnabled,
  setDailyReminderEnabled,
  supportsDailyReminder,
} from "./lib/notifications";
import { shareResult } from "./lib/share";
import {
  clearAppData,
  loadSettings,
  loadUserData,
  saveSettings,
  saveUserData,
} from "./lib/storage";

export default function App() {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [selectedDate, setSelectedDate] = useState(toJapanTime());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showDetailedStats, setShowDetailedStats] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(false);
  const [reminderMessage, setReminderMessage] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [sharing, setSharing] = useState(false);
  const skipNextSettingsSave = useRef(false);
  const sharingRef = useRef(false);
  const shareCanceledRef = useRef(false);
  const dailyReminderSupported = supportsDailyReminder();

  useEffect(() => {
    const savedUser = loadUserData();
    const savedSettings = loadSettings();

    if (savedUser) {
      setName(savedUser.name || "");
      setBirthDate(savedUser.birthDate);
    }

    if (savedSettings) {
      setDarkMode(savedSettings.darkMode);
      setShowDetailedStats(savedSettings.showDetailedStats);
    }
  }, []);

  useEffect(() => {
    let active = true;

    if (!dailyReminderSupported) return undefined;

    getDailyReminderEnabled()
      .then((enabled) => {
        if (active) setDailyReminder(enabled);
      })
      .catch(() => {
        if (active) {
          setReminderMessage("通知設定を確認できませんでした。");
        }
      });

    return () => {
      active = false;
    };
  }, [dailyReminderSupported]);

  useEffect(() => {
    if (birthDate) {
      saveUserData({ name, birthDate });
    }
  }, [name, birthDate]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);

    if (skipNextSettingsSave.current) {
      skipNextSettingsSave.current = false;
      return;
    }

    saveSettings({ darkMode, showDetailedStats });
  }, [darkMode, showDetailedStats]);

  function handleLogin(nextName, nextBirthDate) {
    setName(nextName);
    setBirthDate(nextBirthDate);
  }

  async function handleDeleteData() {
    const shouldDelete = window.confirm(
      "プロフィール、表示設定、通知設定をこの端末から削除しますか？",
    );
    if (!shouldDelete) return;

    try {
      await setDailyReminderEnabled(false);
    } catch {
      // Continue deleting local data even if the OS notification cannot be changed.
    }

    skipNextSettingsSave.current = true;
    clearAppData();
    setName("");
    setBirthDate("");
    setSelectedDate(toJapanTime());
    setDarkMode(false);
    setShowDetailedStats(true);
    setDailyReminder(false);
    setReminderMessage("");
    setShareMessage("");
    setSettingsOpen(false);
    setPrivacyOpen(false);
    setReceiptOpen(false);
  }

  async function handleDailyReminderChange(enabled) {
    setReminderMessage("通知設定を更新しています…");

    try {
      const result = await setDailyReminderEnabled(enabled);
      setDailyReminder(result.enabled);

      if (result.reason === "permission-denied") {
        setReminderMessage(
          "通知が許可されていません。端末の設定から許可できます。",
        );
      } else if (result.reason === "unsupported") {
        setReminderMessage("通知はインストールしたアプリで利用できます。");
      } else {
        setReminderMessage(
          result.enabled
            ? "毎朝8時の通知を設定しました。"
            : "毎朝の通知を解除しました。",
        );
      }
    } catch {
      setDailyReminder(false);
      setReminderMessage("通知設定を更新できませんでした。");
    }
  }

  async function handleShare() {
    if (sharingRef.current) return;

    sharingRef.current = true;
    shareCanceledRef.current = false;
    setSharing(true);
    setShareMessage("共有画像を作成しています…");

    try {
      const result = await shareResult(
        {
          date: selectedDate,
          birthDate: new Date(birthDate),
          rokuyo,
          comment: rokuyoComment,
          biorhythm,
        },
        {
          beforeImagePreparation: async () => {
            setReceiptOpen(false);
            await new Promise((resolve) => {
              window.requestAnimationFrame(() => {
                window.requestAnimationFrame(resolve);
              });
            });
          },
          beforeNativeShare: async () => {
            if (shareCanceledRef.current) {
              throw new Error("sharing-canceled");
            }

            setReceiptOpen(false);
            await new Promise((resolve) => {
              window.requestAnimationFrame(() => resolve());
            });
          },
        },
      );
      setShareMessage(
        result === "downloaded"
          ? "PNGを保存し、共有文をコピーしました。"
          : "画像の共有画面を開きました。",
      );
    } catch (error) {
      if (error?.message !== "sharing-canceled") {
        console.error("Failed to share the Roku Rhythm receipt.", error);
        setShareMessage(
          "画像を共有できませんでした。もう一度お試しください。",
        );
      }
    } finally {
      sharingRef.current = false;
      setSharing(false);
    }
  }

  function handleOpenReceipt() {
    shareCanceledRef.current = false;
    setShareMessage("");
    setReceiptOpen(true);
  }

  function handleCloseReceipt() {
    shareCanceledRef.current = true;
    setReceiptOpen(false);
  }

  const rokuyo = getRokuyo(selectedDate);
  const biorhythm = birthDate
    ? calculateBiorhythm(new Date(birthDate), selectedDate)
    : { physical: 0, emotional: 0, intellectual: 0 };
  const rokuyoComment = window.getRokuyoComment(
    rokuyo,
    selectedDate,
    biorhythm,
    Boolean(birthDate),
  );

  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? "dark bg-gray-900"
          : "bg-gradient-to-b from-gray-50 to-gray-100"
      }`}
    >
      <main className="app-shell relative mx-auto max-w-4xl px-4 py-12">
        <Header onOpenSettings={() => setSettingsOpen(true)} />

        <div className="mb-8 rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
          {birthDate ? (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {name ? `${name}さん` : null}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    生年月日:{" "}
                    {new Date(birthDate).toLocaleDateString("ja-JP")}
                  </p>
                </div>
              </div>

              <div className="mb-6 text-center">
                <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {format(selectedDate, "M月d日")}の六曜: {rokuyo}
                </h2>
                <div className="mt-4 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-700">
                  <p className="p-4 text-base leading-relaxed text-gray-700 dark:text-gray-200">
                    {rokuyoComment}
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenReceipt}
                    disabled={sharing}
                    aria-label="今日の六曜レシートを開く"
                    className="group flex min-h-16 w-full touch-manipulation items-center gap-3 border-t border-indigo-100 bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-3 text-left transition-colors hover:from-indigo-100 hover:to-blue-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 disabled:cursor-wait disabled:opacity-70 dark:border-indigo-400/20 dark:from-indigo-500/15 dark:to-blue-500/10 dark:hover:from-indigo-500/25 dark:hover:to-blue-500/20"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-200 dark:shadow-none">
                      <ReceiptText size={20} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-indigo-950 dark:text-indigo-100">
                        今日の六曜レシート
                      </span>
                      <span
                        className="mt-0.5 block text-xs leading-relaxed text-indigo-700 dark:text-indigo-200"
                        aria-live="polite"
                      >
                        {shareMessage || "六曜と3つの波を、1枚の画像に"}
                      </span>
                    </span>
                    <ChevronRight
                      className="shrink-0 text-indigo-400 transition-transform group-hover:translate-x-0.5 dark:text-indigo-300"
                      size={20}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  バイオリズム評価
                </h3>
                <BiorhythmTable {...biorhythm} />
                <BiorhythmChart
                  birthDate={new Date(birthDate)}
                  onDateSelect={setSelectedDate}
                  darkMode={darkMode}
                  showDetailedStats={showDetailedStats}
                />
              </div>
            </>
          ) : (
            <LoginForm onSubmit={handleLogin} />
          )}
        </div>

        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          ※このアプリは娯楽目的で作られています。重要な判断には使用しないでください。
        </div>

        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          darkMode={darkMode}
          onDarkModeChange={setDarkMode}
          showDetailedStats={showDetailedStats}
          onShowDetailedStatsChange={setShowDetailedStats}
          dailyReminder={dailyReminder}
          dailyReminderSupported={dailyReminderSupported}
          reminderMessage={reminderMessage}
          onDailyReminderChange={handleDailyReminderChange}
          onOpenPrivacy={() => {
            setSettingsOpen(false);
            setPrivacyOpen(true);
          }}
          onDeleteData={handleDeleteData}
        />

        <PrivacyPolicyModal
          isOpen={privacyOpen}
          onClose={() => setPrivacyOpen(false)}
        />

        <ReceiptSheet
          isOpen={receiptOpen}
          onClose={handleCloseReceipt}
          onShare={handleShare}
          sharing={sharing}
          shareMessage={shareMessage}
          result={
            birthDate
              ? {
                  date: selectedDate,
                  birthDate: new Date(birthDate),
                  rokuyo,
                  comment: rokuyoComment,
                  biorhythm,
                }
              : null
          }
        />
      </main>
    </div>
  );
}
