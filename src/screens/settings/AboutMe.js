import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  Linking,
  Alert,
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Path,
  Circle,
} from 'react-native-svg';

import {useTheme} from '../../hooks/useTheme';

const AVATAR_SOURCE = require('../../assets/images/WhatsApp_Image_2.png');

const PROFILE = {
  name: 'Rohit Kumar',
  role: 'Software Engineer',
  tagline: 'Develop & Design',
  whatsapp: '918084350824',
  instagram: 'hacking_grand_master',
};

const openWhatsApp = async () => {
  const url = `https://wa.me/${PROFILE.whatsapp}`;
  try {
    await Linking.openURL(url);
  } catch (error) {
    Alert.alert('Error', 'WhatsApp link open nahi ho paya.');
  }
};

const openInstagram = async () => {
  const url = `https://instagram.com/${PROFILE.instagram}`;
  try {
    await Linking.openURL(url);
  } catch (error) {
    Alert.alert('Error', 'Instagram link open nahi ho paya.');
  }
};

const WhatsAppIcon = ({size = 26}) => (
  <Svg width={size} height={size} viewBox="0 0 32 32">
    <Path
      fill="#25D366"
      d="M16 2.5A13.4 13.4 0 0 0 4.4 22.6L2.5 29.5l7.1-1.9A13.5 13.5 0 1 0 16 2.5Z"
    />
    <Path
      fill="#FFFFFF"
      d="M23.2 19.1c-.4-.2-2.3-1.1-2.7-1.2-.4-.2-.6-.2-.9.2-.3.4-1 1.2-1.3 1.5-.2.3-.5.3-.9.1-.4-.2-1.7-.6-3.2-2-1.2-1.1-2-2.4-2.2-2.8-.2-.4 0-.6.2-.8l.6-.7c.2-.2.3-.4.4-.7.1-.2 0-.5 0-.7l-1.2-2.9c-.3-.7-.6-.6-.9-.6h-.8c-.3 0-.7.1-1 .5-.4.4-1.4 1.4-1.4 3.3s1.4 3.8 1.6 4.1c.2.3 2.8 4.3 6.8 6 1 .4 1.7.7 2.3.8 1 .3 1.8.3 2.4.2.8-.1 2.3-.9 2.6-1.8.3-.9.3-1.7.2-1.8-.1-.2-.4-.3-.8-.5Z"
    />
  </Svg>
);

const InstagramIcon = ({size = 26}) => (
  <Svg width={size} height={size} viewBox="0 0 32 32">
    <Defs>
      <LinearGradient id="instagramGradient" x1="0" y1="1" x2="1" y2="0">
        <Stop offset="0" stopColor="#FEDA75" />
        <Stop offset="0.35" stopColor="#FA7E1E" />
        <Stop offset="0.65" stopColor="#D62976" />
        <Stop offset="1" stopColor="#4F5BD5" />
      </LinearGradient>
    </Defs>
    <Rect x="2.5" y="2.5" width="27" height="27" rx="8" fill="url(#instagramGradient)" />
    <Rect x="8" y="8" width="16" height="16" rx="5" fill="none" stroke="#FFFFFF" strokeWidth="2" />
    <Circle cx="16" cy="16" r="4" fill="none" stroke="#FFFFFF" strokeWidth="2" />
    <Circle cx="22" cy="10" r="1.3" fill="#FFFFFF" />
  </Svg>
);

const AboutMe = ({style}) => {
  const themeContext = useTheme();
  const theme = themeContext?.theme ?? themeContext;
  const colors = theme?.colors ?? {};

  const primaryColor = colors.primary || '#6366F1';
  const cardColor = colors.surface || '#FFFFFF';
  const borderColor = colors.border || '#E5E7EB';
  const mutedColor = theme?.mode === 'dark' ? '#94A3B8' : '#64748B';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: cardColor,
          borderColor,
        },
        style,
      ]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.topAccent, {backgroundColor: primaryColor}]} />

        <Text style={styles.eyebrow}>ABOUT ME</Text>

        <View style={styles.avatarWrapper}>
          <View style={[styles.avatarGlow, {borderColor: primaryColor + '40'}]} />
          <View style={styles.avatarBorder}>
            <View style={styles.avatar}>
              {AVATAR_SOURCE ? (
                <Image
                  source={AVATAR_SOURCE}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.initials}>RK</Text>
              )}
            </View>
          </View>
        </View>

        <Text style={styles.name}>{PROFILE.name}</Text>
        <Text style={styles.role}>{PROFILE.role}</Text>

        <View style={styles.taglineRow}>
          <View style={styles.taglineLine} />
          <Text style={styles.tagline}>{PROFILE.tagline}</Text>
          <View style={styles.taglineLine} />
        </View>

        <View style={[styles.badge, {borderColor: primaryColor + '50'}]}>
          <View style={[styles.badgeDot, {backgroundColor: primaryColor}]} />
          <Text style={styles.badgeText}>DEVELOPER</Text>
        </View>
      </View>

      {/* Social Section */}
      <View style={[styles.socialSection, {backgroundColor: cardColor}]}>
        <Text style={[styles.connectText, {color: mutedColor}]}>
          LET'S CONNECT
        </Text>

        <View style={styles.socialRow}>
          <Pressable
            onPress={openWhatsApp}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="WhatsApp"
            style={({pressed}) => [
              styles.socialButton,
              pressed && styles.pressed,
            ]}>
            <View style={styles.iconCircle}>
              <WhatsAppIcon />
            </View>
          </Pressable>

          <Pressable
            onPress={openInstagram}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Instagram"
            style={({pressed}) => [
              styles.socialButton,
              pressed && styles.pressed,
            ]}>
            <View style={styles.iconCircle}>
              <InstagramIcon />
            </View>
          </Pressable>
        </View>

        <View style={[styles.footer, {borderTopColor: borderColor}]}>
          <Text style={[styles.codeMark, {color: primaryColor}]}>{'</>'}</Text>
          <Text style={[styles.footerText, {color: mutedColor}]}>
            LET'S BUILD SOMETHING GREAT
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },

  header: {
    backgroundColor: '#0F172A',
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },

  topAccent: {
    position: 'absolute',
    top: 0,
    width: 64,
    height: 3.5,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },

  eyebrow: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.8,
    marginBottom: 22,
  },

  avatarWrapper: {
    position: 'relative',
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarGlow: {
    position: 'absolute',
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 1.5,
  },

  avatarBorder: {
    width: 98,
    height: 98,
    borderRadius: 49,
    borderWidth: 2,
    borderColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
  },

  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#1E293B',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
  },

  initials: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  name: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
  },

  role: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 5,
    letterSpacing: 0.2,
  },

  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    gap: 12,
  },

  taglineLine: {
    width: 20,
    height: 1,
    backgroundColor: '#334155',
  },

  tagline: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1.2,
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderRadius: 20,
  },

  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  badgeText: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.6,
  },

  socialSection: {
    alignItems: 'center',
    paddingTop: 22,
    paddingHorizontal: 20,
  },

  connectText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.2,
  },

  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    marginTop: 16,
    marginBottom: 18,
  },

  socialButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  pressed: {
    opacity: 0.7,
    transform: [{scale: 0.94}],
  },

  footer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 14,
    paddingBottom: 16,
  },

  codeMark: {
    fontSize: 14,
    fontWeight: '800',
  },

  footerText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
});

export default AboutMe;
export {PROFILE};