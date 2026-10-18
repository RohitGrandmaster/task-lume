import {LocalizedText} from '../../i18n/LocalizedText';
import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';

import useTheme from '../../hooks/useTheme';

const TASKLUME_ICON = require('../../assets/images/tasklume_icon.png');

function AppLogo({
  showName = true,
  showTagline = false,
  size = 'large',
}) {
  const {theme} = useTheme();

  const styles = createStyles(theme);
  const isSmall = size === 'small';

  const iconDim = isSmall ? 52 : 72;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconWrap,
          {
            width: iconDim,
            height: iconDim,
            borderRadius: isSmall ? 16 : 22,
          },
        ]}>
        <Image
          source={TASKLUME_ICON}
          style={{
            width: iconDim,
            height: iconDim,
            borderRadius: isSmall ? 16 : 22,
          }}
          resizeMode="cover"
        />
      </View>

      {showName ? (
        <LocalizedText
          style={[
            styles.logoText,
            isSmall && styles.logoTextSmall,
          ]}>
          Tasklume
        </LocalizedText>
      ) : null}

      {showTagline ? (
        <LocalizedText
          style={[
            styles.tagline,
            {color: theme.colors.textSecondary},
          ]}>
          Plan Smart. Focus Better.
        </LocalizedText>
      ) : null}
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
    },

    iconWrap: {
      overflow: 'hidden',
      elevation: 8,
      shadowColor: '#6366F1',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.35,
      shadowRadius: 10,
    },

    logoText: {
      marginTop: theme.spacing.md,
      fontSize: 24,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: -0.5,
    },

    logoTextSmall: {
      fontSize: 19,
      marginTop: theme.spacing.sm,
    },

    tagline: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 3,
      letterSpacing: 0.2,
    },
  });
}

export default AppLogo;