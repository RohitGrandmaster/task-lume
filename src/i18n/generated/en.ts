/**
 * RESPONSIBILITY: Generated English translation resources for feature-scoped mobile locale files.
 * FLOW: I18nProvider uses these resources for namespaced translation lookup.
 */
import calendar from '../../features/frontend_user/user_calendar/calendar_agenda/_locales/user_calendar_agenda_en.json';
import overview from '../../features/frontend_user/user_overview/overview_dashboard/_locales/user_overview_dashboard_en.json';
import pomodoro from '../../features/frontend_user/user_pomodoro/pomodoro_timer/_locales/user_pomodoro_timer_en.json';
import reminders from '../../features/frontend_user/user_reminders/reminders_active/_locales/user_reminders_active_en.json';
import settings from '../../features/frontend_user/user_settings/settings_profile/_locales/user_settings_profile_en.json';
import todos from '../../features/frontend_user/user_todos/todos_management/_locales/user_todos_management_en.json';
import voice from '../../features/frontend_user/user_voice/voice_memos/_locales/user_voice_memos_en.json';

export const en = {
  ...calendar,
  ...overview,
  ...pomodoro,
  ...reminders,
  ...settings,
  ...todos,
  ...voice,
} as const;
