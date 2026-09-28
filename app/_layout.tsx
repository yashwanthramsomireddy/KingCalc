import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { fontAssets } from '../src/fonts';
import { SettingsProvider, useSettings } from '../src/settings';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Inner({ fontsReady }: { fontsReady: boolean }) {
  const { theme, ready } = useSettings();

  useEffect(() => {
    if (ready && fontsReady) SplashScreen.hideAsync().catch(() => {});
  }, [ready, fontsReady]);

  // Always pitch black until settings and fonts are ready, whatever theme is saved.
  if (!ready || !fontsReady) {
    return (
      <>
        <StatusBar style="light" />
        <View style={{ flex: 1, backgroundColor: '#000000' }} />
      </>
    );
  }

  return (
    <>
      <StatusBar style={theme.statusBar} />
      <Stack screenOptions={{ headerShown: false, animation: 'none', contentStyle: { backgroundColor: theme.bg } }} />
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts(fontAssets);
  return (
    <SettingsProvider>
      <Inner fontsReady={loaded || !!error} />
    </SettingsProvider>
  );
}
