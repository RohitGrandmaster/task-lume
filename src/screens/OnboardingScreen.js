import React, {useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {CalendarDays, CheckCircle2, Timer, ChevronRight, ChevronLeft} from 'lucide-react-native';
import useTheme from '../hooks/useTheme';
import {LocalizedText} from '../i18n/LocalizedText';

const STEPS = [
  {
    icon: CheckCircle2,
    title: 'Capture what matters',
    body: 'Create tasks, set priorities, and keep everyday work organised in one place.',
  },
  {
    icon: CalendarDays,
    title: 'Plan your day',
    body: 'Use due dates, reminders, categories, and the calendar to stay on track.',
  },
  {
    icon: Timer,
    title: 'Make focus time count',
    body: 'Start a focus session or task timer, take intentional breaks, and review your progress.',
  },
];

export default function OnboardingScreen({onFinish}) {
  const {theme} = useTheme();
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const finalStep = step === STEPS.length - 1;

  const finish = () => {
    if (typeof onFinish === 'function') onFinish();
  };

  return (
    <SafeAreaView style={[styles.safeArea, {backgroundColor: theme.colors.background}]}>
      <View style={styles.topRow}>
        <LocalizedText style={[styles.brand, {color: theme.colors.text}]}>Tasklume</LocalizedText>
        <Pressable onPress={finish} accessibilityRole="button" accessibilityLabel="Skip onboarding">
          <LocalizedText style={[styles.skip, {color: theme.colors.textSecondary}]}>Skip</LocalizedText>
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={[styles.iconWrap, {backgroundColor: theme.colors.primary + '18', borderColor: theme.colors.primary + '30'}]}>
          <Icon size={50} color={theme.colors.primary} strokeWidth={1.8} />
        </View>
        <LocalizedText style={[styles.title, {color: theme.colors.text}]}>{current.title}</LocalizedText>
        <LocalizedText style={[styles.body, {color: theme.colors.textSecondary}]}>{current.body}</LocalizedText>

        <View style={styles.dots}>
          {STEPS.map((item, index) => (
            <View
              key={item.title}
              style={{
                width: index === step ? 24 : 8,
                height: 8,
                borderRadius: 8,
                backgroundColor: index === step ? theme.colors.primary : theme.colors.border,
              }}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={() => setStep(value => Math.max(0, value - 1))}
          disabled={step === 0}
          accessibilityRole="button"
          accessibilityLabel="Previous onboarding step"
          style={[styles.backButton, {borderColor: theme.colors.border, opacity: step === 0 ? 0.35 : 1}]}>
          <ChevronLeft size={20} color={theme.colors.text} />
        </Pressable>
        <Pressable
          onPress={() => (finalStep ? finish() : setStep(value => Math.min(STEPS.length - 1, value + 1)))}
          accessibilityRole="button"
          style={[styles.primaryButton, {backgroundColor: theme.colors.primary}]}>
          <LocalizedText style={styles.primaryButtonText}>{finalStep ? 'Get started' : 'Next'}</LocalizedText>
          {!finalStep ? <ChevronRight size={18} color="#FFFFFF" /> : null}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, paddingHorizontal: 24, paddingVertical: 12},
  topRow: {height: 48, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  brand: {fontSize: 18, fontWeight: '900', letterSpacing: -0.4},
  skip: {fontSize: 14, fontWeight: '700', padding: 8},
  content: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 36},
  iconWrap: {width: 124, height: 124, borderRadius: 36, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 32},
  title: {fontSize: 28, lineHeight: 35, fontWeight: '900', textAlign: 'center', marginBottom: 14, letterSpacing: -0.7},
  body: {fontSize: 15, lineHeight: 24, textAlign: 'center', maxWidth: 330, paddingHorizontal: 8},
  dots: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 34},
  footer: {flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 12},
  backButton: {width: 50, height: 50, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center'},
  primaryButton: {flex: 1, minHeight: 50, borderRadius: 16, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8},
  primaryButtonText: {color: '#FFFFFF', fontWeight: '800', fontSize: 15},
});
