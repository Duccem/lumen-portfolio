import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale, Txt } from '@/components/home/primitives';
import { MaxContentWidth, Radius } from '@/constants/theme';
import { type Product } from '@/data/catalog';
import {
  LIST_EMOJIS,
  estimateList,
  matchCandidates,
  newId,
  parseListText,
  resolveEntry,
  type ListEntry,
  type ShoppingList,
} from '@/data/lists';
import { formatPrice, summarize } from '@/data/pricing';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/state/app-state';

const goBack = () => (router.canGoBack() ? router.back() : router.replace('/lists' as Href));
const rowLayout = LinearTransition.duration(200);

export default function ListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const app = useAppState();
  const list = app.shoppingLists.find((l) => l.id === id);
  if (!list) return <Missing />;
  return <ListEditor list={list} />;
}

function ListEditor({ list }: { list: ShoppingList }) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const app = useAppState();
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const suggestions = draft.trim().length >= 2 ? matchCandidates(draft, 4) : [];
  const est = estimateList(list);

  const pending = list.entries.filter((e) => !e.checked);
  const done = list.entries.filter((e) => e.checked);

  const addDraft = (product?: Product) => {
    if (product) {
      app.addEntries(list.id, [{ id: newId(), text: product.name, qty: 1, checked: false, productId: product.id }]);
    } else {
      const entries = parseListText(draft);
      if (entries.length) app.addEntries(list.id, entries);
    }
    setDraft('');
  };

  const remove = () => {
    const run = () => {
      app.deleteList(list.id);
      goBack();
    };
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.(`¿Eliminar "${list.name}"?`)) run();
      return;
    }
    Alert.alert('Eliminar lista', `¿Eliminar "${list.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: run },
    ]);
  };

  const cycleEmoji = () => {
    const i = LIST_EMOJIS.indexOf(list.emoji);
    app.updateList(list.id, { emoji: LIST_EMOJIS[(i + 1) % LIST_EMOJIS.length] });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: c.border }]}>
        <View style={styles.headerInner}>
          <RoundButton icon="chevron-back" label="Volver" onPress={goBack} />
          <Pressable
            onPress={cycleEmoji}
            accessibilityLabel="Cambiar ícono"
            style={[styles.emojiBtn, { backgroundColor: c.surfaceMuted }]}>
            <Text style={styles.emoji}>{list.emoji}</Text>
          </Pressable>
          <TextInput
            value={list.name}
            onChangeText={(name) => app.updateList(list.id, { name })}
            placeholder="Nombre de la lista"
            placeholderTextColor={c.textTertiary}
            selectionColor={c.primary}
            style={[styles.nameInput, { color: c.text }, Platform.OS === 'web' && styles.noOutline]}
          />
          <RoundButton icon="trash-outline" label="Eliminar lista" onPress={remove} color={c.deal} />
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <View style={styles.centered}>
          {/* Add item */}
          <View style={[styles.addBox, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View style={styles.addRow}>
              <Ionicons name="add-circle" size={22} color={c.primary} />
              <TextInput
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={() => addDraft()}
                placeholder="Agregar: 2 leches, pan, tomates…"
                placeholderTextColor={c.textTertiary}
                returnKeyType="done"
                submitBehavior="submit"
                selectionColor={c.primary}
                style={[styles.addInput, { color: c.text }, Platform.OS === 'web' && styles.noOutline]}
              />
              {draft.trim().length > 0 && (
                <PressableScale onPress={() => addDraft()} style={[styles.addBtn, { backgroundColor: c.primary }]}>
                  <Txt variant="captionStrong" style={{ color: c.onPrimary }}>
                    Agregar
                  </Txt>
                </PressableScale>
              )}
            </View>
            {suggestions.length > 0 && (
              <Animated.View entering={FadeIn.duration(150)} style={[styles.suggestions, { borderTopColor: c.border }]}>
                <Txt variant="caption" color="textTertiary">
                  Del catálogo
                </Txt>
                <View style={styles.wrap}>
                  {suggestions.map(({ product }) => (
                    <PressableScale
                      key={product.id}
                      onPress={() => addDraft(product)}
                      style={[styles.suggestion, { backgroundColor: c.primarySoft }]}>
                      <Text style={styles.chipEmoji}>{product.emoji}</Text>
                      <Txt variant="captionStrong" color="primaryStrong">
                        {product.name}
                      </Txt>
                      <Txt variant="caption" color="primary">
                        {formatPrice(summarize(product)!.best.price)}
                      </Txt>
                    </PressableScale>
                  ))}
                </View>
              </Animated.View>
            )}
          </View>

          {/* Entries */}
          {list.entries.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Txt variant="body" color="textSecondary" style={styles.center}>
                Escribe lo que necesitas como lo harías en papel. Nosotros buscamos los precios.
              </Txt>
            </View>
          ) : (
            <>
              <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
                {pending.map((entry, i) => (
                  <Animated.View key={entry.id} layout={rowLayout} entering={FadeIn.duration(160)} exiting={FadeOut.duration(120)}>
                    <EntryRow
                      list={list}
                      entry={entry}
                      first={i === 0}
                      editing={editing === entry.id}
                      onToggleEdit={() => setEditing((e) => (e === entry.id ? null : entry.id))}
                    />
                  </Animated.View>
                ))}
                {pending.length === 0 && (
                  <View style={styles.allDone}>
                    <Txt variant="body" color="primary">
                      ✅ ¡Todo listo!
                    </Txt>
                  </View>
                )}
              </View>

              {done.length > 0 && (
                <Animated.View layout={rowLayout} style={styles.doneSection}>
                  <Txt variant="captionStrong" color="textTertiary" style={styles.label}>
                    EN EL CARRITO ({done.length})
                  </Txt>
                  <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
                    {done.map((entry, i) => (
                      <Animated.View key={entry.id} layout={rowLayout} entering={FadeIn.duration(160)} exiting={FadeOut.duration(120)}>
                        <EntryRow list={list} entry={entry} first={i === 0} editing={false} onToggleEdit={() => {}} />
                      </Animated.View>
                    ))}
                  </View>
                </Animated.View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Convert CTA */}
      {est.matched > 0 && (
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: c.surface,
              borderTopColor: c.border,
              paddingBottom: insets.bottom + 12,
              boxShadow: `0 -12px 24px -16px ${c.shadow}40`,
            },
          ]}>
          <View style={styles.bottomInner}>
            <View>
              <Txt variant="caption" color="textTertiary">
                Desde
              </Txt>
              <Txt variant="title">{formatPrice(est.total)}</Txt>
            </View>
            <PressableScale
              onPress={() => router.push({ pathname: '/convert/[id]', params: { id: list.id } })}
              style={[styles.cta, { backgroundColor: c.primary, boxShadow: `0 12px 20px -12px ${c.primary}` }]}>
              <Ionicons name="sparkles" size={18} color={c.onPrimary} />
              <Txt variant="bodyStrong" style={{ color: c.onPrimary }}>
                Convertir en canasta
              </Txt>
            </PressableScale>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

function EntryRow({
  list,
  entry,
  first,
  editing,
  onToggleEdit,
}: {
  list: ShoppingList;
  entry: ListEntry;
  first: boolean;
  editing: boolean;
  onToggleEdit: () => void;
}) {
  const c = useTheme();
  const app = useAppState();
  const product = resolveEntry(entry);
  const candidates = editing ? matchCandidates(entry.text, 4) : [];
  const best = product ? summarize(product)?.best.price : undefined;

  return (
    <View style={[styles.entry, !first && { borderTopWidth: 1, borderTopColor: c.border }]}>
      <View style={styles.entryMain}>
        <Pressable
          hitSlop={8}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: entry.checked }}
          onPress={() => app.updateEntry(list.id, entry.id, { checked: !entry.checked })}
          style={[
            styles.check,
            entry.checked ? { backgroundColor: c.primary, borderColor: c.primary } : { borderColor: c.border },
          ]}>
          {entry.checked && <Ionicons name="checkmark" size={14} color={c.onPrimary} />}
        </Pressable>

        <Pressable onPress={entry.checked ? undefined : onToggleEdit} style={styles.flex}>
          <Txt
            variant="body"
            color={entry.checked ? 'textTertiary' : 'text'}
            style={entry.checked && styles.strike}
            numberOfLines={1}>
            {entry.text}
          </Txt>
          {product ? (
            <View style={styles.matchRow}>
              <Text style={styles.chipEmoji}>{product.emoji}</Text>
              <Txt variant="caption" color="textSecondary" numberOfLines={1} style={styles.shrink}>
                {product.name !== entry.text ? `${product.name} · ` : ''}
                {product.unit}
              </Txt>
              {!entry.checked && (
                <Ionicons name={editing ? 'chevron-up' : 'chevron-down'} size={12} color={c.textTertiary} />
              )}
            </View>
          ) : (
            <View style={styles.matchRow}>
              <Ionicons name="help-circle-outline" size={12} color={c.warning} />
              <Txt variant="caption" color="warning">
                No está en el catálogo
              </Txt>
            </View>
          )}
        </Pressable>

        {best !== undefined && !entry.checked && (
          <Txt variant="captionStrong" color="primary">
            {formatPrice(best * entry.qty)}
          </Txt>
        )}

        {!entry.checked ? (
          <View style={[styles.stepper, { backgroundColor: c.surfaceMuted }]}>
            <Pressable
              hitSlop={6}
              accessibilityLabel={entry.qty === 1 ? 'Quitar' : 'Restar'}
              onPress={() =>
                entry.qty === 1
                  ? app.removeEntry(list.id, entry.id)
                  : app.updateEntry(list.id, entry.id, { qty: entry.qty - 1 })
              }
              style={[styles.stepBtn, { backgroundColor: c.surface }]}>
              <Ionicons
                name={entry.qty === 1 ? 'trash-outline' : 'remove'}
                size={13}
                color={entry.qty === 1 ? c.deal : c.text}
              />
            </Pressable>
            <Txt variant="captionStrong" style={styles.qty}>
              {entry.qty}
            </Txt>
            <Pressable
              hitSlop={6}
              accessibilityLabel="Sumar"
              onPress={() => app.updateEntry(list.id, entry.id, { qty: Math.min(99, entry.qty + 1) })}
              style={[styles.stepBtn, { backgroundColor: c.surface }]}>
              <Ionicons name="add" size={13} color={c.text} />
            </Pressable>
          </View>
        ) : (
          <Pressable hitSlop={8} onPress={() => app.removeEntry(list.id, entry.id)} accessibilityLabel="Quitar">
            <Ionicons name="close" size={18} color={c.textTertiary} />
          </Pressable>
        )}
      </View>

      {editing && (
        <Animated.View entering={FadeIn.duration(150)} style={styles.candidates}>
          <Txt variant="caption" color="textTertiary">
            {candidates.length ? '¿Cuál de estos es?' : 'Sin coincidencias en el catálogo'}
          </Txt>
          <View style={styles.wrap}>
            {candidates.map(({ product: p }) => {
              const active = p.id === product?.id;
              return (
                <PressableScale
                  key={p.id}
                  onPress={() => {
                    app.updateEntry(list.id, entry.id, { productId: p.id });
                    onToggleEdit();
                  }}
                  style={[
                    styles.suggestion,
                    {
                      backgroundColor: active ? c.primarySoft : c.surface,
                      borderColor: active ? c.primary : c.border,
                      borderWidth: 1,
                    },
                  ]}>
                  <Text style={styles.chipEmoji}>{p.emoji}</Text>
                  <Txt variant="captionStrong">{p.name}</Txt>
                </PressableScale>
              );
            })}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

function RoundButton({
  icon,
  label,
  onPress,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
}) {
  const c = useTheme();
  return (
    <PressableScale
      activeScale={0.9}
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.round, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Ionicons name={icon} size={20} color={color ?? c.text} />
    </PressableScale>
  );
}

function Missing() {
  const c = useTheme();
  return (
    <View style={[styles.screen, styles.missing, { backgroundColor: c.background }]}>
      <Text style={styles.emptyEmoji}>🗂️</Text>
      <Txt variant="title">Esta lista ya no existe</Txt>
      <PressableScale onPress={goBack} style={[styles.cta, styles.missingBtn, { backgroundColor: c.primary }]}>
        <Txt variant="bodyStrong" style={{ color: c.onPrimary }}>
          Volver
        </Txt>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  shrink: { flexShrink: 1 },
  center: { textAlign: 'center' },
  strike: { textDecorationLine: 'line-through' },
  noOutline: {
    // @ts-expect-error web-only style
    outlineStyle: 'none',
  },
  header: { paddingBottom: 12, borderBottomWidth: 1 },
  headerInner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  emojiBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 20 },
  nameInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: -0.3,
    height: 44,
  },
  round: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  addBox: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 56,
  },
  addInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: 500,
    height: 48,
  },
  addBtn: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestions: {
    borderTopWidth: 1,
    paddingVertical: 12,
    gap: 8,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: Radius.pill,
  },
  chipEmoji: { fontSize: 13 },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  entry: {
    paddingVertical: 12,
    gap: 10,
  },
  entryMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    borderRadius: 10,
  },
  stepBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: { minWidth: 24, textAlign: 'center' },
  candidates: {
    paddingLeft: 36,
    gap: 8,
  },
  allDone: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  doneSection: { gap: 8 },
  label: {
    letterSpacing: 0.8,
    fontSize: 11,
    paddingHorizontal: 4,
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  emptyEmoji: { fontSize: 48 },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingTop: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  bottomInner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
  },
  cta: {
    flex: 1,
    height: 52,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  missing: { alignItems: 'center', justifyContent: 'center', gap: 16 },
  missingBtn: { flex: 0, paddingHorizontal: 32 },
});
