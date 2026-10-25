/**
 * RESPONSIBILITY: Verifies Voice Memos does not simulate audio capture or invent a transcript.
 * FLOW: Render the screen → assert the honest unavailable state is visible and no save action is present.
 */
import React from 'react';
import { create, act, type ReactTestRenderer } from 'react-test-renderer';
import { UserVoiceMainView } from './UserVoiceMainView';

jest.mock('../../../../../core/theme/useThemeTokens', () => ({
  useThemeTokens: () => ({
    color: {
      background: '#F4F4F5',
      card: '#FFFFFF',
      cardElevated: '#FAFAFA',
      border: '#E4E4E7',
      foreground: '#000000',
      muted: '#52525B',
    },
    space: { 2: 8, 3: 12, 4: 16, 6: 24, 8: 40 },
    radius: { md: 8, full: 9999 },
    typography: {
      headingLg: { fontSize: 22, lineHeight: 28, letterSpacing: -0.5, fontWeight: '700' },
      body: { fontSize: 16, lineHeight: 24, letterSpacing: 0, fontWeight: '400' },
      bodySm: { fontSize: 14, lineHeight: 21, letterSpacing: 0, fontWeight: '400' },
    },
    icon: { md: 20, lg: 24 },
    layout: { fabSize: 56 },
    opacity: { disabled: 0.5 },
  }),
}));

jest.mock('../../../../../core/i18n/useTranslation', () => ({ useTranslation: () => ({ t: (key: string) => ({
  'user_voice_memos.PAGE_TITLE': 'Voice Memos',
  'user_voice_memos.RECORDING_UNAVAILABLE': 'Voice recording is unavailable in this build.',
  'user_voice_memos.VOICE_CAPTURE_CONTRACT': 'The configured speech-recognition dependency is archived. Recording and transcription must be connected to an approved, supported native integration before this action can be enabled.',
}[key] ?? key) }) }));

describe('UserVoiceMainView blocked state', () => {
  it('shows the unavailable state and does not manufacture transcript or save controls', () => {
    let root!: ReactTestRenderer;
    act(() => { root = create(<UserVoiceMainView />); });
    expect(root.root.findAllByType(require('react-native').Text).some(
      (node) => String(node.props.children).includes('Voice recording is unavailable in this build.'),
    )).toBe(true);
    expect(root.root.findAllByProps({ testID: 'user_voice-recording-unavailable' })).toHaveLength(1);
    expect(root.root.findAllByProps({ testID: 'user_voice-save-as-task' })).toHaveLength(0);
    act(() => root.unmount());
  });
});
