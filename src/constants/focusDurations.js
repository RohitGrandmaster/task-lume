/** Focus duration options: 30 seconds, then 1–180 minutes */
export const FOCUS_MINUTES = [0.5, ...Array.from({length: 180}, (_, i) => i + 1)];

/** Break duration options: 30 seconds, then 1–30 minutes */
export const BREAK_MINUTES = [0.5, ...Array.from({length: 30}, (_, i) => i + 1)];

export function formatDurationLabel(mins) {
  if (mins < 1) return {value: '30', unit: 'sec'};
  return {value: String(mins), unit: 'min'};
}

export function durationToSeconds(mins) {
  return Math.round(Number(mins) * 60);
}
