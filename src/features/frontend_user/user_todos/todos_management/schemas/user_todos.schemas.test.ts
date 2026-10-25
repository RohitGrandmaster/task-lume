/**
 * RESPONSIBILITY: Verifies Todo form schema boundaries and backwards-compatible field errors.
 * FLOW: Jest passes representative form payloads to TodoFormSchema and validateTodoInput.
 */

import { TodoFormSchema, validateTodoInput } from './user_todos.schemas';

const validForm = {
  title: 'Write release notes',
  description: 'Draft user-facing changes',
  category: 'Work',
  priority: 'high' as const,
  dueDate: '2026-10-25',
  reminder: false,
  reminderTime: null,
  recurrence: 'none' as const,
};

describe('TodoFormSchema', () => {
  it('accepts a complete valid task form', () => {
    expect(TodoFormSchema.safeParse(validForm).success).toBe(true);
  });

  it('trims the title and rejects a title shorter than two characters', () => {
    expect(TodoFormSchema.parse({ ...validForm, title: '  Release notes  ' }).title).toBe('Release notes');
    expect(TodoFormSchema.safeParse({ ...validForm, title: ' x ' }).success).toBe(false);
  });

  it('rejects a title above the 150 character limit and descriptions above 500 characters', () => {
    expect(TodoFormSchema.safeParse({ ...validForm, title: 'x'.repeat(151) }).success).toBe(false);
    expect(TodoFormSchema.safeParse({ ...validForm, description: 'x'.repeat(501) }).success).toBe(false);
  });

  it('rejects an empty category and unknown priority/recurrence values', () => {
    expect(TodoFormSchema.safeParse({ ...validForm, category: '   ' }).success).toBe(false);
    expect(TodoFormSchema.safeParse({ ...validForm, priority: 'urgent' }).success).toBe(false);
    expect(TodoFormSchema.safeParse({ ...validForm, recurrence: 'yearly' }).success).toBe(false);
  });
});

describe('validateTodoInput', () => {
  it('maps schema issues to actionable field errors', () => {
    const result = validateTodoInput({ title: '', category: '', priority: 'high' });
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBe('Title must be at least 2 characters');
    expect(result.errors.category).toBe('Category is required');
  });

  it('returns no errors for a valid payload', () => {
    expect(validateTodoInput(validForm)).toEqual({ isValid: true, errors: {} });
  });
});
