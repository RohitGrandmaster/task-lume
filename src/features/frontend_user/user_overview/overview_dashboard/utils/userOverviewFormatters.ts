/**
 * RESPONSIBILITY: Feature-local presentation formatters for overview metrics, completion rates, and streaks.
 * FLOW: Consumed by overview dashboard components and cards.
 */

export function formatCompletionPercentage(completed: number, total: number): string {
  if (!total || total <= 0) return '0%';
  const pct = Math.round((completed / total) * 100);
  return `${pct}%`;
}

export function formatProductivityBadge(completedCount: number): { label: string; level: 'starter' | 'pro' | 'master' } {
  if (completedCount >= 50) return { label: 'Productivity Master', level: 'master' };
  if (completedCount >= 10) return { label: 'Achiever', level: 'pro' };
  return { label: 'Getting Started', level: 'starter' };
}
