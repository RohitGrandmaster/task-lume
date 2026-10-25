/**
 * RESPONSIBILITY: Feature-local presentation formatters for voice recording durations, audio timestamps, and waveforms.
 * FLOW: Consumed by voice memo recording views, lists, and playback components.
 */

export function formatAudioDuration(durationMs: number): string {
  if (isNaN(durationMs) || durationMs <= 0) return '0:00';
  const totalSeconds = Math.floor(durationMs / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const paddedSecs = secs < 10 ? `0${secs}` : `${secs}`;
  return `${mins}:${paddedSecs}`;
}

export function formatTranscriptSnippet(transcript: string, maxLength: number = 80): string {
  if (!transcript) return 'No transcript available';
  if (transcript.length <= maxLength) return transcript;
  return `${transcript.substring(0, maxLength).trim()}...`;
}
