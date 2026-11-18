import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { type ReactNode } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale, Txt } from '@/components/home/primitives';
import { StoreLogo } from '@/components/home/store-badges';
import { Colors, MaxContentWidth, Radius } from '@/constants/theme';
import { initials } from '@/data/auth';
import { STORES } from '@/data/catalog';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTabBarInset } from '@/hooks/use-tab-bar-inset';
import { useTheme } from '@/hooks/use-theme';
import { useAppState, type Settings, type ThemePreference } from '@/state/app-state';

const THEMES: { id: ThemePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'system', label: 'Sistema', icon: 'phone-portrait-outline' },
  { id: 'light', label: 'Claro', icon: 'sunny-outline' },
  { id: 'dark', label: 'Oscuro', icon: 'moon-outline' },
];

const RADII: Settings['radiusKm'][] = [2, 5, 10];

/** Cross-platform confirm (Alert buttons aren't supported on web). */
function confirm(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Confirmar', style: 'destructive', onPress: onConfirm },
  ]);
}

export default function SettingsScreen() {
  const tabBarInset = useTabBarInset();
  const c = useTheme();
  const scheme = useColorScheme();
  const app = useAppState();
  const { settings, updateSettings, session } = app;
  const listCount = Object.keys(app.list).length;
  const alertCount = Object.keys(app.alerts).length;

  const togglePreferred = (id: (typeof STORES)[number]['id']) =>
    updateSettings({
      preferredStores: settings.preferredStores.includes(id)
        ? settings.preferredStores.filter((s) => s !== id)
        : [...settings.preferredStores, id],
    });

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}>
      <SafeAreaView edges={['top']} style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: tabBarInset + 16 }]}>
          <View style={styles.centered}>
            <Txt variant="display" style={styles.title}>
              Ajustes
            </Txt>

            {/* Profile */}
            {session ? (
              <Animated.View
                key="signed-in"
                entering={FadeIn.duration(200)}
                style={[styles.profile, { backgroundColor: c.surface, borderColor: c.border }]}>
                <View style={[styles.avatar, { backgroundColor: c.primary }]}>
                  <Txt variant="bodyStrong" style={{ color: c.onPrimary }}>
                    {initials(session.name)}
                  </Txt>
                </View>
                <View style={styles.flex}>
                  <Txt variant="bodyStrong">{session.name}</Txt>
                  <View style={styles.provider}>
                    <Ionicons
                      name={session.provider === 'google' ? 'logo-google' : 'mail-outline'}
                      size={12}
                      color={c.textTertiary}
                    />
                    <Txt variant="caption" color="textTertiary" numberOfLines={1}>
                      {session.email}
                    </Txt>
                  </View>
                </View>
                <View style={[styles.syncBadge, { backgroundColor: c.primarySoft }]}>
                  <Ionicons name="cloud-done-outline" size={14} color={c.primary} />
                  <Txt variant="captionStrong" color="primary">
                    Sincronizado
                  </Txt>
                </View>
              </Animated.View>
            ) : (
              <Animated.View
                key="guest"
                entering={FadeIn.duration(200)}
                style={[styles.profile, { backgroundColor: c.surface, borderColor: c.border }]}>
                <View style={[styles.avatar, { backgroundColor: c.primarySoft }]}>
                  <Ionicons name="person" size={24} color={c.primary} />
                </View>
                <View style={styles.flex}>
                  <Txt variant="bodyStrong">Invitado</Txt>
                  <Txt variant="caption" color="textTertiary">
                    Inicia sesión para sincronizar tu canasta
                  </Txt>
                </View>
                <PressableScale
                  onPress={() => router.push('/login')}
                  style={[styles.smallBtn, { backgroundColor: c.primary }]}>
                  <Txt variant="captionStrong" style={{ color: c.onPrimary }}>
                    Entrar
                  </Txt>
                </PressableScale>
              </Animated.View>
            )}

            <View style={styles.statsRow}>
              <StatTile icon="basket" value={listCount} label="En tu canasta" />
              <StatTile icon="heart" value={app.favorites.length} label="Favoritos" />
              <StatTile icon="notifications" value={alertCount} label="Alertas" />
            </View>

            {/* Appearance */}
            <Group title="Apariencia">
              <View style={styles.themeRow}>
                {THEMES.map((t) => {
                  const active = settings.theme === t.id;
                  const preview = t.id === 'system' ? scheme : t.id;
                  return (
                    <PressableScale
                      key={t.id}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active }}
                      onPress={() => updateSettings({ theme: t.id })}
                      style={[
                        styles.themeCard,
                        {
                          backgroundColor: c.surface,
                          borderColor: active ? c.primary : c.border,
                          boxShadow: active ? `0 0 0 3px ${c.primarySoft}` : 'none',
                        },
                      ]}>
                      <ThemePreview scheme={preview} split={t.id === 'system'} />
                      <View style={styles.themeLabel}>
                        <Ionicons name={t.icon} size={14} color={active ? c.primary : c.textSecondary} />
                        <Txt variant="captionStrong" color={active ? 'primary' : 'text'}>
                          {t.label}
                        </Txt>
                      </View>
                    </PressableScale>
                  );
                })}
              </View>
            </Group>

            {/* Notifications */}
            <Group title="Notificaciones">
              <Card>
                <LinkRow
                  icon="notifications-outline"
                  tint={c.primary}
                  title="Ver notificaciones"
                  detail={app.unreadCount ? `${app.unreadCount} sin leer` : undefined}
                  onPress={() => router.push('/notifications')}
                />
                <Divider />
                <ToggleRow
                  icon="trending-down"
                  tint={c.deal}
                  title="Alertas de baja de precio"
                  subtitle="Cuando un favorito o alerta baje de precio"
                  value={settings.priceAlerts}
                  onChange={(priceAlerts) => updateSettings({ priceAlerts })}
                />
                <Divider />
                <ToggleRow
                  icon="newspaper-outline"
                  tint="#3B82F6"
                  title="Resumen semanal"
                  subtitle="Las mejores ofertas cada lunes"
                  value={settings.weeklyDigest}
                  onChange={(weeklyDigest) => updateSettings({ weeklyDigest })}
                />
              </Card>
            </Group>

            {/* Shopping */}
            <Group title="Compras">
              <Card>
                <View style={styles.row}>
                  <RowIcon icon="navigate-outline" tint={c.primary} />
                  <View style={styles.flex}>
                    <Txt variant="bodyStrong">Radio de búsqueda</Txt>
                    <Txt variant="caption" color="textTertiary">
                      Comercios a menos de {settings.radiusKm} km
                    </Txt>
                  </View>
                </View>
                <View style={[styles.segment, { backgroundColor: c.surfaceMuted }]}>
                  {RADII.map((r) => {
                    const active = settings.radiusKm === r;
                    return (
                      <Pressable
                        key={r}
                        onPress={() => updateSettings({ radiusKm: r })}
                        style={[styles.segmentItem, active && { backgroundColor: c.surface, boxShadow: `0 2px 8px -4px ${c.shadow}66` }]}>
                        <Txt variant="captionStrong" color={active ? 'text' : 'textSecondary'}>
                          {r} km
                        </Txt>
                      </Pressable>
                    );
                  })}
                </View>
                <Divider />
                <ToggleRow
                  icon="calculator-outline"
                  tint={c.warning}
                  title="Mostrar precio por unidad"
                  subtitle="Precio por kg o litro en los productos"
                  value={settings.showUnitPrice}
                  onChange={(showUnitPrice) => updateSettings({ showUnitPrice })}
                />
              </Card>
            </Group>

            <Group title="Comercios preferidos" hint={settings.preferredStores.length ? `${settings.preferredStores.length} elegidos` : 'Ninguno'}>
              <View style={styles.storeWrap}>
                {STORES.map((store) => {
                  const active = settings.preferredStores.includes(store.id);
                  return (
                    <PressableScale
                      key={store.id}
                      onPress={() => togglePreferred(store.id)}
                      style={[
                        styles.storeChip,
                        {
                          backgroundColor: active ? c.primarySoft : c.surface,
                          borderColor: active ? c.primary : c.border,
                        },
                      ]}>
                      <StoreLogo id={store.id} size={24} />
                      <Txt variant="captionStrong">{store.name}</Txt>
                      {active && (
                        <Animated.View entering={FadeIn.duration(150)}>
                          <Ionicons name="checkmark-circle" size={16} color={c.primary} />
                        </Animated.View>
                      )}
                    </PressableScale>
                  );
                })}
              </View>
            </Group>

            {/* Data */}
            <Group title="Datos">
              <Card>
                <LinkRow
                  icon="basket-outline"
                  tint={c.textSecondary}
                  title="Vaciar canasta"
                  detail={`${listCount}`}
                  onPress={() => confirm('Vaciar canasta', 'Se quitarán todos los productos de tu canasta.', app.clearList)}
                />
                <Divider />
                <LinkRow
                  icon="heart-dislike-outline"
                  tint={c.textSecondary}
                  title="Borrar favoritos"
                  detail={`${app.favorites.length}`}
                  onPress={() => confirm('Borrar favoritos', 'Se eliminarán todos tus favoritos.', app.clearFavorites)}
                />
                <Divider />
                {session && (
                  <>
                    <LinkRow
                      icon="log-out-outline"
                      tint={c.deal}
                      title="Cerrar sesión"
                      destructive
                      onPress={() =>
                        confirm('Cerrar sesión', `Saldrás de la cuenta ${session.email}.`, app.signOut)
                      }
                    />
                    <Divider />
                  </>
                )}
                <LinkRow
                  icon="refresh-outline"
                  tint={c.deal}
                  title="Restablecer ajustes"
                  destructive
                  onPress={() =>
                    confirm('Restablecer ajustes', 'Vuelve el tema y las preferencias a sus valores por defecto.', app.resetSettings)
                  }
                />
              </Card>
            </Group>

            {/* About */}
            <Group title="Acerca de">
              <Card>
                <LinkRow icon="help-circle-outline" tint="#3B82F6" title="Ayuda y preguntas frecuentes" onPress={() => {}} />
                <Divider />
                <LinkRow icon="document-text-outline" tint={c.textSecondary} title="Términos y privacidad" onPress={() => {}} />
                <Divider />
                <LinkRow icon="star-outline" tint={c.warning} title="Califica la app" onPress={() => {}} />
              </Card>
              <View style={styles.brand}>
                <Image
                  source={require('@/assets/images/preci-mark-green.png')}
                  style={styles.brandMark}
                  contentFit="contain"
                />
                <Txt variant="caption" color="textTertiary">
                  Preci v{Constants.expoConfig?.version ?? '1.0.0'} · Datos de ejemplo
                </Txt>
              </View>
            </Group>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

/** Miniature of the home screen in a given scheme. */
function ThemePreview({ scheme, split }: { scheme: 'light' | 'dark'; split?: boolean }) {
  const half = (s: 'light' | 'dark', style?: object) => {
    const p = Colors[s];
    return (
      <View style={[styles.previewHalf, { backgroundColor: p.background }, style]}>
        <View style={[styles.previewBar, { backgroundColor: p.surface, borderColor: p.border }]} />
        <View style={styles.previewGrid}>
          <View style={[styles.previewCard, { backgroundColor: p.surface, borderColor: p.border }]}>
            <View style={[styles.previewDot, { backgroundColor: p.primary }]} />
          </View>
          <View style={[styles.previewCard, { backgroundColor: p.surface, borderColor: p.border }]}>
            <View style={[styles.previewDot, { backgroundColor: p.primarySoft }]} />
          </View>
        </View>
      </View>
    );
  };

  if (split) {
    return (
      <View style={styles.preview}>
        {half('light', styles.previewLeft)}
        {half('dark', styles.previewRight)}
      </View>
    );
  }
  return <View style={styles.preview}>{half(scheme, styles.previewFull)}</View>;
}

function Group({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <View style={styles.group}>
      <View style={styles.groupHeader}>
        <Txt variant="captionStrong" color="textTertiary" style={styles.groupTitle}>
          {title.toUpperCase()}
        </Txt>
        {hint ? (
          <Txt variant="caption" color="textTertiary">
            {hint}
          </Txt>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function Card({ children }: { children: ReactNode }) {
  const c = useTheme();
  return <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>{children}</View>;
}

function Divider() {
  const c = useTheme();
  return <View style={[styles.divider, { backgroundColor: c.border }]} />;
}

function RowIcon({ icon, tint }: { icon: keyof typeof Ionicons.glyphMap; tint: string }) {
  return (
    <View style={[styles.rowIcon, { backgroundColor: `${tint}1F` }]}>
      <Ionicons name={icon} size={16} color={tint} />
    </View>
  );
}

function ToggleRow({
  icon,
  tint,
  title,
  subtitle,
  value,
  onChange,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const c = useTheme();
  return (
    <View style={styles.row}>
      <RowIcon icon={icon} tint={tint} />
      <View style={styles.flex}>
        <Txt variant="bodyStrong">{title}</Txt>
        <Txt variant="caption" color="textTertiary">
          {subtitle}
        </Txt>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: c.primary, false: c.border }} thumbColor="#FFFFFF" />
    </View>
  );
}

function LinkRow({
  icon,
  tint,
  title,
  detail,
  destructive,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  title: string;
  detail?: string;
  destructive?: boolean;
  onPress: () => void;
}) {
  const c = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <RowIcon icon={icon} tint={tint} />
      <Txt variant="bodyStrong" color={destructive ? 'deal' : 'text'} style={styles.flex}>
        {title}
      </Txt>
      {detail ? (
        <Txt variant="caption" color="textTertiary">
          {detail}
        </Txt>
      ) : null}
      <Ionicons name="chevron-forward" size={16} color={c.textTertiary} />
    </Pressable>
  );
}

function StatTile({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: number; label: string }) {
  const c = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Ionicons name={icon} size={16} color={c.primary} />
      <Txt variant="title">{value}</Txt>
      <Txt variant="caption" color="textTertiary">
        {label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  pressed: { opacity: 0.6 },
  scroll: { paddingTop: 8 },
  centered: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: 16,
    gap: 24,
  },
  title: { paddingTop: 8 },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  provider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: Radius.pill,
  },
  smallBtn: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: -8,
  },
  stat: {
    flex: 1,
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 2,
  },
  group: { gap: 8 },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  groupTitle: {
    letterSpacing: 0.8,
    fontSize: 11,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 60,
    paddingVertical: 8,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    marginLeft: 44,
  },
  segment: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  segmentItem: {
    flex: 1,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  themeCard: {
    flex: 1,
    padding: 8,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    gap: 8,
  },
  themeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingBottom: 4,
  },
  preview: {
    height: 72,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
  },
  previewHalf: {
    padding: 6,
    gap: 4,
    overflow: 'hidden',
  },
  previewFull: { flex: 1 },
  previewLeft: { flex: 1 },
  previewRight: { flex: 1 },
  previewBar: {
    height: 12,
    borderRadius: 4,
    borderWidth: 1,
  },
  previewGrid: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  previewCard: {
    flex: 1,
    borderRadius: 4,
    borderWidth: 1,
    padding: 4,
  },
  previewDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  storeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  storeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 40,
    paddingLeft: 8,
    paddingRight: 12,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  brandMark: {
    width: 14,
    height: 18,
  },
});
