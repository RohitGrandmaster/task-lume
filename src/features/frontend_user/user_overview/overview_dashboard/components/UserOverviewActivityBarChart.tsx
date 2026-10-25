/**
 * RESPONSIBILITY: 7-day activity bar chart for User Overview (≤200 lines).
 * FLOW: Renders vertical bars corresponding to completed tasks per day with active day highlight.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';

interface ActivityBarItem {
  label: string;
  value: number;
  isCurrent?: boolean;
}

interface UserOverviewActivityBarChartProps {
  data: ActivityBarItem[];
  maxValue?: number;
}

export function UserOverviewActivityBarChart({
  data,
  maxValue,
}: UserOverviewActivityBarChartProps) {
  const tokens = useThemeTokens();
  const CHART_HEIGHT = 120;
  const computedMax = maxValue || Math.max(...data.map((d) => d.value), 1);

  const styles = StyleSheet.create({
    wrap: {
      width: '100%',
      paddingTop: tokens.space[2],
    },
    chart: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      height: CHART_HEIGHT,
      paddingHorizontal: tokens.space[1],
    },
    barColumn: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
      height: '100%',
    },
    barValue: {
      ...tokens.typography.caption,
      fontSize: 10,
      marginBottom: tokens.space[1],
    },
    bar: {
      width: 14,
      borderRadius: tokens.radius.sm,
    },
    labelsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: tokens.space[2],
      paddingTop: tokens.space[2],
      borderTopWidth: 1,
      borderTopColor: tokens.color.border,
    },
    labelColumn: {
      flex: 1,
      alignItems: 'center',
    },
    label: {
      ...tokens.typography.caption,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.chart}>
        {data.map((d, i) => {
          const ratio = computedMax > 0 ? d.value / computedMax : 0;
          const barHeight = Math.max(ratio * (CHART_HEIGHT - 26), 6);
          const isCurrent = !!d.isCurrent;

          return (
            <View key={i} style={styles.barColumn}>
              {d.value > 0 ? (
                <Text
                  style={[
                    styles.barValue,
                    { color: isCurrent ? tokens.color.primary : tokens.color.muted },
                  ]}
                >
                  {d.value}
                </Text>
              ) : null}
              <View
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    backgroundColor: isCurrent ? tokens.color.primary : tokens.color.border,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>

      <View style={styles.labelsRow}>
        {data.map((d, i) => (
          <View key={i} style={styles.labelColumn}>
            <Text
              style={[
                styles.label,
                { color: d.isCurrent ? tokens.color.primary : tokens.color.muted },
              ]}
            >
              {d.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
