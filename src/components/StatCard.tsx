import { StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../theme';

interface Props {
  label: string;
  value: string;
  warn?: boolean;
}

export default function StatCard({ label, value, warn = false }: Props) {
  return (
    <View style={[styles.card, warn && styles.cardWarn]}>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  cardWarn: { borderLeftColor: colors.warn },
  value: { fontSize: font.xl, fontWeight: '700', color: colors.ink },
  label: { fontSize: font.sm, color: colors.muted, marginTop: spacing.xs },
});
