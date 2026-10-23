import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../theme';
import type { Obra } from '../types/models';
import Badge from './Badge';
import ProgressBar from './ProgressBar';

interface Props {
  obra: Obra;
  onPress?: () => void;
}

export default function ObraCard({ obra, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Obra ${obra.nombre}, avance ${obra.avance} por ciento`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        <Text style={styles.title} numberOfLines={2}>{obra.nombre}</Text>
        <Badge estado={obra.estado} />
      </View>
      <Text style={styles.meta}>{obra.ubicacion}</Text>
      <View style={styles.progressRow}>
        <View style={styles.progressBar}>
          <ProgressBar value={obra.avance} />
        </View>
        <Text style={styles.pct}>{obra.avance}%</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, gap: spacing.sm },
  pressed: { opacity: 0.85 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md },
  title: { flex: 1, fontSize: font.lg, fontWeight: '700', color: colors.ink },
  meta: { fontSize: font.md, color: colors.muted },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  progressBar: { flex: 1 },
  pct: { fontSize: font.sm, fontWeight: '700', color: colors.ink, width: 40, textAlign: 'right' },
});
