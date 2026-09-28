import React, { useState } from 'react';
import { View } from 'react-native';
import { AppText } from '../src/components/AppText';
import { Screen } from '../src/components/Screen';
import { Card, NumField, ResultRow, Segmented } from '../src/components/ui';
import { formatNumber, parseNum } from '../src/format';
import { useSettings } from '../src/settings';

type Mode = 'of' | 'what' | 'change';

export default function PercentScreen() {
  const { theme, settings } = useSettings();
  const [mode, setMode] = useState<Mode>('of');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const x = parseNum(a);
  const y = parseNum(b);
  const ok = !isNaN(x) && !isNaN(y);
  const fmt = (n: number, suffix = '') => `${formatNumber(n, Math.min(settings.decimals, 6), settings.grouping)}${suffix}`;

  let label = '';
  let value = '—';
  let extra: string | null = null;
  let labels: [string, string] = ['', ''];

  if (mode === 'of') {
    labels = ['Percentage (%)', 'Of value'];
    label = `${a || 'X'}% of ${b || 'Y'}`;
    if (ok) value = fmt((x / 100) * y);
  } else if (mode === 'what') {
    labels = ['Value (X)', 'Total (Y)'];
    label = `${a || 'X'} is what % of ${b || 'Y'}`;
    if (ok && y !== 0) value = fmt((x / y) * 100, '%');
  } else {
    labels = ['From (old value)', 'To (new value)'];
    label = 'Percentage change';
    if (ok && x !== 0) {
      const ch = ((y - x) / Math.abs(x)) * 100;
      value = fmt(ch, '%');
      extra = ch > 0 ? 'Increase' : ch < 0 ? 'Decrease' : 'No change';
    }
  }

  return (
    <Screen title="Percent" scroll>
      <Segmented<Mode>
        value={mode}
        onChange={(m) => {
          setMode(m);
          setA('');
          setB('');
        }}
        options={[
          { key: 'of', label: 'X% of Y' },
          { key: 'what', label: 'X is ?% of Y' },
          { key: 'change', label: '% change' },
        ]}
      />
      <View style={{ height: 18 }} />
      <NumField label={labels[0]} value={a} onChange={setA} allowNegative={mode === 'change'} />
      <NumField label={labels[1]} value={b} onChange={setB} allowNegative={mode === 'change'} />
      <Card style={{ marginTop: 6 }}>
        <AppText size={13} color={theme.subText}>
          {label}
        </AppText>
        <ResultRow label="Result" value={value} big />
        {extra ? (
          <AppText size={14} color={theme.subText}>
            {extra}
          </AppText>
        ) : null}
      </Card>
    </Screen>
  );
}
