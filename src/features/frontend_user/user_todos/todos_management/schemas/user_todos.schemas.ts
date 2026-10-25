/**
 * RESPONSIBILITY: Validation schema and field rules for Todo creation and editing.
 * FLOW: Consumed by Todo form handlers and action sheets before committing mutations.
 */

import type { TodoPriority, TodoRecurrence } from '../types/user_todos.types';

export interface TodoFormInput {
  title: string;
  description?: string;
  category: string;
  priority: TodoPriority;
  dueDate: string;
  reminder: boolean;
  reminderTime?: string | null;
  recurrence?: TodoRecurrence;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates Todo input fields against architectural requirements.
 * @param input - Todo form values
 * @returns ValidationResult with field-specific error messages
 */
export function validateTodoInput(input: Partial<TodoFormInput>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.title || input.title.trim().length === 0) {
    errors.title = 'Task title is required';
  } else if (input.title.trim().length < 2) {
    errors.title = 'Title must be at least 2 characters';
  } else if (input.title.trim().length > 150) {
    errors.title = 'Title cannot exceed 150 characters';
  }

  if (input.description && input.description.length > 500) {
    errors.description = 'Description cannot exceed 500 characters';
  }

  if (!input.category || input.category.trim().length === 0) {
    errors.category = 'Category is required';
  }

  if (!input.priority || !['low', 'medium', 'high'].includes(input.priority)) {
    errors.priority = 'Priority must be low, medium, or high';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
