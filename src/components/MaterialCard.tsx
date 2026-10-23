import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../theme';
import type { Material } from '../types/models';
import { formatCOP } from '../utils/format';

interface Props {
  material: Material;
  onPress: () => void;
}

export default function MaterialCard({ material, onPress }: Props) {
  const agotado = material.stock === 0;
  const bajo = !agotado && material.stock <= material.minStock;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${material.name}, ${formatCOP(material.price)} por ${material.unit}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.iconBox}>
        <Text style={styles.emoji}>{material.emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{material.name}</Text>
        <Text style={styles.category}>{material.category}</Text>
        <Text style={[styles.stock, (agotado || bajo) && styles.stockWarn]}>
          {agotado ? 'Agotado' : bajo ? `Stock bajo: ${material.stock}` : `${material.stock} en stock`}
        </Text>
      </View>
      <View style={styles.priceBox}>
        <Text style={styles.price}>{formatCOP(material.price)}</Text>
        <Text style={styles.unit}>{material.unit}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  pressed: { opacity: 0.85 },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 26 },
  info: { flex: 1, gap: 2 },
  name: { fontSize: font.md, fontWeight: '700', color: colors.ink },
  category: { fontSize: font.sm, color: colors.muted },
  stock: { fontSize: font.sm, color: colors.ok, fontWeight: '600' },
  stockWarn: { color: colors.warn },
  priceBox: { alignItems: 'flex-end', maxWidth: 110 },
  price: { fontSize: font.md, fontWeight: '700', color: colors.ink },
  unit: { fontSize: 11, color: colors.muted, textAlign: 'right' },
});
