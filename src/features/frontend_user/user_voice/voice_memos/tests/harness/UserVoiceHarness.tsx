/**
 * RESPONSIBILITY: Standalone Voice UI harness with observable save-as-task feedback.
 * FLOW: UserVoiceMainView callback → local harness feedback; no native microphone is claimed in this visual harness.
 */

import React, { useState } from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { ThemeProvider } from '../../../../../../core/theme/ThemeProvider';
import { useThemeTokens } from '../../../../../../core/theme/useThemeTokens';
import { UserVoiceMainView } from '../../components/UserVoiceMainView';

function HarnessInner({ title, children }: { title: string; children: React.ReactNode }) {
  const tokens = useThemeTokens();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.background }}>
      <View style={{ padding: tokens.space[2], backgroundColor: tokens.color.card, borderBottomWidth: 1, borderBottomColor: tokens.color.border }}>
        <Text style={{ color: tokens.color.primary, ...tokens.typography.caption, fontWeight: '700' }}>{title}</Text>
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
}

function UserVoiceHarnessContent() {
  const [feedback, setFeedback] = useState('Visual harness only — native speech recognition is not connected here.');
  return (
    <HarnessInner title="Harness: UserVoice [VISUAL_ONLY]">
      <Text accessibilityLiveRegion="polite">{feedback}</Text>
      <UserVoiceMainView onSaveAsTask={(transcript) => setFeedback(`Save callback received (${transcript.length} characters)`)} />
    </HarnessInner>
  );
}

export function UserVoiceHarness() {
  return <ThemeProvider><UserVoiceHarnessContent /></ThemeProvider>;
}
