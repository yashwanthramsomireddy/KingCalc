import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';
import { FontKey } from './fonts';
import { Theme, themes } from './theme';
import { getJSON, KEYS, setJSON } from './storage';

export type ThemeChoice = 'black' | 'white' | 'system';
export type Grouping = 'indian' | 'intl';

export interface Settings {
  theme: ThemeChoice;
  font: FontKey;
  decimals: number;
  grouping: Grouping;
  haptics: boolean;
}

function defaultGrouping(): Grouping {
  try {
    const locale = new Intl.NumberFormat().resolvedOptions().locale;
    if (/-IN$/i.test(locale)) return 'indian';
  } catch {
    // ignore
  }
  return 'intl';
}

const makeDefaults = (): Settings => ({
  theme: 'black',
  font: 'inter',
  decimals: 8,
  grouping: defaultGrouping(),
  haptics: true,
});

interface Ctx {
  settings: Settings;
  theme: Theme;
  ready: boolean;
  update: (patch: Partial<Settings>) => void;
  tap: () => void;
}

const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(makeDefaults);
  const [ready, setReady] = useState(false);
  const scheme = useColorScheme();

  useEffect(() => {
    let alive = true;
    getJSON<Partial<Settings>>(KEYS.settings, {}).then((saved) => {
      if (!alive) return;
      setSettings({ ...makeDefaults(), ...saved });
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Make native pieces (text selection menu, system dialogs) follow the chosen app theme.
  useEffect(() => {
    try {
      Appearance.setColorScheme(settings.theme === 'system' ? 'unspecified' : settings.theme === 'black' ? 'dark' : 'light');
    } catch {
      // not supported on this platform, ignore
    }
  }, [settings.theme]);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      setJSON(KEYS.settings, next);
      return next;
    });
  }, []);

  const theme = useMemo<Theme>(() => {
    if (settings.theme === 'system') return scheme === 'light' ? themes.white : themes.black;
    return themes[settings.theme];
  }, [settings.theme, scheme]);

  const tap = useCallback(() => {
    if (!settings.haptics) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore
    }
  }, [settings.haptics]);

  const value = useMemo(() => ({ settings, theme, ready, update, tap }), [settings, theme, ready, update, tap]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): Ctx {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
