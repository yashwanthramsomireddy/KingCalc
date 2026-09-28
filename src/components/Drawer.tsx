import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from './AppText';
import { useSettings } from '../settings';

type IconName = keyof typeof Ionicons.glyphMap;

const MAIN: { path: string; label: string; icon: IconName }[] = [
  { path: '/', label: 'Calculator', icon: 'calculator-outline' },
  { path: '/currency', label: 'Currency', icon: 'cash-outline' },
  { path: '/units', label: 'Units', icon: 'swap-horizontal-outline' },
  { path: '/percent', label: 'Percent', icon: 'stats-chart-outline' },
  { path: '/loan', label: 'Loan / EMI', icon: 'wallet-outline' },
];

const OTHER: { path: string; label: string; icon: IconName }[] = [
  { path: '/settings', label: 'Settings', icon: 'settings-outline' },
  { path: '/about', label: 'About', icon: 'information-circle-outline' },
];

export function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { theme, tap } = useSettings();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const W = Math.min(320, width * 0.82) + insets.left;
  const x = useRef(new Animated.Value(-W)).current;
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      Animated.timing(x, { toValue: 0, duration: 220, useNativeDriver: true }).start();
    } else {
      Animated.timing(x, { toValue: -W, duration: 180, useNativeDriver: true }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [open, W, x]);

  if (!mounted) return null;

  const go = (path: string) => {
    tap();
    onClose();
    if (path !== pathname) router.replace(path as never);
  };

  const scrim = x.interpolate({ inputRange: [-W, 0], outputRange: [0, 0.6] });

  const item = (it: { path: string; label: string; icon: IconName }) => {
    const active = pathname === it.path;
    return (
      <Pressable
        key={it.path}
        onPress={() => go(it.path)}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
          paddingVertical: 14,
          paddingHorizontal: 20,
          marginHorizontal: 10,
          borderRadius: 14,
          backgroundColor: active ? theme.accent + '26' : pressed ? theme.key : 'transparent',
        })}
      >
        <Ionicons name={it.icon} size={22} color={active ? theme.accent : theme.text} />
        <AppText weight={active ? 'bold' : 'regular'} size={17} color={active ? theme.accent : theme.text}>
          {it.label}
        </AppText>
      </Pressable>
    );
  };

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }} pointerEvents="box-none">
      <Animated.View
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000', opacity: scrim }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: W,
          transform: [{ translateX: x }],
          backgroundColor: theme.bg,
          borderRightWidth: 1,
          borderRightColor: theme.border,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 20 }}>
          <Image source={require('../../assets/icon.png')} style={{ width: 48, height: 48, borderRadius: 12 }} />
          <View>
            <AppText weight="bold" size={22}>
              KingCalc
            </AppText>
            <AppText size={13} color={theme.subText}>
              by TeamExyKings
            </AppText>
          </View>
        </View>
        <ScrollView>
          {MAIN.map(item)}
          <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 10, marginHorizontal: 20 }} />
          {OTHER.map(item)}
        </ScrollView>
      </Animated.View>
    </View>
  );
}
