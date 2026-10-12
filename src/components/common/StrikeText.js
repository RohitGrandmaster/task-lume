import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * StrikeText
 * Renders text with a bold, customizable strikethrough line across all lines of text.
 * When completed is true, a thick line is drawn through each measured text line.
 */
function StrikeText({
  text,
  completed = false,
  style,
  completedStyle,
  numberOfLines,
  strikeColor = '#64748B',
  strikeHeight = 2.2,
  containerStyle,
  ...rest
}) {
  const [lines, setLines] = useState([]);

  const handleTextLayout = e => {
    const nextLines = e?.nativeEvent?.lines;
    if (nextLines && nextLines.length > 0) {
      setLines(nextLines);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text
        style={[style, completed && completedStyle]}
        numberOfLines={numberOfLines}
        onTextLayout={handleTextLayout}
        {...rest}>
        {text}
      </Text>
      {completed &&
        lines.map((line, idx) => (
          <View
            key={idx}
            pointerEvents="none"
            style={[
              styles.strikeLine,
              {
                left: line.x,
                top: Math.round(line.y + line.height / 2 - strikeHeight / 2),
                width: line.width,
                height: strikeHeight,
                backgroundColor: strikeColor,
                borderRadius: strikeHeight / 2,
              },
            ]}
          />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
  },
  strikeLine: {
    position: 'absolute',
  },
});

export default StrikeText;
