import { StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../theme';
import type { EstadoObra } from '../types/models';

const CONFIG: Record<EstadoObra, { label: string; bg: string; fg: string }> = {
  planeacion: { label: 'En planeación', bg: '#DCE7F2', fg: colors.blueprint },
  en_curso: { label: 'En curso', bg: '#FBEFC2', fg: colors.accentInk },
  finalizada: { label: 'Finalizada', bg: '#D8EEE3', fg: colors.ok },
};

export default function Badge({ estado }: { estado: EstadoObra }) {
  const c = CONFIG[estado];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.fg }]}>{c.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  text: { fontSize: font.sm, fontWeight: '600' },
});
