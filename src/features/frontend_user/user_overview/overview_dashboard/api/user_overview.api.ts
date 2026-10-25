/**
 * RESPONSIBILITY: Canonical API service for User Overview Dashboard (≤150 lines).
 * FLOW: Fetches productivity stats and chart data via networkClient.
 */

import { networkClient } from '../../../../../core/network/networkClient';
import type { ApiResponse } from '../../../../../core/network/apiResponse.types';
import { USER_OVERVIEW_URL_CONFIG } from '../config/user_overview.url_config';

export interface OverviewMetricsDto {
  completedToday: number;
  totalActive: number;
  streakDays: number;
  weeklyRates: number[];
}

export const userOverviewApi = {
  fetchStats: async (): Promise<ApiResponse<OverviewMetricsDto>> => {
    return networkClient.get<OverviewMetricsDto>(USER_OVERVIEW_URL_CONFIG.API.STATS);
  },
};
