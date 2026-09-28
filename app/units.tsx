import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../src/components/AppText';
import { PickerModal } from '../src/components/PickerModal';
import { Screen } from '../src/components/Screen';
import { Card, SectionTitle, SelectButton } from '../src/components/ui';
import { FONTS } from '../src/fonts';
import { formatNumber, parseNum, sanitizeNumber } from '../src/format';
import { useSettings } from '../src/settings';
import { CATEGORIES, convertUnit } from '../src/unitsData';

export default function UnitsScreen() {
  const { theme, settings, tap } = useSettings();
  const f = FONTS[settings.font];
  const [catKey, setCatKey] = useState(CATEGORIES[0].key);
  const cat = CATEGORIES.find((c) => c.key === catKey) ?? CATEGORIES[0];
  const [pair, setPair] = useState<Record<string, [string, string]>>({});
  const [from, to] = pair[cat.key] ?? cat.defaults;
  const [value, setValue] = useState('1');
  const [picker, setPicker] = useState<'from' | 'to' | null>(null);

  const setPairFor = (a: string, b: string) => setPair((p) => ({ ...p, [cat.key]: [a, b] }));
  const unit = (k: string) => cat.units.find((u) => u.key === k);
  const num = parseNum(value);
  const result = isNaN(num) ? NaN : convertUnit(cat, num, from, to);
  const fmt = (n: number) => (isNaN(n) ? '—' : formatNumber(n, settings.decimals, settings.grouping));

  const options = useMemo(() => cat.units.map((u) => ({ key: u.key, label: `${u.label}  ·  ${u.name}` })), [cat]);

  return (
    <Screen title="Units" scroll>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14, flexGrow: 0 }} keyboardShouldPersistTaps="handled">
        {CATEGORIES.map((c) => {
          const active = c.key === cat.key;
          return (
            <Pressable
              key={c.key}
              onPress={() => {
                tap();
                setCatKey(c.key);
              }}
              style={{
                paddingVertical: 9,
                paddingHorizontal: 16,
                borderRadius: 20,
                marginRight: 8,
                backgroundColor: active ? theme.accent : theme.key,
                borderColor: theme.border,
                borderWidth: 1,
              }}
            >
              <AppText weight="bold" size={14} color={active ? theme.accentText : theme.text}>
                {c.label}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      <Card>
        <AppText size={13} color={theme.subText}>
          From
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
          <TextInput
            value={value}
            onChangeText={(t) => setValue(sanitizeNumber(t, cat.key === 'temperature'))}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={theme.subText}
            selectionColor={theme.accent}
            style={{ flex: 1, color: theme.text, fontSize: 34, fontFamily: f.regular, paddingVertical: 6 }}
          />
          <SelectButton label={unit(from)?.label ?? from} onPress={() => setPicker('from')} />
        </View>
        <AppText size={13} color={theme.subText}>
          {unit(from)?.name}
        </AppText>
      </Card>

      <View style={{ alignItems: 'center', marginVertical: -12, zIndex: 2 }}>
        <Pressable
          onPress={() => {
            tap();
            setPairFor(to, from);
          }}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: theme.accent,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 4,
            borderColor: theme.bg,
          }}
        >
          <Ionicons name="swap-vertical" size={24} color={theme.accentText} />
        </Pressable>
      </View>

      <Card>
        <AppText size={13} color={theme.subText}>
          To
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
          <AppText size={34} style={{ flex: 1, paddingVertical: 6 }} numberOfLines={1} adjustsFontSizeToFit selectable>
            {fmt(result)}
          </AppText>
          <SelectButton label={unit(to)?.label ?? to} onPress={() => setPicker('to')} />
        </View>
        <AppText size={13} color={theme.subText}>
          {unit(to)?.name}
        </AppText>
      </Card>

      {cat.note ? (
        <AppText size={13} color={theme.subText} style={{ marginTop: 12 }}>
          {cat.note}
        </AppText>
      ) : null}

      <SectionTitle>All conversions</SectionTitle>
      <Card style={{ paddingVertical: 6 }}>
        {cat.units.map((u, i) => (
          <View
            key={u.key}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: 10,
              borderTopWidth: i === 0 ? 0 : 1,
              borderTopColor: theme.border,
            }}
          >
            <AppText color={theme.subText} size={14}>
              {u.name}
            </AppText>
            <AppText weight="bold" size={15} selectable>
              {fmt(isNaN(num) ? NaN : convertUnit(cat, num, from, u.key))} {u.label}
            </AppText>
          </View>
        ))}
      </Card>

      <PickerModal
        visible={picker !== null}
        title={picker === 'from' ? 'From unit' : 'To unit'}
        options={options}
        selected={picker === 'from' ? from : to}
        onSelect={(k) => {
          if (picker === 'from') setPairFor(k, to);
          else setPairFor(from, k);
          setPicker(null);
        }}
        onClose={() => setPicker(null)}
      />
    </Screen>
  );
}
