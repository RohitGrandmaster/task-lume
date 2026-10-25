/**
 * RESPONSIBILITY: Feature-local presentation formatters for todo priorities, categories, and due dates.
 * FLOW: Consumed by UserTodosTodoCard, UserTodosTodoList, and UserTodosDetailMainView.
 */

import type { TodoPriority } from '../types/user_todos.types';
import type { Tokens } from '../../../../../core/theme/tokenDefinitions';

export interface PriorityBadgeStyle {
  textColor: string;
  backgroundColor: string;
  label: string;
}

/**
 * Returns the semantic badge colors for a given priority level.
 */
export function getPriorityBadgeStyle(priority: TodoPriority, tokens: Tokens): PriorityBadgeStyle {
  switch (priority) {
    case 'high':
      return {
        textColor: tokens.color.statusDangerText,
        backgroundColor: tokens.color.statusDangerBg,
        label: 'High Priority',
      };
    case 'medium':
      return {
        textColor: tokens.color.statusWarningText,
        backgroundColor: tokens.color.statusWarningBg,
        label: 'Medium Priority',
      };
    case 'low':
    default:
      return {
        textColor: tokens.color.statusSuccessText,
        backgroundColor: tokens.color.statusSuccessBg,
        label: 'Low Priority',
      };
  }
}
