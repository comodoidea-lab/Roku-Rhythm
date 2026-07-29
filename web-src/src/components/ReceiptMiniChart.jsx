import {
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

export default function ReceiptMiniChart({ metrics, waves }) {
  const current = waves.find((entry) => entry.current);

  return (
    <div
      className="receipt-mini-chart"
      aria-label="選択日前後の身体、感情、知性の波"
      role="img"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={waves}
          margin={{ top: 6, right: 7, bottom: 6, left: 7 }}
        >
          <XAxis dataKey="index" hide />
          <YAxis domain={[-100, 100]} hide />
          {metrics.map((metric) => (
            <Line
              key={metric.key}
              type="natural"
              dataKey={metric.key}
              stroke={metric.color}
              strokeWidth={2.5}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
          ))}
          {metrics.map((metric) => (
            <ReferenceDot
              key={`${metric.key}-current`}
              x={current.index}
              y={current[metric.key]}
              r={4}
              fill={metric.color}
              stroke="#fffaf0"
              strokeWidth={1.5}
              isFront
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
