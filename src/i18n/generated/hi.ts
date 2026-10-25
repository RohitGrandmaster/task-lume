/**
 * RESPONSIBILITY: Generated Hindi translation resources for feature-scoped mobile locale files.
 * FLOW: I18nProvider uses these resources for namespaced translation lookup.
 */
import calendar from '../../features/frontend_user/user_calendar/calendar_agenda/_locales/user_calendar_agenda_hi.json';
import overview from '../../features/frontend_user/user_overview/overview_dashboard/_locales/user_overview_dashboard_hi.json';
import pomodoro from '../../features/frontend_user/user_pomodoro/pomodoro_timer/_locales/user_pomodoro_timer_hi.json';
import reminders from '../../features/frontend_user/user_reminders/reminders_active/_locales/user_reminders_active_hi.json';
import settings from '../../features/frontend_user/user_settings/settings_profile/_locales/user_settings_profile_hi.json';
import todos from '../../features/frontend_user/user_todos/todos_management/_locales/user_todos_management_hi.json';
import voice from '../../features/frontend_user/user_voice/voice_memos/_locales/user_voice_memos_hi.json';

export const hi = {
  ...calendar,
  ...overview,
  ...pomodoro,
  ...reminders,
  ...settings,
  ...todos,
  ...voice,
} as const;
