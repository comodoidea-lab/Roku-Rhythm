import {
  getAssessment,
  getAssessmentColor,
} from "../lib/biorhythm";

const rows = [
  { label: "身体", key: "physical", color: "#FF6B6B" },
  { label: "感情", key: "emotional", color: "#4ECDC4" },
  { label: "知性", key: "intellectual", color: "#45B7D1" },
];

export default function BiorhythmTable(values) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-500">
              要素
            </th>
            <th className="px-4 py-2 text-left font-medium text-gray-500">
              状態
            </th>
            <th className="px-4 py-2 text-left font-medium text-gray-500">
              数値
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ label, key, color }) => {
            const value = values[key];

            return (
              <tr key={label} className="border-t border-gray-100">
                <td className="px-4 py-2 text-gray-600" style={{ color }}>
                  {label}
                </td>
                <td
                  className="px-4 py-2 font-medium"
                  style={{ color: getAssessmentColor(value) }}
                >
                  {getAssessment(value)}
                </td>
                <td className="px-4 py-2 text-gray-500">
                  {Math.round(value)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
