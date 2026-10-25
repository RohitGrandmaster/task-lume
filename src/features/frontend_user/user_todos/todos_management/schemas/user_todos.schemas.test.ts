/**
 * RESPONSIBILITY: Covers Todo form defaults, normalization, date/time validation and reminder safety.
 * FLOW: Test input is parsed through TodoFormSchema → assert normalized values or explicit field issues.
 */
import { TodoFormSchema } from './user_todos.schemas';

describe('TodoFormSchema', () => {
  it('normalizes text and provides safe defaults for optional task fields', () => {
    const parsed = TodoFormSchema.safeParse({
      title: '  Write release notes  ',
      category: '  Work  ',
      priority: 'high',
    });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.title).toBe('Write release notes');
    expect(parsed.data.category).toBe('Work');
    expect(parsed.data.dueDate).toBe('');
    expect(parsed.data.reminder).toBe(false);
    expect(parsed.data.recurrence).toBe('none');
  });

  it('rejects impossible calendar dates and malformed reminder times', () => {
    const invalidDate = TodoFormSchema.safeParse({
      title: 'Plan trip', category: 'Personal', priority: 'medium', dueDate: '2026-02-30',
    });
    const invalidTime = TodoFormSchema.safeParse({
      title: 'Plan trip', category: 'Personal', priority: 'medium', reminderTime: '27:90',
    });
    expect(invalidDate.success).toBe(false);
    expect(invalidTime.success).toBe(false);
  });

  it('requires a reminder time when reminders are enabled', () => {
    const parsed = TodoFormSchema.safeParse({
      title: 'Submit report', category: 'Work', priority: 'high', reminder: true,
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(parsed.error.issues.some((issue) => issue.path[0] === 'reminderTime')).toBe(true);
  });

  it('accepts a real local date, valid time and legacy due-date labels', () => {
    expect(TodoFormSchema.safeParse({
      title: 'Check in', category: 'Travel', priority: 'medium',
      dueDate: '2026-10-25', reminder: true, reminderTime: '09:30',
    }).success).toBe(true);
    expect(TodoFormSchema.safeParse({
      title: 'Check in', category: 'Travel', priority: 'medium', dueDate: 'Today',
    }).success).toBe(true);
  });
});
