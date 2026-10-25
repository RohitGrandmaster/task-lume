/**
 * RESPONSIBILITY: Zod schema and stable field-key errors for Todo create/edit forms.
 * FLOW: React Hook Form submits values through TodoFormSchema before the owning mutation handler is called.
 */
import { z } from 'zod';
import type { TodoPriority, TodoRecurrence } from '../types/user_todos.types';

export const TodoFormSchema = z.object({
  title: z.string().trim()
    .min(2, 'user_todos_management.VALIDATION_TITLE_MIN')
    .max(150, 'user_todos_management.VALIDATION_TITLE_MAX'),
  description: z.string().max(500, 'user_todos_management.VALIDATION_DESCRIPTION_MAX').optional(),
  category: z.string().trim().min(1, 'user_todos_management.VALIDATION_CATEGORY_REQUIRED'),
  priority: z.enum(['low', 'medium', 'high'], {
    invalid_type_error: 'user_todos_management.VALIDATION_PRIORITY_INVALID',
    required_error: 'user_todos_management.VALIDATION_PRIORITY_INVALID',
  }),
  dueDate: z.string().default(''),
  reminder: z.boolean().default(false),
  reminderTime: z.string().nullable().optional(),
  recurrence: z.enum(['none', 'daily', 'weekly', 'monthly']).default('none'),
});

export type TodoFormInput = z.infer<typeof TodoFormSchema>;

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates Todo form input using the canonical schema while preserving the legacy result shape.
 * @param input - Partial values from existing callers.
 * @returns Validity plus first field error message keys for localized feedback.
 */
export function validateTodoInput(input: Partial<TodoFormInput>): ValidationResult {
  const result = TodoFormSchema.safeParse(input);
  if (result.success) return { isValid: true, errors: {} };

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? 'form');
    if (!errors[field]) errors[field] = issue.message;
  }
  return { isValid: false, errors };
}
