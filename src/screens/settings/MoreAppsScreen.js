import React, {useMemo} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Linking,
  Alert,
  UIManager,
  Platform,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {
  ArrowLeft,
  Globe,
  ExternalLink,
  Rocket,
  Sparkles,
  AppWindow,
  Layers,
  Clock,
  CheckCircle2,
  Zap,
  Package,
} from 'lucide-react-native';

import {useTheme} from '../../hooks/useTheme';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/* --------------------------- DATA --------------------------- */
/* 👇 YAHAN APNE 5 WEBSITES ADD KARO — bas url aur details badlo */

const WEBSITES = [
  {
    id: 'site1',
    title: 'My Portfolio',
    description: 'Projects, blogs and everything I build.',
    url: 'https://example.com',
    Icon: Globe,
    color: '#6366F1',
  },
  {
    id: 'site2',
    title: 'Blog',
    description: 'Articles on productivity, tech and life.',
    url: 'https://example.com/blog',
    Icon: Sparkles,
    color: '#8B5CF6',
  },
  {
    id: 'site3',
    title: 'Tools & Utilities',
    description: 'Free web tools and calculators.',
    url: 'https://example.com/tools',
    Icon: Zap,
    color: '#F59E0B',
  },
  {
    id: 'site4',
    title: 'YouTube Channel',
    description: 'Tutorials and walkthroughs.',
    url: 'https://youtube.com',
    Icon: Rocket,
    color: '#EC4899',
  },
  {
    id: 'site5',
    title: 'Support & Contact',
    description: 'Get in touch or find help.',
    url: 'https://example.com/contact',
    Icon: Package,
    color: '#14B8A6',
  },
];

/* 👇 YAHAN FUTURE APPS ADD KARO */

const UPCOMING_APPS = [
  {
    id: 'notes',
    title: 'Todo Notes',
    description: 'Capture ideas, meeting notes and quick thoughts.',
    Icon: Layers,
    color: '#0EA5E9',
  },
  {
    id: 'habits',
    title: 'Habit Tracker',
    description: 'Build consistent routines and track your progress.',
    Icon: CheckCircle2,
    color: '#10B981',
  },
];

/* --------------------------- SCREEN --------------------------- */

function MoreAppsScreen() {
  const {theme} = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(theme, insets),
    [theme, insets],
  );

  /* --------------------------- HANDLERS --------------------------- */
  function handleBack() {
    navigation.goBack();
  }

  async function openWebsite(site) {
    try {
      const supported = await Linking.canOpenURL(site.url);
      if (supported) {
        await Linking.openURL(site.url);
      } else {
        Alert.alert(
          'Cannot open',
          `We couldn't open ${site.title}. Please try again later.`,
        );
      }
    } catch (e) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  }

  /* --------------------------- RENDER --------------------------- */
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            onPress={handleBack}
            style={styles.backBtn}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <ArrowLeft
              size={18}
              color={theme.colors.text}
              strokeWidth={2.6}
            />
          </Pressable>

          <View style={styles.headerContent}>
            <Text style={styles.title}>More</Text>
            <Text style={styles.subtitle}>
              Websites & upcoming apps
            </Text>
          </View>
        </View>

        {/* HERO CARD */}
        <View
          style={[
            styles.heroCard,
            {backgroundColor: theme.colors.primary},
          ]}>
          <View style={styles.heroDecor1} pointerEvents="none" />
          <View style={styles.heroDecor2} pointerEvents="none" />

          <View style={styles.heroIconWrap}>
            <AppWindow
              size={22}
              color="#FFFFFF"
              strokeWidth={2.4}
            />
          </View>

          <Text style={styles.heroTitle}>
            Explore my world
          </Text>
          <Text style={styles.heroDesc}>
            Websites, tools and upcoming apps — all in one place.
          </Text>
        </View>

        {/* ============ WEBSITES ============ */}
        <View style={styles.sectionRow}>
          <Text
            style={[styles.sectionTitle, {color: theme.colors.text}]}>
            My Websites
          </Text>
          <View
            style={[
              styles.sectionCount,
              {backgroundColor: theme.colors.primary + '14'},
            ]}>
            <Text
              style={[
                styles.sectionCountText,
                {color: theme.colors.primary},
              ]}>
              {WEBSITES.length}
            </Text>
          </View>
        </View>

        {WEBSITES.map(site => {
          const SiteIcon = site.Icon;
          return (
            <Pressable
              key={site.id}
              onPress={() => openWebsite(site)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${site.title}`}
              style={({pressed}) => [
                styles.card,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}>
              <View
                style={[
                  styles.cardAccent,
                  {backgroundColor: site.color},
                ]}
                pointerEvents="none"
              />

              <View
                style={[
                  styles.cardIcon,
                  {backgroundColor: site.color + '18'},
                ]}>
                <SiteIcon
                  size={19}
                  color={site.color}
                  strokeWidth={2.4}
                />
              </View>

              <View style={styles.cardContent}>
                <View style={styles.cardTitleRow}>
                  <Text
                    style={[
                      styles.cardTitle,
                      {color: theme.colors.text},
                    ]}
                    numberOfLines={1}>
                    {site.title}
                  </Text>
                  <ExternalLink
                    size={12}
                    color={theme.colors.textLight}
                    strokeWidth={2.6}
                  />
                </View>
                <Text
                  style={[
                    styles.cardDesc,
                    {color: theme.colors.textSecondary},
                  ]}
                  numberOfLines={2}>
                  {site.description}
                </Text>
              </View>
            </Pressable>
          );
        })}

        {/* ============ UPCOMING APPS ============ */}
        {UPCOMING_APPS.length > 0 && (
          <>
            <View style={[styles.sectionRow, {marginTop: 22}]}>
              <Text
                style={[
                  styles.sectionTitle,
                  {color: theme.colors.text},
                ]}>
                Coming Soon
              </Text>
              <View
                style={[
                  styles.sectionCount,
                  {backgroundColor: '#F59E0B' + '18'},
                ]}>
                <Text
                  style={[
                    styles.sectionCountText,
                    {color: '#F59E0B'},
                  ]}>
                  {UPCOMING_APPS.length}
                </Text>
              </View>
            </View>

            {UPCOMING_APPS.map(app => {
              const AppIcon = app.Icon;
              return (
                <View
                  key={app.id}
                  style={[
                    styles.card,
                    styles.cardDisabled,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}>
                  <View
                    style={[
                      styles.cardAccent,
                      {backgroundColor: app.color + '80'},
                    ]}
                    pointerEvents="none"
                  />

                  <View
                    style={[
                      styles.cardIcon,
                      {backgroundColor: app.color + '15'},
                    ]}>
                    <AppIcon
                      size={19}
                      color={app.color}
                      strokeWidth={2.4}
                    />
                  </View>

                  <View style={styles.cardContent}>
                    <Text
                      style={[
                        styles.cardTitle,
                        {color: theme.colors.text},
                      ]}
                      numberOfLines={1}>
                      {app.title}
                    </Text>
                    <Text
                      style={[
                        styles.cardDesc,
                        {color: theme.colors.textSecondary},
                      ]}
                      numberOfLines={2}>
                      {app.description}
                    </Text>

                    <View
                      style={[
                        styles.soonPill,
                        {
                          backgroundColor: app.color + '14',
                          borderColor: app.color + '30',
                        },
                      ]}>
                      <Clock
                        size={9}
                        color={app.color}
                        strokeWidth={3}
                      />
                      <Text
                        style={[
                          styles.soonPillText,
                          {color: app.color},
                        ]}>
                        COMING SOON
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* FOOTER */}
        <View
          style={[
            styles.footerCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          <View
            style={[
              styles.footerIcon,
              {backgroundColor: theme.colors.primary + '14'},
            ]}>
            <Rocket
              size={14}
              color={theme.colors.primary}
              strokeWidth={2.6}
            />
          </View>
          <View style={{flex: 1, minWidth: 0}}>
            <Text
              style={[styles.footerTitle, {color: theme.colors.text}]}>
              Built for better productivity
            </Text>
            <Text
              style={[
                styles.footerText,
                {color: theme.colors.textSecondary},
              ]}>
              More tools will be added as our ecosystem grows.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* --------------------------- STYLES --------------------------- */

function createStyles(theme, insets) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: Math.max(insets.bottom, 12) + 30,
    },

    /* Header */
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 18,
    },
    backBtn: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    headerContent: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontSize: 24,
      fontWeight: '900',
      color: theme.colors.text,
      letterSpacing: -0.6,
    },
    subtitle: {
      marginTop: 2,
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      letterSpacing: 0.1,
    },

    /* Hero */
    heroCard: {
      padding: 20,
      borderRadius: 22,
      marginBottom: 20,
      overflow: 'hidden',
      shadowColor: theme.colors.primary,
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.28,
      shadowRadius: 18,
      elevation: 6,
    },
    heroDecor1: {
      position: 'absolute',
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: 'rgba(255,255,255,0.08)',
      top: -60,
      right: -50,
    },
    heroDecor2: {
      position: 'absolute',
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: 'rgba(255,255,255,0.06)',
      bottom: -40,
      left: -20,
    },
    heroIconWrap: {
      width: 46,
      height: 46,
      borderRadius: 15,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.25)',
    },
    heroTitle: {
      fontSize: 20,
      fontWeight: '900',
      color: '#FFFFFF',
      letterSpacing: -0.5,
    },
    heroDesc: {
      marginTop: 6,
      fontSize: 13,
      fontWeight: '500',
      color: 'rgba(255,255,255,0.85)',
      lineHeight: 19,
      maxWidth: 260,
      letterSpacing: 0.1,
    },

    /* Section */
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '900',
      letterSpacing: -0.3,
    },
    sectionCount: {
      minWidth: 24,
      height: 22,
      paddingHorizontal: 7,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionCountText: {
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.2,
    },

    /* Card */
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 14,
      paddingLeft: 18,
      borderRadius: 16,
      borderWidth: 1,
      marginBottom: 8,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 1,
    },
    cardDisabled: {
      shadowOpacity: 0,
      elevation: 0,
      opacity: 0.85,
    },
    cardAccent: {
      position: 'absolute',
      left: 0,
      top: 12,
      bottom: 12,
      width: 3,
      borderTopRightRadius: 3,
      borderBottomRightRadius: 3,
    },
    cardIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    cardContent: {
      flex: 1,
      minWidth: 0,
    },
    cardTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    cardTitle: {
      flex: 1,
      minWidth: 0,
      fontSize: 14.5,
      fontWeight: '800',
      letterSpacing: -0.2,
    },
    cardDesc: {
      marginTop: 3,
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 17,
      letterSpacing: 0.1,
    },

    /* Soon pill */
    soonPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start',
      marginTop: 8,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 6,
      borderWidth: 1,
    },
    soonPillText: {
      fontSize: 8.5,
      fontWeight: '900',
      letterSpacing: 0.8,
    },

    /* Footer */
    footerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderRadius: 16,
      borderWidth: 1,
      marginTop: 14,
    },
    footerIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    footerTitle: {
      fontSize: 13.5,
      fontWeight: '900',
      letterSpacing: -0.2,
    },
    footerText: {
      fontSize: 11,
      fontWeight: '600',
      marginTop: 2,
      letterSpacing: 0.1,
      lineHeight: 16,
    },
  });
}

export default MoreAppsScreen;