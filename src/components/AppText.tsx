import React from 'react';
import { Text, TextProps } from 'react-native';
import { FONTS } from '../fonts';
import { useSettings } from '../settings';

interface Props extends TextProps {
  weight?: 'regular' | 'bold';
  size?: number;
  color?: string;
}

export function AppText({ weight = 'regular', size = 16, color, style, ...rest }: Props) {
  const { theme, settings } = useSettings();
  const f = FONTS[settings.font];
  return (
    <Text
      {...rest}
      style={[{ color: color ?? theme.text, fontSize: size, fontFamily: weight === 'bold' ? f.bold : f.regular }, style]}
    />
  );
}
