import { useState } from "react";
import { validateBirthDate } from "../lib/validation";

const inputClassName =
  "block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white";

export default function LoginForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const validation = validateBirthDate(year, month, day);

    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError("");
    onSubmit(name.trim(), validation.birthDate);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          プロフィール設定
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          入力内容はこの端末内だけに保存され、外部には送信されません。
        </p>
      </div>

      <div>
        <label
          htmlFor="nickname"
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          ニックネーム（任意）
        </label>
        <input
          id="nickname"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={inputClassName}
          placeholder="表示名を入力"
          autoComplete="nickname"
        />
      </div>

      <div>
        <label
          htmlFor="birth-year"
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          生年月日
        </label>
        <div className="grid grid-cols-3 gap-2">
          <input
            id="birth-year"
            type="text"
            value={year}
            onChange={(event) =>
              setYear(event.target.value.replace(/\D/g, "").slice(0, 4))
            }
            placeholder="西暦"
            inputMode="numeric"
            autoComplete="bday-year"
            aria-label="生年月日の西暦"
            className={inputClassName}
          />
          <input
            id="birth-month"
            type="text"
            value={month}
            onChange={(event) =>
              setMonth(event.target.value.replace(/\D/g, "").slice(0, 2))
            }
            placeholder="月"
            inputMode="numeric"
            autoComplete="bday-month"
            aria-label="生年月日の月"
            className={inputClassName}
          />
          <input
            id="birth-day"
            type="text"
            value={day}
            onChange={(event) =>
              setDay(event.target.value.replace(/\D/g, "").slice(0, 2))
            }
            placeholder="日"
            inputMode="numeric"
            autoComplete="bday-day"
            aria-label="生年月日の日"
            className={inputClassName}
          />
        </div>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <button
        type="submit"
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        はじめる
      </button>
    </form>
  );
}
