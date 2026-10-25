/**
 * RESPONSIBILITY: Canonical Zod schema and field-validation contract for Todo create/edit forms.
 * FLOW: UserTodosTodoForm → React Hook Form zodResolver → this schema; legacy callers use validateTodoInput.
 */

import { z } from 'zod';

export const TodoPrioritySchema = z.enum(['low', 'medium', 'high']);
export const TodoRecurrenceSchema = z.enum(['none', 'daily', 'weekly', 'monthly']);

export const TodoFormSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(150, 'Title cannot exceed 150 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters'),
  category: z.string().trim().min(1, 'Category is required'),
  priority: TodoPrioritySchema,
  dueDate: z.string(),
  reminder: z.boolean(),
  reminderTime: z.string().nullable().optional(),
  recurrence: TodoRecurrenceSchema,
});

export type TodoFormInput = z.infer<typeof TodoFormSchema>;

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates Todo form values using the canonical Zod schema.
 *
 * @param input - Partial task form values to validate.
 * @returns Is-valid flag and the first actionable message for each failing field.
 */
export function validateTodoInput(input: Partial<TodoFormInput>): ValidationResult {
  const values = {
    title: input.title ?? '',
    description: input.description ?? '',
    category: input.category ?? '',
    priority: input.priority ?? '',
    dueDate: input.dueDate ?? '',
    reminder: input.reminder ?? false,
    reminderTime: input.reminderTime ?? null,
    recurrence: input.recurrence ?? 'none',
  };
  const result = TodoFormSchema.safeParse(values);
  if (result.success) return { isValid: true, errors: {} };

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const field = issue.path[0];
    if (typeof field === 'string' && !errors[field]) errors[field] = issue.message;
  });
  return { isValid: false, errors };
}
