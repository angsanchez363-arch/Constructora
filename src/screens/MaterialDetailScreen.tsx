// SEMANA 3: detalle con params tipados + setOptions para el título del header.
import { useLayoutEffect } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import EmptyState from '../components/EmptyState';
import { useFavoritosStore } from '../stores/useFavoritosStore';
import { useMaterialsStore } from '../stores/useMaterialsStore';
import { useObrasStore } from '../stores/useObrasStore';
import { colors, font, radius, spacing } from '../theme';
import type { MaterialesStackScreenProps } from '../types/navigation';
import { formatCOP } from '../utils/format';

export default function MaterialDetailScreen({ navigation, route }: MaterialesStackScreenProps<'MaterialDetail'>) {
  const { materialId } = route.params;
  const material = useMaterialsStore((s) => s.materials.find((m) => m.id === materialId));
  const adjustStock = useMaterialsStore((s) => s.adjustStock);
  const removeMaterial = useMaterialsStore((s) => s.removeMaterial);
  const obras = useObrasStore((s) => s.obras);
  const esFavorito = useFavoritosStore((s) => s.materialIds.includes(materialId));
  const toggleFavorito = useFavoritosStore((s) => s.toggleFavorito);

  useLayoutEffect(() => {
    navigation.setOptions({ title: material ? material.name : 'Material no encontrado' });
  }, [navigation, material]);

  if (!material) {
    return <EmptyState icon="alert-circle-outline" title="Material no encontrado" message="Vuelve a la lista e inténtalo de nuevo." />;
  }

  const agotado = material.stock === 0;
  const bajo = !agotado && material.stock <= material.minStock;
  const obrasQueLoUsan = obras.filter((o) => o.materialIds.includes(material.id));

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

      <View style={styles.actionsRow}>
        <Pressable style={styles.stepBtn} accessibilityRole="button" accessibilityLabel="Restar 10 al stock" onPress={() => adjustStock(material.id, -10)}>
          <Text style={styles.stepText}>−10</Text>
        </Pressable>
        <Pressable style={styles.stepBtn} accessibilityRole="button" accessibilityLabel="Sumar 10 al stock" onPress={() => adjustStock(material.id, 10)}>
          <Text style={styles.stepText}>+10</Text>
        </Pressable>
        <Pressable
          style={styles.stepBtn}
          accessibilityRole="button"
          accessibilityLabel={esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          onPress={() => toggleFavorito(material.id)}
        >
          <Text style={styles.stepText}>{esFavorito ? '★ Favorito' : '☆ Favorito'}</Text>
        </Pressable>
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

      <Pressable
        style={styles.deleteBtn}
        accessibilityRole="button"
        accessibilityLabel="Eliminar material"
        onPress={() =>
          Alert.alert('Eliminar material', `¿Eliminar "${material.name}" del catálogo?`, [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Eliminar',
              style: 'destructive',
              onPress: () => {
                removeMaterial(material.id);
                navigation.goBack();
              },
            },
          ])
        }
      >
        <Text style={styles.deleteText}>Eliminar material</Text>
      </Pressable>
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
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  stepBtn: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.sm, paddingVertical: spacing.md, alignItems: 'center' },
  stepText: { fontSize: font.md, fontWeight: '800', color: colors.blueprint },
  deleteBtn: { marginTop: spacing.lg, borderWidth: 1, borderColor: colors.warn, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center' },
  deleteText: { fontSize: font.md, fontWeight: '700', color: colors.warn },
  sectionTitle: { fontSize: font.lg, fontWeight: '700', color: colors.ink, marginTop: spacing.sm },
  description: { fontSize: font.md, color: colors.muted, lineHeight: 22 },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.lg },
  obraRow: { paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  obraName: { fontSize: font.md, fontWeight: '700', color: colors.ink },
  obraPlace: { fontSize: font.sm, color: colors.muted },
});
