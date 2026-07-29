import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Share2 } from "lucide-react";
import BiorhythmChart from "./components/BiorhythmChart";
import BiorhythmTable from "./components/BiorhythmTable";
import Header from "./components/Header";
import LoginForm from "./components/LoginForm";
import PrivacyPolicyModal from "./components/PrivacyPolicyModal";
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
  const [darkMode, setDarkMode] = useState(false);
  const [showDetailedStats, setShowDetailedStats] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(false);
  const [reminderMessage, setReminderMessage] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [sharing, setSharing] = useState(false);
  const skipNextSettingsSave = useRef(false);
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
    setSharing(true);
    setShareMessage("");

    try {
      const result = await shareResult({
        date: selectedDate,
        rokuyo,
        comment: rokuyoComment,
        biorhythm,
      });
      setShareMessage(
        result === "copied"
          ? "結果をクリップボードにコピーしました。"
          : "共有画面を開きました。",
      );
    } catch {
      setShareMessage("この端末では結果を共有できませんでした。");
    } finally {
      setSharing(false);
    }
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
                <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <p className="text-gray-700 dark:text-gray-300">
                    {rokuyoComment}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={sharing}
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60 dark:border-blue-400 dark:text-blue-300 dark:hover:bg-gray-700"
                >
                  <Share2 className="mr-2" size={18} aria-hidden="true" />
                  {sharing ? "共有を準備中…" : "この結果を共有"}
                </button>
                {shareMessage ? (
                  <p
                    className="mt-2 text-sm text-gray-600 dark:text-gray-300"
                    aria-live="polite"
                  >
                    {shareMessage}
                  </p>
                ) : null}
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
      </main>
    </div>
  );
}
