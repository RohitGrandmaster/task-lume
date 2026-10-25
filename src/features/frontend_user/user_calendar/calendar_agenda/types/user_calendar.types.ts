/**
 * RESPONSIBILITY: Local canonical type definitions for calendar agenda tasks (Strict WET Principle).
 * FLOW: Consumed by UserCalendarMainView and UserCalendarScreen; zero sibling imports.
 */

export interface CalendarTaskEntity {
  id: string | number;
  title: string;
  dueDate: string;
  completed: boolean;
  deleted: boolean;
  priority?: string;
  category?: string;
}
