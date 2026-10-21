import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function ActivityBarChart({data, maxValue, theme}) {
  const CHART_HEIGHT = 120;

  return (
    <View style={barStyles.wrap}>
      <View style={[barStyles.chart, {height: CHART_HEIGHT}]}>
        {data.map((d, i) => {
          const ratio = maxValue > 0 ? d.value / maxValue : 0;
          const barHeight = Math.max(ratio * (CHART_HEIGHT - 22), 6);
          const isCurrent = d.isCurrent;

          return (
            <View key={i} style={barStyles.barColumn}>
              {d.value > 0 && (
                <Text
                  style={[
                    barStyles.barValue,
                    {
                      color: isCurrent
                        ? theme.colors.primary
                        : theme.colors.textSecondary,
                    },
                  ]}>
                  {d.value}
                </Text>
              )}
              <View
                style={[
                  barStyles.bar,
                  {
                    height: barHeight,
                    backgroundColor: isCurrent
                      ? theme.colors.primary
                      : theme.colors.border,
                    shadowColor: isCurrent
                      ? theme.colors.primary
                      : 'transparent',
                    shadowOpacity: isCurrent ? 0.35 : 0,
                    shadowRadius: 8,
                    shadowOffset: {width: 0, height: 4},
                    elevation: isCurrent ? 4 : 0,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>

      <View style={barStyles.labelsRow}>
        {data.map((d, i) => (
          <View key={i} style={barStyles.labelColumn}>
            <Text
              style={[
                barStyles.label,
                {
                  color: d.isCurrent
                    ? theme.colors.primary
                    : theme.colors.textLight,
                  fontWeight: d.isCurrent ? '900' : '700',
                },
              ]}>
              {d.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const barStyles = StyleSheet.create({
  wrap: {marginTop: 6},
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    paddingHorizontal: 3,
  },
  bar: {
    width: '100%',
    maxWidth: 24,
    borderRadius: 6,
    minHeight: 6,
  },
  barValue: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 2,
  },
  labelColumn: {flex: 1, alignItems: 'center'},
  label: {fontSize: 10.5, letterSpacing: 0.2},
});
