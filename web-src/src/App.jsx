import { useEffect, useState } from "react";
import { format } from "date-fns";
import BiorhythmChart from "./components/BiorhythmChart";
import BiorhythmTable from "./components/BiorhythmTable";
import Header from "./components/Header";
import LoginForm from "./components/LoginForm";
import SettingsModal from "./components/SettingsModal";
import { calculateBiorhythm } from "./lib/biorhythm";
import { getRokuyo, toJapanTime } from "./lib/date";
import {
  clearUserData,
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
  const [darkMode, setDarkMode] = useState(false);
  const [showDetailedStats, setShowDetailedStats] = useState(true);

  useEffect(() => {
    const savedUser = loadUserData();
    const savedSettings = loadSettings();

    if (savedUser) {
      setName(savedUser.name);
      setBirthDate(savedUser.birthDate);
    }

    if (savedSettings) {
      setDarkMode(savedSettings.darkMode);
      setShowDetailedStats(savedSettings.showDetailedStats);
    }
  }, []);

  useEffect(() => {
    if (name && birthDate) {
      saveUserData({ name, birthDate });
    }
  }, [name, birthDate]);

  useEffect(() => {
    saveSettings({ darkMode, showDetailedStats });
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode, showDetailedStats]);

  function handleLogin(nextName, nextBirthDate) {
    setName(nextName);
    setBirthDate(nextBirthDate);
  }

  function handleLogout() {
    clearUserData();
    setName("");
    setBirthDate("");
    setSettingsOpen(false);
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
      <div className="relative mx-auto max-w-4xl px-4 py-12">
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
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
}
