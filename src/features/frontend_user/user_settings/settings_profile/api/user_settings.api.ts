/**
 * RESPONSIBILITY: Canonical API service for User Settings & Profile (≤150 lines).
 * FLOW: Updates user profile and submits feedback ratings via networkClient.
 */

import { networkClient } from '../../../../../core/network/networkClient';
import type { ApiResponse } from '../../../../../core/network/apiResponse.types';

export interface FeedbackDto {
  category: string;
  rating: number;
  comment: string;
}

export const userSettingsApi = {
  submitFeedback: async (dto: FeedbackDto, idempotencyKey: string): Promise<ApiResponse<null>> => {
    void dto;
    void idempotencyKey;
    throw new Error('Feedback submission is unavailable: the approved backend contract does not define a feedback endpoint.');
  },
};
