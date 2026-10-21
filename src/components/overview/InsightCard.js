import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function InsightCard({icon: Icon, iconColor, label, value, suffix, theme}) {
  return (
    <View
      style={[
        insightStyles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}>
      <View
        style={[
          insightStyles.iconWrap,
          {backgroundColor: `${iconColor}18`},
        ]}>
        <Icon size={15} color={iconColor} strokeWidth={2.6} />
      </View>
      <Text
        style={[insightStyles.value, {color: theme.colors.text}]}
        numberOfLines={1}>
        {value}
        {suffix ? (
          <Text
            style={[
              insightStyles.suffix,
              {color: theme.colors.textSecondary},
            ]}>
            {suffix}
          </Text>
        ) : null}
      </Text>
      <Text
        style={[insightStyles.label, {color: theme.colors.textSecondary}]}
        numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const insightStyles = StyleSheet.create({
  card: {
    width: '48.5%',
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 10,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  value: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  suffix: {
    fontSize: 12,
    fontWeight: '700',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
});
