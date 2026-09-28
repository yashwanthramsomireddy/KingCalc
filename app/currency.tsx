import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { AppText } from '../src/components/AppText';
import { PickerModal } from '../src/components/PickerModal';
import { Screen } from '../src/components/Screen';
import { Card, SelectButton } from '../src/components/ui';
import {
  ATTRIBUTION_URL, convertCurrency, CURRENCY_NAMES, DEFAULT_FAVOURITES, fetchRates, loadCachedRates,
  MIN_REFRESH_MS, RatesCache, STALE_AFTER_MS,
} from '../src/currency';
import { FONTS } from '../src/fonts';
import { formatNumber, parseNum, sanitizeNumber } from '../src/format';
import { useSettings } from '../src/settings';
import { getJSON, KEYS, setJSON } from '../src/storage';

interface Prefs {
  from: string;
  to: string;
  favs: string[];
}

export default function CurrencyScreen() {
  const { theme, settings, tap } = useSettings();
  const f = FONTS[settings.font];
  const [prefs, setPrefs] = useState<Prefs>({ from: 'USD', to: 'INR', favs: DEFAULT_FAVOURITES });
  const [amount, setAmount] = useState('1');
  const [cache, setCache] = useState<RatesCache | null>(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [picker, setPicker] = useState<'from' | 'to' | null>(null);

  const refresh = useCallback(async (manual: boolean, current: RatesCache | null) => {
    if (current && manual && Date.now() - current.fetchedAt < MIN_REFRESH_MS) {
      setNote('Rates are already up to date. They refresh once a day.');
      return;
    }
    setLoading(true);
    setNote(null);
    try {
      setCache(await fetchRates());
    } catch {
      setNote(current ? 'Offline: showing the last saved rates.' : 'Could not load rates. Check your internet connection and pull down to retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const [p, c] = await Promise.all([getJSON<Prefs | null>(KEYS.currency, null), loadCachedRates()]);
      if (p) setPrefs({ ...p, favs: p.favs?.length ? p.favs : DEFAULT_FAVOURITES });
      setCache(c);
      if (!c || Date.now() - c.fetchedAt > STALE_AFTER_MS) refresh(false, c);
    })();
  }, [refresh]);

  const savePrefs = (next: Prefs) => {
    setPrefs(next);
    setJSON(KEYS.currency, next);
  };

  const options = useMemo(() => {
    const codes = cache ? Object.keys(cache.rates).sort() : Object.keys(CURRENCY_NAMES).sort();
    return codes.map((c) => ({ key: c, label: c, sub: CURRENCY_NAMES[c] }));
  }, [cache]);

  const amt = parseNum(amount);
  const result = cache && !isNaN(amt) ? convertCurrency(amt, prefs.from, prefs.to, cache.rates) : NaN;
  const rate = cache ? convertCurrency(1, prefs.from, prefs.to, cache.rates) : NaN;
  const fmt = (n: number) => (isNaN(n) ? '—' : formatNumber(n, Math.min(Math.max(settings.decimals, 2), 4), settings.grouping));

  const swap = () => {
    tap();
    savePrefs({ ...prefs, from: prefs.to, to: prefs.from });
  };

  const updatedText = cache
    ? `Rates updated ${new Date(cache.fetchedAt).toLocaleString()}`
    : loading
    ? 'Loading rates…'
    : 'No rates yet';

  return (
    <Screen
      title="Currency"
      scroll
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={() => refresh(true, cache)} tintColor={theme.accent} colors={[theme.accent]} progressBackgroundColor={theme.key} />
      }
    >
      <Card>
        <AppText size={13} color={theme.subText}>
          Amount
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
          <TextInput
            value={amount}
            onChangeText={(t) => setAmount(sanitizeNumber(t))}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={theme.subText}
            selectionColor={theme.accent}
            style={{ flex: 1, color: theme.text, fontSize: 34, fontFamily: f.regular, paddingVertical: 6 }}
          />
          <SelectButton label={prefs.from} onPress={() => setPicker('from')} />
        </View>
        {CURRENCY_NAMES[prefs.from] ? (
          <AppText size={13} color={theme.subText}>
            {CURRENCY_NAMES[prefs.from]}
          </AppText>
        ) : null}
      </Card>

      <View style={{ alignItems: 'center', marginVertical: -12, zIndex: 2 }}>
        <Pressable
          onPress={swap}
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
          Converted
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
          <AppText size={34} style={{ flex: 1, paddingVertical: 6 }} numberOfLines={1} adjustsFontSizeToFit selectable>
            {fmt(result)}
          </AppText>
          <SelectButton label={prefs.to} onPress={() => setPicker('to')} />
        </View>
        {CURRENCY_NAMES[prefs.to] ? (
          <AppText size={13} color={theme.subText}>
            {CURRENCY_NAMES[prefs.to]}
          </AppText>
        ) : null}
      </Card>

      <View style={{ marginTop: 18, gap: 6 }}>
        {!isNaN(rate) && (
          <AppText weight="bold" size={16}>
            1 {prefs.from} = {formatNumber(rate, 4, settings.grouping)} {prefs.to}
          </AppText>
        )}
        <AppText size={13} color={theme.subText}>
          {updatedText}
        </AppText>
        {note ? (
          <AppText size={13} color={theme.danger}>
            {note}
          </AppText>
        ) : (
          <AppText size={13} color={theme.subText}>
            Pull down to refresh. Rates work offline once loaded.
          </AppText>
        )}
        <Pressable onPress={() => WebBrowser.openBrowserAsync(ATTRIBUTION_URL)} hitSlop={8}>
          <AppText size={13} color={theme.accent}>
            Rates by ExchangeRate-API
          </AppText>
        </Pressable>
        <AppText size={12} color={theme.subText}>
          Rates are for information only, not for financial transactions.
        </AppText>
      </View>

      <PickerModal
        visible={picker !== null}
        title={picker === 'from' ? 'From currency' : 'To currency'}
        options={options}
        selected={picker === 'from' ? prefs.from : prefs.to}
        searchable
        favourites={prefs.favs}
        onToggleFavourite={(k) =>
          savePrefs({ ...prefs, favs: prefs.favs.includes(k) ? prefs.favs.filter((x) => x !== k) : [...prefs.favs, k] })
        }
        onSelect={(k) => {
          savePrefs(picker === 'from' ? { ...prefs, from: k } : { ...prefs, to: k });
          setPicker(null);
        }}
        onClose={() => setPicker(null)}
      />
    </Screen>
  );
}
