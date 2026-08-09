import { useEffect, useMemo, useState } from "react";
import { Settings } from "lucide-react";

const HERO_COLORS = {
  morning: "#a997c8",
  day: "#67bbed",
  evening: "#da708e",
  night: "#080e2c",
};

function getPeriod(date) {
  const hour = date.getHours();

  if (hour >= 5 && hour < 9) return "morning";
  if (hour >= 9 && hour < 16) return "day";
  if (hour >= 16 && hour < 19) return "evening";
  return "night";
}

export default function Header({ name, birthDate, onOpenSettings }) {
  const [now, setNow] = useState(() => new Date());
  const period = useMemo(() => getPeriod(now), [now]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const themeColor = document.querySelector('meta[name="theme-color"]');
    themeColor?.setAttribute("content", HERO_COLORS[period]);
  }, [period]);

  return (
    <header className={`app-hero app-hero--${period}`}>
      <div className="app-hero-shade" aria-hidden="true" />
      <div className="app-hero-content">
        <div className="app-brand-row">
          <div className="app-brand">
            <img
              src="/assets/brand/app-icon-1024.png"
              alt=""
              className="app-brand-icon"
              aria-hidden="true"
            />
            <div>
              <h1 className="app-title">Roku Rhythm</h1>
              <p className="app-subtitle">六曜とバイオリズム</p>
            </div>
          </div>

          <button
            type="button"
            aria-label="設定を開く"
            onClick={onOpenSettings}
            className="app-settings-button"
          >
            <Settings size={22} aria-hidden="true" />
          </button>
        </div>

        {birthDate ? (
          <div className="app-profile-summary">
            {name ? <p className="app-profile-name">{name}さん</p> : null}
            <p className="app-profile-birthday">
              生年月日: {new Date(birthDate).toLocaleDateString("ja-JP")}
            </p>
          </div>
        ) : (
          <p className="app-hero-intro">今日の六曜と、3つのリズムを確認</p>
        )}
      </div>
    </header>
  );
}
