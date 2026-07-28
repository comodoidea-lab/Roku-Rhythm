import { useState } from "react";

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

    if (!name || !year || !month || !day) {
      setError("すべての項目を入力してください");
      return;
    }

    const birthDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    const parsedDate = new Date(birthDate);

    if (Number.isNaN(parsedDate.getTime())) {
      setError("正しい日付を入力してください");
      return;
    }

    if (parsedDate > new Date()) {
      setError("未来の日付は入力できません");
      return;
    }

    onSubmit(name, birthDate);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          お名前・ニックネーム
        </label>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={inputClassName}
          placeholder="お名前を入力してください"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          生年月日
        </label>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            value={year}
            onChange={(event) =>
              setYear(event.target.value.replace(/\D/g, "").slice(0, 4))
            }
            placeholder="西暦"
            className={inputClassName}
          />
          <input
            type="text"
            value={month}
            onChange={(event) =>
              setMonth(event.target.value.replace(/\D/g, "").slice(0, 2))
            }
            placeholder="月"
            className={inputClassName}
          />
          <input
            type="text"
            value={day}
            onChange={(event) =>
              setDay(event.target.value.replace(/\D/g, "").slice(0, 2))
            }
            placeholder="日"
            className={inputClassName}
          />
        </div>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <button
        type="submit"
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        ログイン
      </button>
    </form>
  );
}
