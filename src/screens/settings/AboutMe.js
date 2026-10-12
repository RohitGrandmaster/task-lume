
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

const AVATAR_SOURCE = null;

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

const WhatsAppIcon = ({size = 30}) => (
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

const InstagramIcon = ({size = 30}) => (
  <Svg width={size} height={size} viewBox="0 0 32 32">
    <Defs>
      <LinearGradient
        id="instagramGradient"
        x1="0"
        y1="1"
        x2="1"
        y2="0">
        <Stop offset="0" stopColor="#FEDA75" />
        <Stop offset="0.35" stopColor="#FA7E1E" />
        <Stop offset="0.65" stopColor="#D62976" />
        <Stop offset="1" stopColor="#4F5BD5" />
      </LinearGradient>
    </Defs>

    <Rect
      x="2.5"
      y="2.5"
      width="27"
      height="27"
      rx="8"
      fill="url(#instagramGradient)"
    />

    <Rect
      x="8"
      y="8"
      width="16"
      height="16"
      rx="5"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="2"
    />

    <Circle
      cx="16"
      cy="16"
      r="4"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="2"
    />

    <Circle cx="22" cy="10" r="1.3" fill="#FFFFFF" />
  </Svg>
);

const AboutMe = () => {
  const themeContext = useTheme();
  const theme = themeContext?.theme ?? themeContext;
  const colors = theme?.colors ?? {};

  const primaryColor = colors.primary || '#6366F1';
  const cardColor = colors.surface || '#FFFFFF';
  const borderColor = colors.border || '#E5E7EB';
  const mutedColor =
    theme?.mode === 'dark' ? '#A6B0C3' : '#748094';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: cardColor,
          borderColor,
        },
      ]}>
      {/* Profile header */}
      <View style={styles.header}>
        <View
          style={[
            styles.topAccent,
            {backgroundColor: primaryColor},
          ]}
        />

        <Text style={styles.eyebrow}>ABOUT ME</Text>

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

        <Text style={styles.name}>{PROFILE.name}</Text>
        <Text style={styles.role}>{PROFILE.role}</Text>

        <View style={styles.taglineRow}>
          <View style={styles.taglineLine} />
          <Text style={styles.tagline}>{PROFILE.tagline}</Text>
          <View style={styles.taglineLine} />
        </View>

        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>DEVELOPER</Text>
        </View>
      </View>

      {/* Social icons: no button background */}
      <View
        style={[
          styles.socialSection,
          {backgroundColor: cardColor},
        ]}>
        <Text style={[styles.connectText, {color: mutedColor}]}>
          LET'S CONNECT
        </Text>

        <View style={styles.socialRow}>
          <Pressable
            onPress={openWhatsApp}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="WhatsApp"
            style={({pressed}) => [
              styles.socialIcon,
              pressed && styles.pressed,
            ]}>
            <WhatsAppIcon />
          </Pressable>

          <Pressable
            onPress={openInstagram}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Instagram"
            style={({pressed}) => [
              styles.socialIcon,
              pressed && styles.pressed,
            ]}>
            <InstagramIcon />
          </Pressable>
        </View>

        <View style={[styles.footer, {borderTopColor: borderColor}]}>
          <Text style={[styles.codeMark, {color: primaryColor}]}>
            {'</>'}
          </Text>
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
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#101828',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },

  header: {
    backgroundColor: '#10182B',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 26,
    paddingHorizontal: 20,
  },

  topAccent: {
    position: 'absolute',
    top: 0,
    width: 76,
    height: 3,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },

  eyebrow: {
    color: '#929DB4',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 21,
  },

  avatarBorder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: '#6875E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#202D4A',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
  },

  initials: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: 1,
  },

  name: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '700',
    textAlign: 'center',
  },

  role: {
    color: '#B7C1D5',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 6,
  },

  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 13,
    gap: 10,
  },

  taglineLine: {
    width: 18,
    height: 1,
    backgroundColor: '#485675',
  },

  tagline: {
    color: '#D1D9E8',
    fontSize: 12,
    letterSpacing: 1,
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#34415E',
    borderRadius: 20,
  },

  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#818CF8',
  },

  badgeText: {
    color: '#D7DDF0',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  socialSection: {
    alignItems: 'center',
    paddingTop: 19,
    paddingHorizontal: 20,
  },

  connectText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },

  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginTop: 12,
    marginBottom: 15,
  },

  socialIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pressed: {
    opacity: 0.65,
    transform: [{scale: 0.95}],
  },

  footer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 13,
    paddingBottom: 15,
  },

  codeMark: {
    fontSize: 13,
    fontWeight: '800',
  },

  footerText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
});

export default AboutMe;
export {PROFILE};
