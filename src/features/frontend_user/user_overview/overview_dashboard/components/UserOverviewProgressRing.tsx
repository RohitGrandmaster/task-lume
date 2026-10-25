/**
 * RESPONSIBILITY: Canonical SVG Progress Ring for User Overview metrics (≤200 lines).
 * FLOW: Renders tokenized circular completion indicator.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';

interface UserOverviewProgressRingProps {
  size?: number;
  strokeWidth?: number;
  percent?: number;
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
}

export function UserOverviewProgressRing({
  size = 120,
  strokeWidth = 10,
  percent = 0,
  color,
  trackColor,
  children,
}: UserOverviewProgressRingProps) {
  const tokens = useThemeTokens();
  const ringColor = color || tokens.color.primary;
  const ringTrackColor = trackColor || tokens.color.border;

  const BUFFER = 8;
  const containerSize = size + BUFFER * 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safe = Math.min(Math.max(percent, 0), 100);
  const offset = circumference * (1 - safe / 100);

  return (
    <View
      style={{
        width: containerSize,
        height: containerSize,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={containerSize} height={containerSize}>
        <Circle
          cx={containerSize / 2}
          cy={containerSize / 2}
          r={radius}
          stroke={ringTrackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {safe > 0 && (
          <Circle
            cx={containerSize / 2}
            cy={containerSize / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${containerSize / 2} ${containerSize / 2})`}
          />
        )}
      </Svg>
      {children ? (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { alignItems: 'center', justifyContent: 'center' },
          ]}
          pointerEvents="none"
        >
          {children}
        </View>
      ) : null}
    </View>
  );
}
