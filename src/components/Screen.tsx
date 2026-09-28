import React, { useEffect, useState } from 'react';
import { BackHandler, Pressable, RefreshControlProps, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from './AppText';
import { Drawer } from './Drawer';
import { useSettings } from '../settings';

interface Props {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
  scroll?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export function Screen({ title, children, right, scroll = false, refreshControl }: Props) {
  const { theme, tap } = useSettings();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (drawer) {
        setDrawer(false);
        return true;
      }
      if (pathname !== '/') {
        router.replace((pathname === '/faq' ? '/settings' : '/') as never);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [drawer, pathname, router]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', height: 56, paddingLeft: insets.left + 8, paddingRight: insets.right + 8 }}>
        <Pressable
          onPress={() => {
            tap();
            setDrawer(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          hitSlop={10}
          style={{ padding: 10 }}
        >
          <Ionicons name="menu" size={28} color={theme.text} />
        </Pressable>
        <AppText weight="bold" size={22} style={{ flex: 1, marginLeft: 8 }} numberOfLines={1}>
          {title}
        </AppText>
        {right}
      </View>
      {scroll ? (
        <ScrollView
          refreshControl={refreshControl}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: insets.bottom + 32,
            paddingLeft: 16 + insets.left,
            paddingRight: 16 + insets.right,
            width: '100%',
            maxWidth: 760 + insets.left + insets.right,
            alignSelf: 'center',
          }}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }}>{children}</View>
      )}
      <Drawer open={drawer} onClose={() => setDrawer(false)} />
    </View>
  );
}
