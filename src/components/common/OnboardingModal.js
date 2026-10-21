import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import {
  Sparkles,
  CheckCircle2,
  Timer,
  Mic,
  StickyNote,
  Shield,
  ArrowRight,
  Check,
  Zap,
  Bell,
  Palette,
  Lock,
} from 'lucide-react-native';
import useTheme from '../../hooks/useTheme';
import {setItem} from '../../storage/storage';
import {haptic} from '../../utils/haptics';

export const ONBOARDING_KEY = '@todomaster/has_seen_onboarding';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const SLIDES = [
  {
    id: 'todos',
    badge: 'SMART TASKS',
    title: 'Master Your Day',
    subtitle:
      'Organize your life with intelligent tasks, flexible due dates, priority labels, and instant audio-backed reminders.',
    accent: '#3B82F6',
    icon: CheckCircle2,
    highlights: [
      {icon: Zap, text: 'Custom priorities & categories'},
      {icon: Bell, text: 'Smart timers & reminder notifications'},
      {icon: CheckCircle2, text: 'Quick swipe gestures & status filters'},
    ],
  },
  {
    id: 'pomodoro',
    badge: 'DEEP WORK',
    title: 'Focus Pomodoro',
    subtitle:
      'Crush procrastination using customizable interval timers with sound alerts, vibration cues, and detailed session tracking.',
    accent: '#EC4899',
    icon: Timer,
    highlights: [
      {icon: Timer, text: 'Classic (25m), Deep (50m) & Sprint presets'},
      {icon: Zap, text: 'Link specific tasks to focus sessions'},
      {icon: Sparkles, text: 'Comprehensive focus history & streaks'},
    ],
  },
  {
    id: 'memos_notes',
    badge: 'VOICE & NOTES',
    title: 'Capture Anything',
    subtitle:
      'Record high-fidelity voice memos on the go and jot down quick notes with beautiful color palettes and auto-save.',
    accent: '#10B981',
    icon: Mic,
    highlights: [
      {icon: Mic, text: 'High-quality AAC voice recorder & player'},
      {icon: StickyNote, text: 'Auto-saved notes with 6 pastel palettes'},
      {icon: Sparkles, text: 'Unified search across all tasks and notes'},
    ],
  },
  {
    id: 'privacy',
    badge: '100% PRIVATE',
    title: 'Private & Secure',
    subtitle:
      'Your data stays strictly on your device with no cloud tracking. Protect sensitive plans with Biometric & PIN lock.',
    accent: '#8B5CF6',
    icon: Shield,
    highlights: [
      {icon: Lock, text: 'Biometric / PIN lock protection'},
      {icon: Palette, text: 'Sleek AMOLED dark mode & custom themes'},
      {icon: Shield, text: 'Offline-first storage & easy JSON export'},
    ],
  },
];

export default function OnboardingModal({visible, onClose}) {
  const {theme} = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  const handleScroll = event => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== currentIndex && index >= 0 && index < SLIDES.length) {
      setCurrentIndex(index);
    }
  };

  const handleNext = async () => {
    try {
      haptic();
    } catch (_) {}

    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    } else {
      await handleFinish();
    }
  };

  const handleFinish = async () => {
    try {
      haptic();
    } catch (_) {}
    try {
      await setItem(ONBOARDING_KEY, true);
    } catch (e) {
      console.warn('Failed to save onboarding state:', e);
    }
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  if (!visible) return null;

  const activeSlide = SLIDES[currentIndex] || SLIDES[0];
  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={handleFinish}>
      <View
        style={[
          styles.overlay,
          {backgroundColor: theme.mode === 'dark' ? '#090D16' : '#F8FAFC'},
        ]}>
        {/* Top bar with Skip button */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View
              style={[
                styles.brandDot,
                {backgroundColor: activeSlide.accent},
              ]}
            />
            <Text
              style={[
                styles.brandTitle,
                {color: theme.colors.text},
              ]}>
              Tasklume
            </Text>
          </View>

          {!isLast && (
            <Pressable
              onPress={handleFinish}
              style={styles.skipBtn}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Skip tutorial">
              <Text
                style={[
                  styles.skipText,
                  {color: theme.colors.textSecondary},
                ]}>
                Skip
              </Text>
            </Pressable>
          )}
        </View>

        {/* Scrollable Slides */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          contentContainerStyle={styles.scrollContent}>
          {SLIDES.map(slide => {
            const Icon = slide.icon;
            return (
              <View key={slide.id} style={[styles.slide, {width: SCREEN_WIDTH}]}>
                {/* Hero Graphic Container */}
                <View
                  style={[
                    styles.iconCircleOuter,
                    {
                      backgroundColor:
                        theme.mode === 'dark'
                          ? `${slide.accent}16`
                          : `${slide.accent}12`,
                      borderColor: `${slide.accent}33`,
                    },
                  ]}>
                  <View
                    style={[
                      styles.iconCircleInner,
                      {
                        backgroundColor: slide.accent,
                        shadowColor: slide.accent,
                      },
                    ]}>
                    <Icon size={44} color="#FFFFFF" strokeWidth={2.4} />
                  </View>
                </View>

                {/* Badge */}
                <View
                  style={[
                    styles.badgeWrap,
                    {
                      backgroundColor:
                        theme.mode === 'dark'
                          ? `${slide.accent}22`
                          : `${slide.accent}15`,
                      borderColor: `${slide.accent}40`,
                    },
                  ]}>
                  <Text style={[styles.badgeText, {color: slide.accent}]}>
                    {slide.badge}
                  </Text>
                </View>

                {/* Title & Subtitle */}
                <Text
                  style={[styles.title, {color: theme.colors.text}]}>
                  {slide.title}
                </Text>
                <Text
                  style={[
                    styles.subtitle,
                    {color: theme.colors.textSecondary},
                  ]}>
                  {slide.subtitle}
                </Text>

                {/* Highlights Card */}
                <View
                  style={[
                    styles.highlightsCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}>
                  {slide.highlights.map((h, i) => {
                    const HIcon = h.icon;
                    return (
                      <View key={i} style={styles.highlightRow}>
                        <View
                          style={[
                            styles.highlightDot,
                            {backgroundColor: `${slide.accent}20`},
                          ]}>
                          <HIcon
                            size={14}
                            color={slide.accent}
                            strokeWidth={2.6}
                          />
                        </View>
                        <Text
                          style={[
                            styles.highlightText,
                            {color: theme.colors.text},
                          ]}>
                          {h.text}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Bottom Navigation: Pagination Dots & Action Button */}
        <View style={styles.bottomBar}>
          {/* Pagination Dots */}
          <View style={styles.dotsRow}>
            {SLIDES.map((s, idx) => {
              const active = idx === currentIndex;
              return (
                <View
                  key={s.id}
                  style={[
                    styles.dot,
                    active
                      ? [
                          styles.dotActive,
                          {
                            backgroundColor: activeSlide.accent,
                            width: 24,
                          },
                        ]
                      : [
                          styles.dotInactive,
                          {
                            backgroundColor:
                              theme.mode === 'dark'
                                ? 'rgba(255,255,255,0.2)'
                                : 'rgba(0,0,0,0.15)',
                          },
                        ],
                  ]}
                />
              );
            })}
          </View>

          {/* Next / Get Started Button */}
          <Pressable
            onPress={handleNext}
            style={({pressed}) => [
              styles.actionBtn,
              {
                backgroundColor: activeSlide.accent,
                shadowColor: activeSlide.accent,
                transform: [{scale: pressed ? 0.96 : 1}],
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={isLast ? 'Get started' : 'Next slide'}>
            <Text style={styles.actionBtnText}>
              {isLast ? 'Get Started' : 'Continue'}
            </Text>
            {isLast ? (
              <Check size={18} color="#FFFFFF" strokeWidth={2.8} />
            ) : (
              <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.8} />
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    paddingTop: 44,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    alignItems: 'center',
  },
  slide: {
    paddingHorizontal: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleOuter: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconCircleInner: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  badgeWrap: {
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    borderRadius: 99,
    borderWidth: 1,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.6,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 22,
    paddingHorizontal: 12,
  },
  highlightsCard: {
    width: '100%',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  highlightDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 12,
    gap: 18,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    height: 7,
    borderRadius: 3.5,
  },
  dotActive: {
    height: 7,
  },
  dotInactive: {
    width: 7,
  },
  actionBtn: {
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
