import React from 'react';
import {View, StyleSheet} from 'react-native';
import Svg, {Circle} from 'react-native-svg';

export default function ProgressRing({
  size = 120,
  strokeWidth = 10,
  percent = 0,
  color = '#FFFFFF',
  trackColor = 'rgba(255,255,255,0.22)',
  children,
}) {
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
      }}>
      <Svg width={containerSize} height={containerSize}>
        <Circle
          cx={containerSize / 2}
          cy={containerSize / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {safe > 0 && (
          <Circle
            cx={containerSize / 2}
            cy={containerSize / 2}
            r={radius}
            stroke={color}
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
            {alignItems: 'center', justifyContent: 'center'},
          ]}
          pointerEvents="none">
          {children}
        </View>
      ) : null}
    </View>
  );
}
