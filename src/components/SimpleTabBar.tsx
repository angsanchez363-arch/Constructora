import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, spacing } from '../theme';

export interface TabItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface Props {
  items: TabItem[];
  active: string;
  onChange: (key: string) => void;
}

/** Barra inferior simple con estado local. En la semana 3 se reemplaza por React Navigation. */
export default function SimpleTabBar({ items, active, onChange }: Props) {
  return (
    <View style={styles.bar}>
      {items.map((it) => {
        const selected = it.key === active;
        return (
          <Pressable
            key={it.key}
            style={styles.item}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(it.key)}
          >
            <Ionicons name={it.icon} size={22} color={selected ? colors.accent : '#8C98A3'} />
            <Text style={[styles.label, selected && styles.labelActive]}>{it.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: colors.ink, borderTopWidth: 1, borderTopColor: '#2C3A46' },
  item: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, gap: 2 },
  label: { fontSize: 11, color: '#8C98A3', fontWeight: '600' },
  labelActive: { color: colors.accent },
});
