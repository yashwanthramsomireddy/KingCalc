import React from 'react';
import { Image, View } from 'react-native';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { AppText } from '../src/components/AppText';
import { Screen } from '../src/components/Screen';
import { Card, OutlineButton, PrimaryButton } from '../src/components/ui';
import { useSettings } from '../src/settings';

const WEBSITE = 'https://teamexykings.in';
const PRIVACY = 'https://github.com/yashwanthramsomireddy/KingCalc/blob/main/PRIVACY.md';
const SOURCE = 'https://github.com/yashwanthramsomireddy/KingCalc';
const RATES = 'https://www.exchangerate-api.com';

export default function AboutScreen() {
  const { theme } = useSettings();
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const open = (url: string) => WebBrowser.openBrowserAsync(url);

  return (
    <Screen title="About" scroll>
      <View style={{ alignItems: 'center', paddingVertical: 20 }}>
        <Image source={require('../assets/icon.png')} style={{ width: 96, height: 96, borderRadius: 24 }} />
        <AppText weight="bold" size={28} style={{ marginTop: 14 }}>
          KingCalc
        </AppText>
        <AppText size={14} color={theme.subText}>
          Version {version}
        </AppText>
      </View>

      <Card>
        <AppText size={16} style={{ textAlign: 'center' }}>
          Built by{' '}
          <AppText weight="bold" size={16}>
            Yashwanth Ram Somireddy
          </AppText>
        </AppText>
        <AppText size={16} style={{ textAlign: 'center', marginTop: 4 }}>
          A{' '}
          <AppText weight="bold" size={16} color={theme.accent}>
            TeamExyKings
          </AppText>{' '}
          product
        </AppText>
        <AppText size={13} color={theme.subText} style={{ textAlign: 'center', marginTop: 12 }}>
          Free forever · No ads · No tracking
        </AppText>
      </Card>

      <View style={{ gap: 12, marginTop: 18 }}>
        <PrimaryButton label="Visit website" icon="globe-outline" onPress={() => open(WEBSITE)} />
        <OutlineButton label="Privacy policy" icon="shield-checkmark-outline" onPress={() => open(PRIVACY)} />
        <OutlineButton label="Source code (open source, MIT)" icon="logo-github" onPress={() => open(SOURCE)} />
      </View>

      <AppText size={12} color={theme.subText} style={{ textAlign: 'center', marginTop: 22 }}>
        Exchange rates by ExchangeRate-API ({RATES.replace('https://www.', '')}).{'\n'}Rates are for information only.
      </AppText>
    </Screen>
  );
}
