// SEMANA 3: pantalla de detalle con parámetros tipados y navegación entre tabs.
import { useLayoutEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import ProgressBar from '../components/ProgressBar';
import { useMaterials } from '../context/MaterialsContext';
import { OBRAS } from '../data/obras';
import { colors, font, radius, spacing } from '../theme';
import type { ObrasStackScreenProps } from '../types/navigation';
import { formatCOP, formatDate } from '../utils/format';

export default function ObraDetailScreen({ navigation, route }: ObrasStackScreenProps<'ObraDetail'>) {
  const { obraId } = route.params;
  const { materials } = useMaterials();
  const obra = OBRAS.find((o) => o.id === obraId);

  useLayoutEffect(() => {
    navigation.setOptions({ title: obra ? obra.nombre : 'Obra no encontrada' });
  }, [navigation, obra]);

  if (!obra) {
    return <EmptyState icon="alert-circle-outline" title="Obra no encontrada" message="Vuelve a la lista e inténtalo de nuevo." />;
  }

  const usados = materials.filter((m) => obra.materialIds.includes(m.id));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Badge estado={obra.estado} />
      <Text style={styles.title}>{obra.nombre}</Text>
      <Text style={styles.description}>{obra.descripcion}</Text>

      <View style={styles.card}>
        <View style={styles.progressHeader}>
          <Text style={styles.label}>Avance de obra</Text>
          <Text style={styles.progressValue}>{obra.avance}%</Text>
        </View>
        <ProgressBar value={obra.avance} />
      </View>

      <View style={styles.card}>
        <Dato label="Cliente" value={obra.cliente} />
        <Dato label="Ubicación" value={obra.ubicacion} />
        <Dato label="Fecha de inicio" value={formatDate(obra.fechaInicio)} />
        <Dato label="Presupuesto" value={formatCOP(obra.presupuesto)} last />
      </View>

      <Text style={styles.sectionTitle}>Materiales de esta obra</Text>
      <View style={styles.card}>
        {usados.map((m, i) => (
          <Pressable
            key={m.id}
            accessibilityRole="button"
            onPress={() => navigation.navigate('MaterialesTab', { screen: 'MaterialDetail', params: { materialId: m.id } })}
            style={[styles.materialRow, i === usados.length - 1 && styles.noBorder]}
          >
            <Text style={styles.materialName}>{m.emoji} {m.name}</Text>
            <Text style={styles.materialPrice}>{formatCOP(m.price)}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

function Dato({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.datoRow, last && styles.noBorder]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.datoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  title: { fontSize: font.xl, fontWeight: '800', color: colors.ink },
  description: { fontSize: font.md, color: colors.muted, lineHeight: 22 },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  progressValue: { fontSize: font.md, fontWeight: '800', color: colors.ink },
  label: { fontSize: font.sm, color: colors.muted },
  datoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  datoValue: { flex: 1, textAlign: 'right', fontSize: font.md, fontWeight: '600', color: colors.ink },
  noBorder: { borderBottomWidth: 0 },
  sectionTitle: { fontSize: font.lg, fontWeight: '700', color: colors.ink, marginTop: spacing.sm },
  materialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  materialName: { flex: 1, fontSize: font.md, color: colors.ink },
  materialPrice: { fontSize: font.md, fontWeight: '700', color: colors.blueprint },
});
