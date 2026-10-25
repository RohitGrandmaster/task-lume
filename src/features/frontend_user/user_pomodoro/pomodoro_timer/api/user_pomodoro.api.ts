/**
 * RESPONSIBILITY: Canonical API service for User Pomodoro Timer (≤150 lines).
 * FLOW: Logs focus intervals and synchronizes timer settings via networkClient.
 */

import { networkClient } from '../../../../../core/network/networkClient';
import type { ApiResponse } from '../../../../../core/network/apiResponse.types';
import { USER_POMODORO_URL_CONFIG } from '../config/user_pomodoro.url_config';

export interface PomodoroSessionDto {
  durationMinutes: number;
  mode: 'focus' | 'short_break' | 'long_break';
  completedAt: string;
}

export const userPomodoroApi = {
  logSession: async (dto: PomodoroSessionDto, idempotencyKey: string): Promise<ApiResponse<null>> => {
    return networkClient.post<null>(USER_POMODORO_URL_CONFIG.API.SESSIONS, dto, { idempotencyKey });
  },
};
