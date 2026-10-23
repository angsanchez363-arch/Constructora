// SEMANA 3: detalle con params tipados + setOptions para el título del header.
import { useLayoutEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import EmptyState from '../components/EmptyState';
import { useMaterials } from '../context/MaterialsContext';
import { OBRAS } from '../data/obras';
import { colors, font, radius, spacing } from '../theme';
import type { MaterialesStackScreenProps } from '../types/navigation';
import { formatCOP } from '../utils/format';

export default function MaterialDetailScreen({ navigation, route }: MaterialesStackScreenProps<'MaterialDetail'>) {
  const { materialId } = route.params;
  const { materials } = useMaterials();
  const material = materials.find((m) => m.id === materialId);

  useLayoutEffect(() => {
    navigation.setOptions({ title: material ? material.name : 'Material no encontrado' });
  }, [navigation, material]);

  if (!material) {
    return <EmptyState icon="alert-circle-outline" title="Material no encontrado" message="Vuelve a la lista e inténtalo de nuevo." />;
  }

  const agotado = material.stock === 0;
  const bajo = !agotado && material.stock <= material.minStock;
  const obrasQueLoUsan = OBRAS.filter((o) => o.materialIds.includes(material.id));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{material.emoji}</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>{material.name}</Text>
          <Text style={styles.category}>{material.category}</Text>
        </View>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.price}>{formatCOP(material.price)}</Text>
        <Text style={styles.unit}>por {material.unit}</Text>
      </View>

      <View style={[styles.stockBox, (agotado || bajo) && styles.stockBoxWarn]}>
        <Text style={[styles.stockText, (agotado || bajo) && styles.stockTextWarn]}>
          {agotado ? 'Agotado: reponer cuanto antes' : bajo ? `Stock bajo: ${material.stock} (mínimo ${material.minStock})` : `${material.stock} disponibles`}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Descripción</Text>
      <Text style={styles.description}>{material.description || 'Sin descripción.'}</Text>

      <Text style={styles.sectionTitle}>Obras que lo usan</Text>
      {obrasQueLoUsan.length === 0 ? (
        <Text style={styles.description}>Todavía no está asignado a ninguna obra.</Text>
      ) : (
        <View style={styles.card}>
          {obrasQueLoUsan.map((o, i) => (
            <Pressable
              key={o.id}
              accessibilityRole="button"
              style={[styles.obraRow, i === obrasQueLoUsan.length - 1 && { borderBottomWidth: 0 }]}
              onPress={() => navigation.navigate('ObrasTab', { screen: 'ObraDetail', params: { obraId: o.id } })}
            >
              <Text style={styles.obraName}>{o.nombre}</Text>
              <Text style={styles.obraPlace}>{o.ubicacion}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  emoji: { fontSize: 44 },
  headerText: { flex: 1 },
  title: { fontSize: font.xl, fontWeight: '800', color: colors.ink },
  category: { fontSize: font.md, color: colors.muted },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  price: { fontSize: font.xxl, fontWeight: '800', color: colors.blueprint },
  unit: { fontSize: font.md, color: colors.muted },
  stockBox: { backgroundColor: '#D8EEE3', borderRadius: radius.md, padding: spacing.md },
  stockBoxWarn: { backgroundColor: '#F6DDD5' },
  stockText: { fontSize: font.md, fontWeight: '700', color: colors.ok },
  stockTextWarn: { color: colors.warn },
  sectionTitle: { fontSize: font.lg, fontWeight: '700', color: colors.ink, marginTop: spacing.sm },
  description: { fontSize: font.md, color: colors.muted, lineHeight: 22 },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.lg },
  obraRow: { paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  obraName: { fontSize: font.md, fontWeight: '700', color: colors.ink },
  obraPlace: { fontSize: font.sm, color: colors.muted },
});
