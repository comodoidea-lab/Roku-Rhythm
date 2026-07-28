import { addDays, format } from "date-fns";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { calculateBiorhythm } from "../lib/biorhythm";
import { toJapanTime } from "../lib/date";

export default function BiorhythmChart({
  birthDate,
  days = 15,
  onDateSelect,
  darkMode,
  showDetailedStats,
}) {
  const today = toJapanTime();
  const data = Array.from({ length: days }, (_, index) => {
    const date = addDays(today, index - Math.floor(days / 2));
    const values = calculateBiorhythm(birthDate, date);

    return {
      date,
      dateStr: format(date, "MM/dd"),
      physical: Math.round(values.physical),
      emotional: Math.round(values.emotional),
      intellectual: Math.round(values.intellectual),
      ...(showDetailedStats
        ? {
            physicalTrend: Math.round(
              Math.cos(
                (2 * Math.PI * (index - Math.floor(days / 2))) / 23,
              ) * 100,
            ),
            emotionalTrend: Math.round(
              Math.cos(
                (2 * Math.PI * (index - Math.floor(days / 2))) / 28,
              ) * 100,
            ),
            intellectualTrend: Math.round(
              Math.cos(
                (2 * Math.PI * (index - Math.floor(days / 2))) / 33,
              ) * 100,
            ),
          }
        : {}),
    };
  });

  function handleSelect(event) {
    const selected = event?.activePayload?.[0]?.payload?.date;
    if (selected) onDateSelect(selected);
  }

  const tickColor = darkMode ? "#d1d5db" : "#374151";

  return (
    <div className="mt-6 h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 4, left: -8, bottom: 8 }}
          onClick={handleSelect}
          onTouchStart={handleSelect}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={darkMode ? "#374151" : "#e5e7eb"}
          />
          <XAxis
            dataKey="dateStr"
            tick={{ fontSize: 13, fill: tickColor }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[-100, 100]}
            tick={{ fontSize: 13, fill: tickColor }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? "#1f2937" : "white",
              borderRadius: "8px",
              border: "none",
              color: darkMode ? "#e5e7eb" : "#1f2937",
              fontSize: "14px",
            }}
            formatter={(value) => [`${Math.round(value)}%`]}
          />
          <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "14px" }} />
          <ReferenceLine
            x={format(today, "MM/dd")}
            stroke={darkMode ? "#9ca3af" : "#4b5563"}
            strokeDasharray="3 3"
          />
          <Line
            type="monotone"
            dataKey="physical"
            stroke="#FF6B6B"
            name="身体"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="emotional"
            stroke="#4ECDC4"
            name="感情"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="intellectual"
            stroke="#45B7D1"
            name="知性"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 8 }}
          />
          {showDetailedStats ? (
            <>
              <Line
                type="monotone"
                dataKey="physicalTrend"
                stroke="#FF6B6B"
                strokeDasharray="5 5"
                strokeWidth={1}
                dot={false}
                name="身体 (傾向)"
              />
              <Line
                type="monotone"
                dataKey="emotionalTrend"
                stroke="#4ECDC4"
                strokeDasharray="5 5"
                strokeWidth={1}
                dot={false}
                name="感情 (傾向)"
              />
              <Line
                type="monotone"
                dataKey="intellectualTrend"
                stroke="#45B7D1"
                strokeDasharray="5 5"
                strokeWidth={1}
                dot={false}
                name="知性 (傾向)"
              />
            </>
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
