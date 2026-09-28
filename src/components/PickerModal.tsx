import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from './AppText';
import { FONTS } from '../fonts';
import { useSettings } from '../settings';

export interface PickerOption {
  key: string;
  label: string;
  sub?: string;
}

interface Props {
  visible: boolean;
  title: string;
  options: PickerOption[];
  selected?: string;
  onSelect: (key: string) => void;
  onClose: () => void;
  searchable?: boolean;
  favourites?: string[];
  onToggleFavourite?: (key: string) => void;
}

export function PickerModal({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
  searchable,
  favourites,
  onToggleFavourite,
}: Props) {
  const { theme, settings, tap } = useSettings();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const f = FONTS[settings.font];

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = options;
    if (q) list = list.filter((o) => o.label.toLowerCase().includes(q) || (o.sub ?? '').toLowerCase().includes(q));
    if (favourites && favourites.length && !q) {
      const fav = list.filter((o) => favourites.includes(o.key));
      const rest = list.filter((o) => !favourites.includes(o.key));
      return [...fav, ...rest];
    }
    return list;
  }, [options, query, favourites]);

  const close = () => {
    setQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, height: 56 }}>
          <Pressable onPress={close} hitSlop={10} style={{ padding: 10 }}>
            <Ionicons name="close" size={26} color={theme.text} />
          </Pressable>
          <AppText weight="bold" size={20} style={{ marginLeft: 6 }}>
            {title}
          </AppText>
        </View>
        {searchable ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginHorizontal: 16,
              marginBottom: 8,
              paddingHorizontal: 12,
              backgroundColor: theme.key,
              borderColor: theme.border,
              borderWidth: 1,
              borderRadius: 12,
            }}
          >
            <Ionicons name="search" size={18} color={theme.subText} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search"
              placeholderTextColor={theme.subText}
              selectionColor={theme.accent}
              autoCorrect={false}
              style={{ flex: 1, color: theme.text, fontFamily: f.regular, fontSize: 16, paddingVertical: 10, paddingHorizontal: 8 }}
            />
          </View>
        ) : null}
        <FlatList
          data={data}
          keyExtractor={(o) => o.key}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const active = item.key === selected;
            const isFav = favourites?.includes(item.key);
            return (
              <Pressable
                onPress={() => {
                  tap();
                  setQuery('');
                  onSelect(item.key);
                }}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  backgroundColor: pressed ? theme.key : 'transparent',
                })}
              >
                <View style={{ flex: 1 }}>
                  <AppText weight="bold" size={17} color={active ? theme.accent : theme.text}>
                    {item.label}
                  </AppText>
                  {item.sub ? (
                    <AppText size={13} color={theme.subText}>
                      {item.sub}
                    </AppText>
                  ) : null}
                </View>
                {active ? <Ionicons name="checkmark" size={22} color={theme.accent} style={{ marginRight: 10 }} /> : null}
                {onToggleFavourite ? (
                  <Pressable onPress={() => onToggleFavourite(item.key)} hitSlop={10}>
                    <Ionicons name={isFav ? 'star' : 'star-outline'} size={22} color={isFav ? theme.accent : theme.subText} />
                  </Pressable>
                ) : null}
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
}
