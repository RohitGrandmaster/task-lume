/**
 * RESPONSIBILITY: Canonical API service for User Calendar Agenda (≤150 lines).
 * FLOW: Fetches month dates with scheduled items and agenda day tasks via networkClient.
 */

import { networkClient } from '../../../../../core/network/networkClient';
import type { ApiResponse } from '../../../../../core/network/apiResponse.types';
import { USER_CALENDAR_URL_CONFIG } from '../config/user_calendar.url_config';

export interface CalendarMonthDto {
  year: number;
  month: number;
  daysWithTasks: number[];
}

export const userCalendarApi = {
  fetchMonth: async (year: number, month: number): Promise<ApiResponse<CalendarMonthDto>> => {
    return networkClient.get<CalendarMonthDto>(`${USER_CALENDAR_URL_CONFIG.API.MONTH}?year=${year}&month=${month}`);
  },
};
