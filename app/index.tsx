import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  NativeSyntheticEvent,
  Pressable,
  TextInput,
  TextInputSelectionChangeEventData,
  View,
  useWindowDimensions,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../src/components/AppText';
import { Screen } from '../src/components/Screen';
import { autoComplete, errorMessage, evaluate, isCompound, resultToString } from '../src/calc/engine';
import { applyKeyAt, EditState, formulaForClipboard, formulaFromClipboard, insertAt, sanitizeExpr } from '../src/calc/keys';
import { dispToRaw, formatExpression, formatNumber, rawToDisp } from '../src/format';
import { FONTS } from '../src/fonts';
import { useSettings } from '../src/settings';
import { getJSON, KEYS, removeKey, setJSON } from '../src/storage';

interface HistoryItem {
  e: string; // expression
  r: string; // raw result
  t: number;
}

type Kind = 'digit' | 'op' | 'fn' | 'eq';

function Key({ label, kind, onPress, onLongPress, height }: {
  label: React.ReactNode;
  kind: Kind;
  onPress: () => void;
  onLongPress?: () => void;
  height: number;
}) {
  const { theme } = useSettings();
  const isEq = kind === 'eq';
  const color = isEq ? theme.accentText : kind === 'digit' ? theme.text : theme.accent;
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => ({
        flex: 1,
        height,
        marginHorizontal: 4,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isEq ? theme.accent : theme.key,
        borderWidth: 1,
        borderColor: theme.border,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      {typeof label === 'string' ? (
        <AppText size={height > 64 ? 30 : 26} color={color}>
          {label}
        </AppText>
      ) : (
        label
      )}
    </Pressable>
  );
}

export default function CalculatorScreen() {
  const { theme, settings, tap } = useSettings();
  const f = FONTS[settings.font];
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const landscape = width > height;
  const [ed, setEd] = useState<EditState>({ expr: '', start: 0, end: 0, fresh: false });
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [extras, setExtras] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const inputRef = useRef<TextInput>(null);
  const lastProg = useRef(0); // time of our last programmatic edit, used to ignore echo selection events
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getJSON<HistoryItem[]>(KEYS.history, []).then(setHistory);
    return () => {
      if (hintTimer.current) clearTimeout(hintTimer.current);
    };
  }, []);

  const keyH = landscape
    ? Math.max(38, Math.min(64, Math.floor((height - insets.top - insets.bottom - 56 - 16 - 5 * 8) / 5)))
    : Math.max(52, Math.min(80, Math.floor((height - insets.top - insets.bottom - 56 - 200) / 5.6)));

  const disp = useMemo(() => formatExpression(ed.expr, settings.grouping), [ed.expr, settings.grouping]);
  const selection = useMemo(
    () => ({ start: rawToDisp(disp, ed.start), end: rawToDisp(disp, ed.end) }),
    [disp, ed.start, ed.end]
  );

  const preview = useMemo(() => {
    const done = autoComplete(ed.expr);
    if (!done || !isCompound(done) || ed.fresh) return null;
    try {
      return formatNumber(evaluate(done), settings.decimals, settings.grouping);
    } catch {
      return null;
    }
  }, [ed, settings.decimals, settings.grouping]);

  const flash = useCallback((msg: string) => {
    setHint(msg);
    if (hintTimer.current) clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setHint(null), 1300);
  }, []);

  const focusInput = useCallback(() => {
    if (!inputRef.current?.isFocused()) inputRef.current?.focus();
  }, []);

  const edit = useCallback((fn: (s: EditState) => EditState) => {
    lastProg.current = Date.now();
    // Any edit dismisses a "Copied" message so the live preview is visible again.
    if (hintTimer.current) clearTimeout(hintTimer.current);
    setHint(null);
    setEd(fn);
  }, []);

  const press = useCallback(
    (k: string) => {
      tap();
      setError(null);
      focusInput();
      edit((s) => applyKeyAt(s, k));
    },
    [tap, edit, focusInput]
  );

  const equals = useCallback(() => {
    tap();
    const done = autoComplete(ed.expr);
    if (!done) return;
    try {
      const v = evaluate(done);
      const r = resultToString(v);
      if (isCompound(done)) {
        const next = [{ e: done, r, t: Date.now() }, ...history].slice(0, 100);
        setHistory(next);
        setJSON(KEYS.history, next);
      }
      setError(null);
      edit(() => ({ expr: r, start: r.length, end: r.length, fresh: true }));
    } catch (e) {
      setError(errorMessage(e));
    }
  }, [ed.expr, history, tap, edit]);

  // Typing/cut/paste through the system text menu arrives here.
  const onChangeText = (text: string) => {
    const dStart = rawToDisp(disp, ed.start);
    const dEnd = rawToDisp(disp, ed.end);
    const inserted = text.length - (disp.length - (dEnd - dStart));
    const dCursor = Math.max(0, Math.min(text.length, dStart + inserted));
    const raw = sanitizeExpr(text);
    const cur = Math.min(raw.length, sanitizeExpr(text.slice(0, dCursor)).length);
    setError(null);
    edit(() => ({ expr: raw, start: cur, end: cur, fresh: false }));
  };

  // The user tapped or dragged the cursor.
  const onSelectionChange = (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
    if (Date.now() - lastProg.current < 250) return;
    const { start, end } = e.nativeEvent.selection;
    const rs = dispToRaw(disp, start);
    const re = dispToRaw(disp, end);
    setEd((s) => (s.start === rs && s.end === re ? s : { ...s, start: rs, end: re, fresh: false }));
  };

  const currentResult = (): string | null => {
    const done = autoComplete(ed.expr);
    if (!done) return null;
    try {
      return resultToString(evaluate(done)).replace('−', '-');
    } catch {
      return null;
    }
  };

  // Long-press on the grey result line: copy just the answer.
  const copyResult = async () => {
    tap();
    const r = currentResult();
    if (r === null) {
      flash('Nothing to copy');
      return;
    }
    try {
      await Clipboard.setStringAsync(r);
      flash('Result copied');
    } catch {
      flash('Could not copy');
    }
  };

  // Copy button: copy the formula exactly as typed, so pasting it back gives an editable formula.
  const copyFormula = async () => {
    tap();
    const text = formulaForClipboard(ed.expr);
    if (!text) {
      flash('Nothing to copy');
      return;
    }
    try {
      await Clipboard.setStringAsync(text);
      flash('Formula copied');
    } catch {
      flash('Could not copy');
    }
  };

  const paste = async () => {
    tap();
    try {
      const clean = formulaFromClipboard(await Clipboard.getStringAsync());
      if (!clean) {
        flash('Nothing to paste');
        return;
      }
      setError(null);
      focusInput();
      edit((s) => insertAt(s, clean));
    } catch {
      flash('Could not paste');
    }
  };

  const copyHistory = async (formula: string) => {
    tap();
    try {
      await Clipboard.setStringAsync(formulaForClipboard(formula));
      flash('Formula copied');
    } catch {
      // ignore
    }
  };

  const clearHistory = async () => {
    setHistory([]);
    await removeKey(KEYS.history);
  };

  const closeHistory = () => {
    setShowHistory(false);
    setTimeout(focusInput, 80);
  };

  const len = disp.length;
  const exprSize = len <= 9 ? 56 : len <= 14 ? 44 : len <= 20 ? 34 : 26;

  const D = (l: string) => <Key key={l} label={l} kind="digit" onPress={() => press(l)} height={keyH} />;
  const O = (l: string) => <Key key={l} label={l} kind="op" onPress={() => press(l)} height={keyH} />;
  const row = (...c: React.ReactNode[]) => (
    <View style={{ flexDirection: 'row', marginBottom: 8 }}>{c}</View>
  );
  const iconBtn = (
    name: keyof typeof Ionicons.glyphMap,
    label: string,
    onPress: () => void,
    onLongPress?: () => void
  ) => (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={{ padding: 8 }}
    >
      <Ionicons name={name} size={24} color={theme.accent} />
    </Pressable>
  );

  const displayCard = (
      <View
    style={{
          flex: 1,
          marginHorizontal: landscape ? 0 : 12,
          marginBottom: landscape ? 0 : 10,
          padding: 16,
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: 18,
        }}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <TextInput
            ref={inputRef}
            value={disp}
            onChangeText={onChangeText}
            selection={selection}
            onSelectionChange={onSelectionChange}
            showSoftInputOnFocus={false}
            autoFocus
            multiline
            autoCorrect={false}
            autoCapitalize="none"
            spellCheck={false}
            placeholder="0"
            placeholderTextColor={theme.text}
            selectionColor={theme.accent}
            cursorColor={theme.accent}
            style={{
              color: theme.text,
              fontSize: exprSize,
              fontFamily: f.regular,
              textAlign: 'right',
              textAlignVertical: 'bottom',
              padding: 0,
              maxHeight: 170,
            }}
          />
          <Pressable onLongPress={copyResult} delayLongPress={350} style={{ alignSelf: 'flex-end' }}>
            <AppText
              size={26}
              color={error ? theme.danger : hint ? theme.accent : theme.subText}
              style={{ marginTop: 6, minHeight: 34, textAlign: 'right' }}
              numberOfLines={1}
            >
              {error ?? hint ?? (preview !== null ? `= ${preview}` : ' ')}
            </AppText>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {!landscape &&
              iconBtn(extras ? 'chevron-down' : 'ellipsis-horizontal', 'More keys', () => {
                tap();
                setExtras((v) => !v);
              })}
            {iconBtn('copy-outline', 'Copy formula', copyFormula, copyResult)}
            {iconBtn('clipboard-outline', 'Paste', paste)}
          </View>
          <Pressable
            onPress={() => press('⌫')}
            onLongPress={() => press('C')}
            accessibilityRole="button"
            accessibilityLabel="Backspace"
            hitSlop={12}
            style={{ padding: 6 }}
          >
            <Ionicons name="backspace-outline" size={28} color={theme.accent} />
          </Pressable>
        </View>
      </View>
  );

  const K = (l: string, kind: Kind, k: string = l) => (
    <Key key={l} label={l} kind={kind} onPress={() => press(k)} height={keyH} />
  );
  const backspaceKey = (
    <Key
      key="bs"
      label={<Ionicons name="backspace-outline" size={26} color={theme.accent} />}
      kind="fn"
      onPress={() => press('⌫')}
      onLongPress={() => press('C')}
      height={keyH}
    />
  );
  const eqKey = <Key key="eq" label="=" kind="eq" onPress={equals} height={keyH} />;

  const landscapeKeypad = (
    <View style={{ flex: 1.2, justifyContent: 'flex-end' }}>
      {row(K('√', 'fn'), K('C', 'fn'), K('( )', 'fn', '()'), K('%', 'fn'), O('÷'))}
      {row(K('x²', 'fn', '²'), D('7'), D('8'), D('9'), O('×'))}
      {row(K('π', 'fn'), D('4'), D('5'), D('6'), O('−'))}
      {row(K('xʸ', 'fn', '^'), D('1'), D('2'), D('3'), O('+'))}
      {row(backspaceKey, D('0'), D('00'), K('.', 'digit'), eqKey)}
    </View>
  );

  const portraitKeypad = (
    <View style={{ paddingHorizontal: 8 }}>
      {extras &&
        row(
          <Key key="sq" label="√" kind="fn" onPress={() => press('√')} height={keyH * 0.75} />,
          <Key key="x2" label="x²" kind="fn" onPress={() => press('²')} height={keyH * 0.75} />,
          <Key key="pi" label="π" kind="fn" onPress={() => press('π')} height={keyH * 0.75} />,
          <Key key="pow" label="xʸ" kind="fn" onPress={() => press('^')} height={keyH * 0.75} />
        )}
      {row(
        <Key key="C" label="C" kind="fn" onPress={() => press('C')} height={keyH} />,
        <Key key="par" label="( )" kind="fn" onPress={() => press('()')} height={keyH} />,
        <Key key="pct" label="%" kind="fn" onPress={() => press('%')} height={keyH} />,
        O('÷')
      )}
      {row(D('7'), D('8'), D('9'), O('×'))}
      {row(D('4'), D('5'), D('6'), O('−'))}
      {row(D('1'), D('2'), D('3'), O('+'))}
      {row(
        D('0'),
        D('00'),
        <Key key="dot" label="." kind="digit" onPress={() => press('.')} height={keyH} />,
        eqKey
      )}
    </View>
  );

  return (
    <Screen
      title="Calculator"
      right={
        <Pressable
          onPress={() => {
            tap();
            setShowHistory(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="History"
          hitSlop={10}
          style={{ padding: 10 }}
        >
          <Ionicons name="time-outline" size={26} color={theme.text} />
        </Pressable>
      }
    >
      {landscape ? (
        <View style={{ flex: 1, flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 8, gap: 12 }}>
          <View style={{ flex: 1 }}>{displayCard}</View>
          {landscapeKeypad}
        </View>
      ) : (
        <>
          {displayCard}
          {portraitKeypad}
        </>
      )}

      <Modal visible={showHistory} animationType="slide" transparent onRequestClose={closeHistory} statusBarTranslucent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1 }} onPress={closeHistory} />
          <View
            style={{
              maxHeight: '75%',
              width: '100%',
              maxWidth: 560,
              alignSelf: 'center',
              backgroundColor: theme.bg,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderColor: theme.border,
              borderWidth: 1,
              paddingBottom: insets.bottom + 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
              <AppText weight="bold" size={20} style={{ flex: 1 }}>
                History
              </AppText>
              {history.length > 0 && (
                <Pressable onPress={clearHistory} hitSlop={10}>
                  <AppText weight="bold" size={15} color={theme.accent}>
                    Clear
                  </AppText>
                </Pressable>
              )}
            </View>
            {history.length === 0 ? (
              <AppText color={theme.subText} style={{ padding: 24, textAlign: 'center' }}>
                Your calculations will appear here.
              </AppText>
            ) : (
              <>
                <AppText size={12} color={theme.subText} style={{ paddingHorizontal: 20, paddingBottom: 6 }}>
                  Tap to reuse a result. Long-press to copy the formula.
                </AppText>
                <FlatList
                  data={history}
                  keyExtractor={(h) => String(h.t)}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => {
                        setError(null);
                        edit(() => ({ expr: item.r, start: item.r.length, end: item.r.length, fresh: true }));
                        closeHistory();
                      }}
                      onLongPress={() => copyHistory(item.e)}
                      style={({ pressed }) => ({
                        paddingVertical: 12,
                        paddingHorizontal: 20,
                        alignItems: 'flex-end',
                        backgroundColor: pressed ? theme.key : 'transparent',
                      })}
                    >
                      <AppText size={15} color={theme.subText}>
                        {formatExpression(item.e, settings.grouping)}
                      </AppText>
                      <AppText weight="bold" size={26}>
                        {formatNumber(Number(item.r.replace('−', '-')), settings.decimals, settings.grouping)}
                      </AppText>
                    </Pressable>
                  )}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
