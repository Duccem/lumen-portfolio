import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale, Txt } from '@/components/home/primitives';
import { MaxContentWidth, Radius } from '@/constants/theme';
import { estimateList, parseListText, resolveEntry, type ShoppingList } from '@/data/lists';
import { formatPrice } from '@/data/pricing';
import { useTabBarInset } from '@/hooks/use-tab-bar-inset';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/state/app-state';

const openList = (id: string) => router.push({ pathname: '/list/[id]', params: { id } });
const convertList = (id: string) => router.push({ pathname: '/convert/[id]', params: { id } });

export default function ListsScreen() {
  const tabBarInset = useTabBarInset();
  const c = useTheme();
  const app = useAppState();
  const [pasted, setPasted] = useState('');
  const [pasteFocused, setPasteFocused] = useState(false);
  const preview = parseListText(pasted);

  const createFromPaste = () => {
    if (!preview.length) return;
    const id = app.createList({ name: 'Lista pegada', entries: preview });
    setPasted('');
    openList(id);
  };

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}>
      <SafeAreaView edges={['top']} style={styles.flex}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: tabBarInset + 16 }]}>
          <View style={styles.centered}>
            <View style={styles.header}>
              <View style={styles.flex}>
                <Txt variant="caption" color="textSecondary">
                  {app.shoppingLists.length} {app.shoppingLists.length === 1 ? 'lista' : 'listas'}
                </Txt>
                <Txt variant="display">Mis listas</Txt>
              </View>
              <PressableScale
                accessibilityLabel="Nueva lista"
                onPress={() => openList(app.createList())}
                style={[styles.newBtn, { backgroundColor: c.primary, boxShadow: `0 10px 20px -10px ${c.primary}` }]}>
                <Ionicons name="add" size={18} color={c.onPrimary} />
                <Txt variant="captionStrong" style={{ color: c.onPrimary }}>
                  Nueva
                </Txt>
              </PressableScale>
            </View>

            {/* Paste a regular list */}
            <View
              style={[
                styles.paste,
                {
                  backgroundColor: c.surface,
                  borderColor: pasteFocused ? c.primary : c.border,
                },
              ]}>
              <View style={styles.pasteHead}>
                <View style={[styles.pasteIcon, { backgroundColor: c.primarySoft }]}>
                  <Ionicons name="clipboard-outline" size={18} color={c.primary} />
                </View>
                <View style={styles.flex}>
                  <Txt variant="bodyStrong">¿Ya tienes tu lista escrita?</Txt>
                  <Txt variant="caption" color="textTertiary">
                    Pégala y la convertimos en una canasta con los mejores precios
                  </Txt>
                </View>
              </View>
              <TextInput
                value={pasted}
                onChangeText={setPasted}
                onFocus={() => setPasteFocused(true)}
                onBlur={() => setPasteFocused(false)}
                multiline
                placeholder={'2 leches\nPan lactal, tomates\nHuevos x12…'}
                placeholderTextColor={c.textTertiary}
                selectionColor={c.primary}
                style={[
                  styles.pasteInput,
                  { color: c.text, backgroundColor: c.surfaceMuted },
                  Platform.OS === 'web' && styles.noOutline,
                ]}
              />
              {preview.length > 0 && (
                <Animated.View entering={FadeIn.duration(160)} style={styles.previewChips}>
                  {preview.slice(0, 8).map((e) => {
                    const product = resolveEntry(e);
                    return (
                      <View
                        key={e.id}
                        style={[styles.previewChip, { backgroundColor: product ? c.primarySoft : c.surfaceMuted }]}>
                        <Text style={styles.chipEmoji}>{product?.emoji ?? '❔'}</Text>
                        <Txt variant="caption" color={product ? 'primaryStrong' : 'textSecondary'}>
                          {e.qty > 1 ? `${e.qty} × ` : ''}
                          {e.text}
                        </Txt>
                      </View>
                    );
                  })}
                  {preview.length > 8 && (
                    <Txt variant="caption" color="textTertiary">
                      +{preview.length - 8} más
                    </Txt>
                  )}
                </Animated.View>
              )}
              <PressableScale
                onPress={createFromPaste}
                disabled={!preview.length}
                style={[
                  styles.pasteBtn,
                  { backgroundColor: preview.length ? c.primary : c.surfaceMuted },
                ]}>
                <Ionicons name="sparkles" size={16} color={preview.length ? c.onPrimary : c.textTertiary} />
                <Txt variant="bodyStrong" style={{ color: preview.length ? c.onPrimary : c.textTertiary }}>
                  {preview.length ? `Crear lista con ${preview.length} productos` : 'Pega o escribe tu lista'}
                </Txt>
              </PressableScale>
            </View>

            {/* Lists */}
            {app.shoppingLists.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>📝</Text>
                <Txt variant="title">Aún no tienes listas</Txt>
                <Txt variant="body" color="textSecondary" style={styles.center}>
                  Crea una para tus compras de la semana, un asado o una receta.
                </Txt>
              </View>
            ) : (
              <View style={styles.lists}>
                {app.shoppingLists.map((list) => (
                  <Animated.View
                    key={list.id}
                    entering={FadeIn.duration(180)}
                    exiting={FadeOut.duration(120)}
                    layout={LinearTransition.duration(200)}>
                    <ListCard list={list} />
                  </Animated.View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function ListCard({ list }: { list: ShoppingList }) {
  const c = useTheme();
  const est = estimateList(list);
  const progress = est.count ? est.checked / est.count : 0;
  const preview = list.entries.slice(0, 5).map((e) => resolveEntry(e)?.emoji ?? '❔');

  return (
    <PressableScale
      activeScale={0.98}
      onPress={() => openList(list.id)}
      style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={styles.cardHead}>
        <View style={[styles.listEmoji, { backgroundColor: c.surfaceMuted }]}>
          <Text style={styles.listEmojiText}>{list.emoji}</Text>
        </View>
        <View style={styles.flex}>
          <Txt variant="bodyStrong" numberOfLines={1}>
            {list.name}
          </Txt>
          <Txt variant="caption" color="textTertiary">
            {est.count} {est.count === 1 ? 'producto' : 'productos'}
            {est.count > 0 ? ` · ${est.checked} marcados` : ''}
          </Txt>
        </View>
        <Ionicons name="chevron-forward" size={18} color={c.textTertiary} />
      </View>

      {est.count > 0 && (
        <>
          <View style={styles.emojiRow}>
            {preview.map((e, i) => (
              <View key={i} style={[styles.miniEmoji, { backgroundColor: c.surfaceMuted }]}>
                <Text style={styles.miniEmojiText}>{e}</Text>
              </View>
            ))}
            {list.entries.length > 5 && (
              <Txt variant="caption" color="textTertiary">
                +{list.entries.length - 5}
              </Txt>
            )}
          </View>

          <View style={[styles.track, { backgroundColor: c.surfaceMuted }]}>
            <View style={[styles.trackFill, { width: `${progress * 100}%`, backgroundColor: c.primary }]} />
          </View>

          <View style={styles.cardFoot}>
            <View>
              <Txt variant="caption" color="textTertiary">
                Estimado desde
              </Txt>
              <Txt variant="title">{formatPrice(est.total)}</Txt>
              {est.matched < est.count && (
                <Txt variant="caption" color="warning">
                  {est.count - est.matched} sin precio
                </Txt>
              )}
            </View>
            <PressableScale
              onPress={() => convertList(list.id)}
              disabled={est.matched === 0}
              style={[styles.convertBtn, { backgroundColor: c.primarySoft }]}>
              <Ionicons name="sparkles" size={14} color={c.primary} />
              <Txt variant="captionStrong" color="primaryStrong">
                Convertir en canasta
              </Txt>
            </PressableScale>
          </View>
        </>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  noOutline: {
    // @ts-expect-error web-only style
    outlineStyle: 'none',
  },
  scroll: { paddingTop: 8 },
  centered: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: 16,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 8,
    gap: 12,
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 40,
    paddingLeft: 12,
    paddingRight: 16,
    borderRadius: Radius.pill,
  },
  paste: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    padding: 16,
    gap: 12,
  },
  pasteHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pasteIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pasteInput: {
    minHeight: 96,
    maxHeight: 200,
    borderRadius: Radius.sm,
    padding: 12,
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  previewChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  previewChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    height: 26,
    borderRadius: Radius.pill,
  },
  chipEmoji: { fontSize: 12 },
  pasteBtn: {
    height: 48,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  lists: { gap: 12 },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listEmoji: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listEmojiText: { fontSize: 22 },
  emojiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniEmoji: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniEmojiText: { fontSize: 16 },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  trackFill: { height: '100%', borderRadius: 2 },
  cardFoot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  convertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 32,
  },
  emptyEmoji: { fontSize: 48 },
});
