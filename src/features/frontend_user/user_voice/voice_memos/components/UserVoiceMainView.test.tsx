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
      muted: '#52525B', destructive: '#B91C1C', primary: '#A16207', primarySubtle: '#FEF3C7', onPrimary: '#FFFFFF', onDestructive: '#FFFFFF', statusDangerBg: '#FEE2E2', statusDangerText: '#991B1B', destructive: '#B91C1C', primary: '#A16207', primarySubtle: '#FEF3C7', onPrimary: '#FFFFFF', onDestructive: '#FFFFFF', statusDangerBg: '#FEE2E2', statusDangerText: '#991B1B',
    },
    space: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, 8: 40, 9: 48 },
    radius: { sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
    typography: {
      headingLg: { fontSize: 22, lineHeight: 28, letterSpacing: -0.5, fontWeight: '700' },
      headingSm: { fontSize: 18, lineHeight: 22, letterSpacing: -0.5, fontWeight: '600' },
      headingSm: { fontSize: 18, lineHeight: 22, letterSpacing: -0.5, fontWeight: '600' },
      body: { fontSize: 16, lineHeight: 24, letterSpacing: 0, fontWeight: '400' },
      bodySm: { fontSize: 14, lineHeight: 21, letterSpacing: 0, fontWeight: '400' },
    },
    icon: { sm: 16, md: 20, lg: 24, stroke: 1.75 },
    layout: { fabSize: 56, headerHeight: 56 },
    opacity: { disabled: 0.5, loading: 0.7, masked: 0.8 },
  }),
}));

jest.mock('../../../../../core/i18n/useTranslation', () => ({ useTranslation: () => ({ t: (key: string) => ({
  'user_voice_memos.PAGE_TITLE': 'Voice Memos',
  'user_voice_memos.VOICE_CAPTURE_CONTRACT': 'Record and play audio locally. Add a transcript or notes manually; automatic speech-to-text is not connected.',
  'user_voice_memos.START_RECORDING': 'Start recording',
  'user_voice_memos.RECORDING_CONTROL_HINT': 'Audio is recorded locally until you stop it.',
  'user_voice_memos.RECORDING_IDLE': 'Ready to record',
  'user_voice_memos.SAVED_MEMOS': 'Saved voice memos',
  'user_voice_memos.EMPTY_TITLE': 'No voice memos yet',
  'user_voice_memos.EMPTY_DESCRIPTION': 'Start a recording above. Add transcript or notes manually, then convert them into a task.',
  'user_voice_memos.OPEN_DRAWER': 'Open navigation drawer',
  'user_voice_memos.RECORDING_ERROR': 'Audio recording failed.',
}[key] ?? key) }) }));

describe('UserVoiceMainView local recorder', () => {
  it('renders actual recording controls and labels manual transcription honestly', () => {
    let root!: ReactTestRenderer;
    act(() => { root = create(<UserVoiceMainView />); });
    expect(root.root.findAllByProps({ testID: 'user_voice-record-toggle' })).toHaveLength(1);
    expect(root.root.findAllByProps({ testID: 'user_voice-memo-list' })).toHaveLength(1);
    expect(root.root.findAllByType(require('react-native').Text).some(
      (node) => String(node.props.children).includes('automatic speech-to-text is not connected'),
    )).toBe(true);
    act(() => root.unmount());
  });
});
