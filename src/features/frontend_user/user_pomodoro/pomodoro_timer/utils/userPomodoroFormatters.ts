/**
 * RESPONSIBILITY: Feature-local presentation formatters for pomodoro timer seconds, cycle badges, and state labels.
 * FLOW: Consumed by pomodoro timer controls and displays.
 */

export function formatTimerSeconds(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const paddedMins = mins < 10 ? `0${mins}` : `${mins}`;
  const paddedSecs = secs < 10 ? `0${secs}` : `${secs}`;
  return `${paddedMins}:${paddedSecs}`;
}

export function formatSessionModeLabel(mode: 'focus' | 'short_break' | 'long_break'): string {
  switch (mode) {
    case 'focus':
      return 'Focus Session';
    case 'short_break':
      return 'Short Break';
    case 'long_break':
      return 'Long Break';
    default:
      return 'Focus';
  }
}
