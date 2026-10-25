/**
 * RESPONSIBILITY: Canonical feature hook for User Calendar Agenda (≤150 lines).
 * FLOW: Manages selected date cursor, month navigation, and agenda task list.
 */

import { useState, useCallback } from 'react';
import { useTodoContext } from '../../../../../context/TodoContext';
import { triggerLightImpact } from '../../../../../core/interaction/haptics';

export function useUserCalendar() {
  const { tasks } = useTodoContext();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const selectDate = useCallback((dateStr: string) => {
    triggerLightImpact();
    setSelectedDate(dateStr);
  }, []);

  return {
    todos: tasks || [],
    selectedDate,
    selectDate,
  };
}
