import React, { useState } from 'react';
import { Pressable, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../src/components/AppText';
import { Screen } from '../src/components/Screen';
import { Dialog } from '../src/components/Dialog';
import { Card, OutlineButton, SectionTitle, Segmented } from '../src/components/ui';
import { FONT_ORDER, FONTS } from '../src/fonts';
import { formatNumber } from '../src/format';
import { Grouping, ThemeChoice, useSettings } from '../src/settings';
import { KEYS, removeKey } from '../src/storage';

export default function SettingsScreen() {
  const { theme, settings, update, tap } = useSettings();
  const router = useRouter();
  const sample = formatNumber(123456.78, 2, settings.grouping);

  const [dialog, setDialog] = useState<'confirm' | 'done' | null>(null);

  const doClear = async () => {
    await removeKey(KEYS.history);
    setDialog('done');
  };

  return (
    <Screen title="Settings" scroll>
      <SectionTitle>Theme</SectionTitle>
      <Segmented<ThemeChoice>
        value={settings.theme}
        onChange={(t) => update({ theme: t })}
        options={[
          { key: 'black', label: 'Black' },
          { key: 'white', label: 'White' },
          { key: 'system', label: 'System' },
        ]}
      />
      <AppText size={12} color={theme.subText} style={{ marginTop: 8 }}>
        Black uses pure #000000 and saves battery on OLED screens.
      </AppText>

      <SectionTitle>Font</SectionTitle>
      <Card style={{ paddingVertical: 4 }}>
        {FONT_ORDER.map((k, i) => {
          const f = FONTS[k];
          const active = settings.font === k;
          return (
            <Pressable
              key={k}
              onPress={() => {
                tap();
                update({ font: k });
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: theme.border,
              }}
            >
              <View style={{ flex: 1 }}>
                <AppText size={13} color={theme.subText}>
                  {f.label} · {f.blurb}
                </AppText>
                <AppText size={24} style={{ fontFamily: f.regular, marginTop: 2 }}>
                  {sample}
                </AppText>
              </View>
              {active ? <Ionicons name="checkmark-circle" size={24} color={theme.accent} /> : null}
            </Pressable>
          );
        })}
      </Card>

      <SectionTitle>Number format</SectionTitle>
      <Segmented<Grouping>
        value={settings.grouping}
        onChange={(g) => update({ grouping: g })}
        options={[
          { key: 'indian', label: 'Indian 1,00,000' },
          { key: 'intl', label: 'International 100,000' },
        ]}
      />

      <SectionTitle>Decimal places (maximum)</SectionTitle>
      <Segmented<number>
        value={settings.decimals}
        onChange={(d) => update({ decimals: d })}
        options={[2, 4, 6, 8, 10].map((n) => ({ key: n, label: String(n) }))}
      />

      <SectionTitle>Feedback</SectionTitle>
      <Card style={{ flexDirection: 'row', alignItems: 'center' }}>
        <AppText style={{ flex: 1 }} size={16}>
          Haptic feedback on key press
        </AppText>
        <Switch
          value={settings.haptics}
          onValueChange={(v) => update({ haptics: v })}
          trackColor={{ false: theme.border, true: theme.accent }}
          thumbColor={settings.haptics ? '#FFFFFF' : theme.subText}
        />
      </Card>

      <SectionTitle>Help</SectionTitle>
      <OutlineButton label="FAQ: how to use each feature" icon="help-circle-outline" onPress={() => router.replace('/faq' as never)} />

      <SectionTitle>Data</SectionTitle>
      <OutlineButton label="Clear calculation history" icon="trash-outline" onPress={() => setDialog('confirm')} />

      <Dialog
        visible={dialog === 'confirm'}
        title="Clear history?"
        message="This removes all saved calculations from this device."
        onClose={() => setDialog(null)}
        buttons={[
          { label: 'Cancel', onPress: () => setDialog(null) },
          { label: 'Clear', destructive: true, onPress: doClear },
        ]}
      />
      <Dialog
        visible={dialog === 'done'}
        title="History cleared"
        onClose={() => setDialog(null)}
        buttons={[{ label: 'OK', onPress: () => setDialog(null) }]}
      />
    </Screen>
  );
}
