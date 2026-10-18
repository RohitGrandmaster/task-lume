import React from 'react';
import {Text as NativeText, TextInput as NativeTextInput} from 'react-native';
import {useSettings} from '../context/SettingsContext';
import {translateLiteral} from './translations';

/**
 * Compatibility layer for existing screens while their copy is migrated to
 * keyed translations. Only exact, known UI strings are translated; all other
 * content is passed through unchanged.
 */
export function LocalizedText({children, translate = true, ...props}) {
  const {language = 'en'} = useSettings();

  const translateNode = node => {
    if (!translate) {
      return node;
    }
    if (typeof node === 'string') {
      return translateLiteral(node, language);
    }

    if (Array.isArray(node)) {
      return node.map((child, index) => {
        if (typeof child === 'string') {
          return translateLiteral(child, language);
        }
        return React.isValidElement(child)
          ? React.cloneElement(child, {key: child.key ?? index})
          : child;
      });
    }

    return node;
  };

  return <NativeText {...props}>{translateNode(children)}</NativeText>;
}

export function LocalizedTextInput({
  placeholder,
  accessibilityLabel,
  accessibilityHint,
  ...props
}) {
  const {language = 'en'} = useSettings();

  return (
    <NativeTextInput
      {...props}
      placeholder={translateLiteral(placeholder, language)}
      accessibilityLabel={translateLiteral(accessibilityLabel, language)}
      accessibilityHint={translateLiteral(accessibilityHint, language)}
    />
  );
}
