import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { JetBrainsMono_400Regular, JetBrainsMono_600SemiBold } from '@expo-google-fonts/jetbrains-mono';
import { SpaceGrotesk_400Regular, SpaceGrotesk_600SemiBold } from '@expo-google-fonts/space-grotesk';
import { Nunito_400Regular, Nunito_600SemiBold } from '@expo-google-fonts/nunito';

export const fontAssets = {
  Inter_400Regular,
  Inter_600SemiBold,
  Poppins_400Regular,
  Poppins_600SemiBold,
  JetBrainsMono_400Regular,
  JetBrainsMono_600SemiBold,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_600SemiBold,
  Nunito_400Regular,
  Nunito_600SemiBold,
};

export type FontKey = 'inter' | 'poppins' | 'jetbrains' | 'grotesk' | 'nunito';

export const FONTS: Record<FontKey, { label: string; regular: string; bold: string; blurb: string }> = {
  inter: { label: 'Inter', regular: 'Inter_400Regular', bold: 'Inter_600SemiBold', blurb: 'Clean and neutral' },
  poppins: { label: 'Poppins', regular: 'Poppins_400Regular', bold: 'Poppins_600SemiBold', blurb: 'Rounded and friendly' },
  jetbrains: { label: 'JetBrains Mono', regular: 'JetBrainsMono_400Regular', bold: 'JetBrainsMono_600SemiBold', blurb: 'Monospaced, digits line up' },
  grotesk: { label: 'Space Grotesk', regular: 'SpaceGrotesk_400Regular', bold: 'SpaceGrotesk_600SemiBold', blurb: 'Modern and techy' },
  nunito: { label: 'Nunito', regular: 'Nunito_400Regular', bold: 'Nunito_600SemiBold', blurb: 'Soft and readable' },
};

export const FONT_ORDER: FontKey[] = ['inter', 'poppins', 'jetbrains', 'grotesk', 'nunito'];
