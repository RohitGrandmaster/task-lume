/**
 * RESPONSIBILITY: Canonical API service for User Settings & Profile (≤150 lines).
 * FLOW: Updates user profile and submits feedback ratings via networkClient.
 */

import { networkClient } from '../../../../../core/network/networkClient';
import type { ApiResponse } from '../../../../../core/network/apiResponse.types';
import { USER_SETTINGS_URL_CONFIG } from '../config/user_settings.url_config';

export interface FeedbackDto {
  category: string;
  rating: number;
  comment: string;
}

export const userSettingsApi = {
  submitFeedback: async (dto: FeedbackDto, idempotencyKey: string): Promise<ApiResponse<null>> => {
    return networkClient.post<null>(USER_SETTINGS_URL_CONFIG.API.FEEDBACK, dto, { idempotencyKey });
  },
};
