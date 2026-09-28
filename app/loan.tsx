import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { AppText } from '../src/components/AppText';
import { Screen } from '../src/components/Screen';
import { Card, NumField, OutlineButton, ResultRow, SectionTitle, Segmented } from '../src/components/ui';
import { formatFixed, parseNum } from '../src/format';
import { useSettings } from '../src/settings';

type TenureUnit = 'years' | 'months';

interface Row {
  n: number;
  principal: number;
  interest: number;
  balance: number;
}

function compute(P: number, annual: number, months: number) {
  const r = annual / 12 / 100;
  const emi = r === 0 ? P / months : (P * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const rows: Row[] = [];
  let bal = P;
  for (let n = 1; n <= months; n++) {
    const interest = bal * r;
    const principal = emi - interest;
    bal = Math.max(0, bal - principal);
    rows.push({ n, principal, interest, balance: n === months ? 0 : bal });
  }
  const total = emi * months;
  return { emi, total, interest: total - P, rows };
}

export default function LoanScreen() {
  const { theme, settings } = useSettings();
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [tenure, setTenure] = useState('');
  const [unit, setUnit] = useState<TenureUnit>('years');
  const [showTable, setShowTable] = useState(false);

  const P = parseNum(amount);
  const R = parseNum(rate);
  const T = parseNum(tenure);
  const months = isNaN(T) ? NaN : unit === 'years' ? Math.round(T * 12) : Math.round(T);
  const valid = !isNaN(P) && P > 0 && !isNaN(R) && R >= 0 && R <= 100 && !isNaN(months) && months >= 1 && months <= 600;

  const res = useMemo(() => (valid ? compute(P, R, months) : null), [valid, P, R, months]);
  const money = (n: number) => formatFixed(n, 2, settings.grouping);

  const cell = (text: string, w: number, bold = false, align: 'left' | 'right' = 'right') => (
    <AppText weight={bold ? 'bold' : 'regular'} size={13} style={{ width: `${w}%`, textAlign: align }} numberOfLines={1} adjustsFontSizeToFit>
      {text}
    </AppText>
  );

  return (
    <Screen title="Loan / EMI" scroll>
      <NumField label="Loan amount" value={amount} onChange={setAmount} />
      <NumField label="Interest rate (per year)" value={rate} onChange={setRate} suffix="%" />
      <NumField label="Loan tenure" value={tenure} onChange={setTenure} suffix={unit === 'years' ? 'yrs' : 'mo'} />
      <Segmented<TenureUnit>
        value={unit}
        onChange={setUnit}
        options={[
          { key: 'years', label: 'Years' },
          { key: 'months', label: 'Months' },
        ]}
      />

      <Card style={{ marginTop: 20 }}>
        <ResultRow label="Monthly EMI" value={res ? money(res.emi) : '—'} big />
        <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 6 }} />
        <ResultRow label="Total interest" value={res ? money(res.interest) : '—'} />
        <ResultRow label="Total payable" value={res ? money(res.total) : '—'} />
        {!valid && (amount || rate || tenure) ? (
          <AppText size={12} color={theme.subText} style={{ marginTop: 6 }}>
            Enter an amount above 0, a rate from 0 to 100, and a tenure up to 50 years.
          </AppText>
        ) : null}
      </Card>

      {res ? (
        <>
          <View style={{ height: 14 }} />
          <OutlineButton
            label={showTable ? 'Hide payment schedule' : 'Show payment schedule'}
            icon={showTable ? 'chevron-up' : 'chevron-down'}
            onPress={() => setShowTable((v) => !v)}
          />
          {showTable ? (
            <>
              <SectionTitle>Payment schedule</SectionTitle>
              <Card style={{ paddingHorizontal: 12 }}>
                <View style={{ flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                  {cell('#', 10, true, 'left')}
                  {cell('Principal', 30, true)}
                  {cell('Interest', 30, true)}
                  {cell('Balance', 30, true)}
                </View>
                {res.rows.map((r) => (
                  <View key={r.n} style={{ flexDirection: 'row', paddingVertical: 7 }}>
                    {cell(String(r.n), 10, false, 'left')}
                    {cell(money(r.principal), 30)}
                    {cell(money(r.interest), 30)}
                    {cell(money(r.balance), 30)}
                  </View>
                ))}
              </Card>
            </>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}
