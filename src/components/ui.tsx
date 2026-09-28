import React from 'react';
import { Pressable, StyleProp, TextInput, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { FONTS } from '../fonts';
import { sanitizeNumber } from '../format';
import { useSettings } from '../settings';

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { theme } = useSettings();
  return (
    <View
      style={[
        { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1, borderRadius: 18, padding: 16 },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionTitle({ children }: { children: string }) {
  const { theme } = useSettings();
  return (
    <AppText weight="bold" size={13} color={theme.accent} style={{ marginTop: 22, marginBottom: 8, letterSpacing: 0.6 }}>
      {children.toUpperCase()}
    </AppText>
  );
}

interface SegOption<T extends string | number> {
  key: T;
  label: string;
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (k: T) => void;
}) {
  const { theme, tap } = useSettings();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: theme.key,
        borderRadius: 14,
        padding: 4,
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Pressable
            key={String(o.key)}
            onPress={() => {
              tap();
              onChange(o.key);
            }}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: 'center',
              borderRadius: 10,
              backgroundColor: active ? theme.accent : 'transparent',
            }}
          >
            <AppText weight="bold" size={14} color={active ? theme.accentText : theme.text} numberOfLines={1}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function NumField({
  label,
  value,
  onChange,
  suffix,
  allowNegative,
  placeholder = '0',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  allowNegative?: boolean;
  placeholder?: string;
}) {
  const { theme, settings } = useSettings();
  const f = FONTS[settings.font];
  return (
    <View style={{ marginBottom: 14 }}>
      <AppText size={13} color={theme.subText} style={{ marginBottom: 6 }}>
        {label}
      </AppText>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.key,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: theme.border,
          paddingHorizontal: 14,
        }}
      >
        <TextInput
          value={value}
          onChangeText={(t) => onChange(sanitizeNumber(t, allowNegative))}
          keyboardType="numeric"
          placeholder={placeholder}
          placeholderTextColor={theme.subText}
          selectionColor={theme.accent}
          style={{ flex: 1, color: theme.text, fontSize: 22, fontFamily: f.regular, paddingVertical: 12 }}
        />
        {suffix ? (
          <AppText color={theme.subText} size={16}>
            {suffix}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

export function SelectButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { theme, tap } = useSettings();
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.key,
        borderColor: theme.border,
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        gap: 6,
      }}
    >
      <AppText weight="bold" size={16} numberOfLines={1}>
        {label}
      </AppText>
      <Ionicons name="chevron-down" size={16} color={theme.subText} />
    </Pressable>
  );
}

export function ResultRow({ label, value, big }: { label: string; value: string; big?: boolean }) {
  const { theme } = useSettings();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
      <AppText color={theme.subText} size={big ? 16 : 14}>
        {label}
      </AppText>
      <AppText weight="bold" size={big ? 26 : 17} color={big ? theme.accent : theme.text} selectable>
        {value}
      </AppText>
    </View>
  );
}

export function PrimaryButton({ label, onPress, icon }: { label: string; onPress: () => void; icon?: keyof typeof Ionicons.glyphMap }) {
  const { theme, tap } = useSettings();
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: theme.accent,
        borderRadius: 14,
        paddingVertical: 14,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {icon ? <Ionicons name={icon} size={18} color={theme.accentText} /> : null}
      <AppText weight="bold" size={16} color={theme.accentText}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function OutlineButton({ label, onPress, icon }: { label: string; onPress: () => void; icon?: keyof typeof Ionicons.glyphMap }) {
  const { theme, tap } = useSettings();
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderColor: theme.border,
        borderWidth: 1,
        backgroundColor: theme.key,
        borderRadius: 14,
        paddingVertical: 14,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {icon ? <Ionicons name={icon} size={18} color={theme.text} /> : null}
      <AppText weight="bold" size={16}>
        {label}
      </AppText>
    </Pressable>
  );
}
