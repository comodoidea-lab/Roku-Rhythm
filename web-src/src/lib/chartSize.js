export const CHART_SIZES = [
  { value: "small", label: "小" },
  { value: "medium", label: "中" },
  { value: "large", label: "大" },
];

export const DEFAULT_CHART_SIZE = "medium";

// Settings saved before this option existed (or with an unknown value) fall
// back to the default size.
export function normalizeChartSize(value) {
  return CHART_SIZES.some((size) => size.value === value)
    ? value
    : DEFAULT_CHART_SIZE;
}
