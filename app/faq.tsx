import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../src/components/AppText';
import { Screen } from '../src/components/Screen';
import { Card, SectionTitle } from '../src/components/ui';
import { FAQ } from '../src/faqData';
import { useSettings } from '../src/settings';

export default function FaqScreen() {
  const { theme, tap } = useSettings();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <Screen title="FAQ" scroll>
      <AppText size={15} color={theme.subText}>
        Quick answers on how to use each part of KingCalc. Tap a question to expand it.
      </AppText>
      {FAQ.map((section) => (
        <View key={section.title}>
          <SectionTitle>{section.title}</SectionTitle>
          <Card style={{ paddingVertical: 4 }}>
            {section.items.map((item, i) => {
              const id = `${section.title}:${i}`;
              const isOpen = open === id;
              return (
                <View key={id} style={{ borderTopWidth: i === 0 ? 0 : 1, borderTopColor: theme.border }}>
                  <Pressable
                    onPress={() => {
                      tap();
                      setOpen(isOpen ? null : id);
                    }}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 10 }}
                  >
                    <AppText weight="bold" size={16} style={{ flex: 1 }}>
                      {item.q}
                    </AppText>
                    <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color={theme.accent} />
                  </Pressable>
                  {isOpen ? (
                    <AppText size={15} color={theme.subText} style={{ paddingBottom: 14, lineHeight: 22 }} selectable>
                      {item.a}
                    </AppText>
                  ) : null}
                </View>
              );
            })}
          </Card>
        </View>
      ))}
    </Screen>
  );
}
