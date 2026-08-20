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
        },
      );
      setShareMessage(
        result === "downloaded"
          ? "PNGを保存し、共有文をコピーしました。"
          : "画像の共有画面を開きました。",
      );
    } catch (error) {
      console.error("Failed to share the Roku Rhythm receipt.", error);
      setShareMessage(
        "画像を共有できませんでした。もう一度お試しください。",
      );
    } finally {
      sharingRef.current = false;
      setSharing(false);
    }
  }

  function handleOpenReceipt() {
    setShareMessage("");
    setReceiptOpen(true);
  }

  function handleCloseReceipt() {
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
      className={`roku-app min-h-screen ${darkMode ? "dark" : ""}`}
    >
      <main className="app-shell relative mx-auto">
        <Header
          name={name}
          birthDate={birthDate}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <div className="app-content">
          <section className="result-card">
          {birthDate ? (
            <>
              <div className="result-summary">
                <h2 className="result-title">
                  {format(selectedDate, "M月d日")}の六曜: {rokuyo}
                </h2>
                <div className="result-message-card">
                  <p className="result-message">
                    {rokuyoComment}
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenReceipt}
                    disabled={sharing}
                    aria-label="今日の六曜レシートを開く"
                    className="receipt-entry group"
                  >
                    <span className="receipt-entry-icon">
                      <ReceiptText size={20} aria-hidden="true" />
                    </span>
                    <span className="receipt-entry-copy">
                      <span className="receipt-entry-title">
                        今日の六曜レシート
                      </span>
                      <span
                        className="receipt-entry-subtitle"
                        aria-live="polite"
                      >
                        {shareMessage || "六曜と3つの波を、1枚の画像に"}
                      </span>
                    </span>
                    <ChevronRight
                      className="receipt-entry-chevron"
                      size={20}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>

              <div className="biorhythm-section">
                <h3 className="biorhythm-section-title">
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
          </section>

          <p className="app-disclaimer">
            ※このアプリは娯楽目的で作られています。<br className="sm:hidden" />
            重要な判断には使用しないでください。
          </p>
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
