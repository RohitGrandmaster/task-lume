import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function CategoryBar({item, maxValue, theme}) {
  const percent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
  const color = item.color || theme.colors.primary;

  return (
    <View style={catStyles.row}>
      <View style={catStyles.labelRow}>
        <View style={[catStyles.dot, {backgroundColor: color}]} />
        <Text
          style={[catStyles.label, {color: theme.colors.text}]}
          numberOfLines={1}>
          {item.label}
        </Text>
        <Text
          style={[catStyles.count, {color: theme.colors.textSecondary}]}>
          {item.value}
        </Text>
      </View>
      <View
        style={[
          catStyles.track,
          {backgroundColor: theme.colors.border},
        ]}>
        <View
          style={[
            catStyles.fill,
            {width: `${percent}%`, backgroundColor: color},
          ]}
        />
      </View>
    </View>
  );
}

const catStyles = StyleSheet.create({
  row: {marginBottom: 12},
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dot: {width: 8, height: 8, borderRadius: 4, marginRight: 8},
  label: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  count: {fontSize: 12, fontWeight: '800', letterSpacing: 0.2},
  track: {height: 6, borderRadius: 3, overflow: 'hidden'},
  fill: {height: '100%', borderRadius: 3},
});
