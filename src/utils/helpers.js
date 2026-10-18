/**
 * Generate a collision-resistant unique ID.
 * Uses timestamp + high-resolution random + counter for safety.
 */
let _idCounter = 0;

function createId() {
  _idCounter = (_idCounter + 1) % 10000;
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  const counter = _idCounter.toString(36).padStart(3, '0');
  return `${timestamp}-${random}-${counter}`;
}

function calculateTodoStats(tasks) {
  // Trash items ignore
  const list = tasks.filter(task => !task.deleted);

  const total = list.length;

  const completed = list.filter(
    task => task.completed,
  ).length;

  const active = total - completed;

  const highPriority = list.filter(
    task =>
      task.priority === 'high' &&
      !task.completed,
  ).length;

  // Support both string labels and ISO / timestamp due dates
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10); // YYYY-MM-DD

  const dueToday = list.filter(task => {
    if (task.completed) return false;
    const d = task.dueDate;
    if (!d || d === 'No date') return false;
    if (d === 'Today' || d === 'today') return true;
    if (typeof d === 'string' && d.startsWith(todayStr)) return true;
    // Try parse as date
    try {
      const parsed = new Date(d);
      if (!isNaN(parsed.getTime())) {
        return (
          parsed.getFullYear() === today.getFullYear() &&
          parsed.getMonth() === today.getMonth() &&
          parsed.getDate() === today.getDate()
        );
      }
    } catch (_) {}
    return false;
  }).length;

  const favorites = list.filter(
    task => task.favorite,
  ).length;

  const completionPercentage =
    total === 0
      ? 0
      : Math.round((completed / total) * 100);

  return {
    total,
    completed,
    active,
    highPriority,
    dueToday,
    favorites,
    completionPercentage,
  };
}

function truncateText(text, maxLength = 30) {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

function capitalizeFirstLetter(str) {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatTime(seconds = 0) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export {
  createId,
  calculateTodoStats,
  truncateText,
  capitalizeFirstLetter,
  formatTime,
};
