/**
 * RESPONSIBILITY: Canonical API service for User Voice Memos (≤150 lines).
 * FLOW: Saves recorded audio clips and transcript conversions via networkClient.
 */

import { networkClient } from '../../../../../core/network/networkClient';
import type { ApiResponse } from '../../../../../core/network/apiResponse.types';
import { USER_VOICE_URL_CONFIG } from '../config/user_voice.url_config';

export interface VoiceMemoDto {
  id: string;
  transcript: string;
  durationSeconds: number;
  createdAt: string;
}

export const userVoiceApi = {
  fetchMemos: async (): Promise<ApiResponse<VoiceMemoDto[]>> => {
    return networkClient.get<VoiceMemoDto[]>(USER_VOICE_URL_CONFIG.API.MEMOS);
  },
};
