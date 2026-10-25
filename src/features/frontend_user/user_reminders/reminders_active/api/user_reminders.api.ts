/**
 * RESPONSIBILITY: Canonical API service for User Active Reminders (≤150 lines).
 * FLOW: Fetches alarms, schedules snoozes, and dismisses notifications via networkClient.
 */

import { networkClient } from '../../../../../core/network/networkClient';
import type { ApiResponse } from '../../../../../core/network/apiResponse.types';
import { USER_REMINDERS_URL_CONFIG } from '../config/user_reminders.url_config';

export interface ReminderDto {
  id: string;
  title: string;
  dueTimestamp: number;
  snoozedCount: number;
}

export const userRemindersApi = {
  fetchReminders: async (): Promise<ApiResponse<ReminderDto[]>> => {
    return networkClient.get<ReminderDto[]>(USER_REMINDERS_URL_CONFIG.API.REMINDERS);
  },
};
