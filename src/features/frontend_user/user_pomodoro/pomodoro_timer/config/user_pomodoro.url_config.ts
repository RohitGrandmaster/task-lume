/**
 * RESPONSIBILITY: Centralized routes and endpoints for user_pomodoro domain.
 * FLOW: Consumed by navigation and focus timers.
 */

export const USER_POMODORO_ROUTES = {
  TIMER: 'UserPomodoroTimer',
} as const;

export const USER_POMODORO_ENDPOINTS = {
  SESSIONS: '/api/v1/user/pomodoro/sessions',
} as const;
