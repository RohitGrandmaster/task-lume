/**
 * RESPONSIBILITY: Canonical SVG Donut Chart for User Overview metrics (≤200 lines).
 * FLOW: Renders multi-segment task distribution by priority or category.
 */

import React from 'react';
import Svg, { Circle } from 'react-native-svg';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';

interface Segment {
  value: number;
  color: string;
}

interface UserOverviewDonutChartProps {
  data: Segment[];
  size?: number;
  strokeWidth?: number;
}

export function UserOverviewDonutChart({
  data,
  size = 108,
  strokeWidth = 12,
}: UserOverviewDonutChartProps) {
  const tokens = useThemeTokens();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((s, d) => s + d.value, 0);

  let cumulative = 0;

  return (
    <Svg width={size} height={size}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={tokens.color.border}
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      {total > 0 &&
        data.map((segment, i) => {
          if (segment.value === 0) return null;
          const portion = segment.value / total;
          const dashLength = circumference * portion;
          const gap = circumference - dashLength;
          const rotate = (cumulative / total) * 360 - 90;
          cumulative += segment.value;

          return (
            <Circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={segment.color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={`${dashLength} ${gap}`}
              strokeDashoffset={0}
              strokeLinecap="butt"
              transform={`rotate(${rotate} ${size / 2} ${size / 2})`}
            />
          );
        })}
    </Svg>
  );
}
