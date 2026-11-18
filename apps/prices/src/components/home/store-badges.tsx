import { StyleSheet, View } from 'react-native';

import { STORE_BY_ID, type StoreId } from '@/data/catalog';
import { useTheme } from '@/hooks/use-theme';

import { Txt } from './primitives';

/** Overlapping store "logos" — shows where a product is available. */
export function StoreStack({ storeIds, max = 3, size = 22 }: { storeIds: StoreId[]; max?: number; size?: number }) {
  const c = useTheme();
  const visible = storeIds.slice(0, max);
  const extra = storeIds.length - visible.length;

  return (
    <View style={styles.row}>
      {visible.map((id, i) => (
        <StoreLogo key={id} id={id} size={size} style={{ marginLeft: i === 0 ? 0 : -size / 3 }} />
      ))}
      {extra > 0 && (
        <View
          style={[
            styles.logo,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              marginLeft: -size / 3,
              backgroundColor: c.surfaceMuted,
              borderColor: c.surface,
            },
          ]}>
          <Txt variant="captionStrong" color="textSecondary" style={{ fontSize: size * 0.4, lineHeight: size * 0.5 }}>
            +{extra}
          </Txt>
        </View>
      )}
    </View>
  );
}

export function StoreLogo({
  id,
  size = 22,
  style,
}: {
  id: StoreId;
  size?: number;
  style?: object;
}) {
  const c = useTheme();
  const store = STORE_BY_ID[id];
  return (
    <View
      style={[
        styles.logo,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: store.color,
          borderColor: c.surface,
        },
        style,
      ]}>
      <Txt
        variant="captionStrong"
        style={{ color: '#FFFFFF', fontSize: size * 0.36, lineHeight: size * 0.5, letterSpacing: -0.2 }}>
        {store.initials}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
});
