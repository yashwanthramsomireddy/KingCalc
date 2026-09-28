import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { AppText } from './AppText';
import { useSettings } from '../settings';

export interface DialogButton {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  buttons: DialogButton[];
  onClose: () => void;
}

/** A dialog drawn in the app's own theme (the system Alert ignores it). */
export function Dialog({ visible, title, message, buttons, onClose }: Props) {
  const { theme, tap } = useSettings();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center' }}>
        <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={onClose} />
        <View
          style={{
            width: '86%',
            maxWidth: 380,
            backgroundColor: theme.bg,
            borderColor: theme.border,
            borderWidth: 1,
            borderRadius: 22,
            padding: 22,
          }}
        >
          <AppText weight="bold" size={20}>
            {title}
          </AppText>
          {message ? (
            <AppText size={15} color={theme.subText} style={{ marginTop: 10, lineHeight: 22 }}>
              {message}
            </AppText>
          ) : null}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 22 }}>
            {buttons.map((b) => (
              <Pressable
                key={b.label}
                onPress={() => {
                  tap();
                  b.onPress();
                }}
                style={({ pressed }) => ({
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor: pressed ? theme.key : 'transparent',
                })}
              >
                <AppText weight="bold" size={16} color={b.destructive ? theme.danger : theme.accent}>
                  {b.label}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
