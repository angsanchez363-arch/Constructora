// SEMANA 2: FlatList, TextInput (búsqueda), Switch, chips de filtro y pull-to-refresh.
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Chip from '../components/Chip';
import EmptyState from '../components/EmptyState';
import MaterialCard from '../components/MaterialCard';
import SearchInput from '../components/SearchInput';
import { useMaterials } from '../context/MaterialsContext';
import { CATEGORIAS } from '../data/materials';
import { colors, font, radius, spacing } from '../theme';
import type { Categoria } from '../types/models';

type Filtro = 'Todos' | Categoria;

export default function MaterialesListScreen({ onNew }: { onNew: () => void }) {
  const { materials } = useMaterials();
  const [query, setQuery] = useState('');
  const [categoria, setCategoria] = useState<Filtro>('Todos');
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    return materials.filter((m) => {
      if (categoria !== 'Todos' && m.category !== categoria) return false;
      if (soloDisponibles && m.stock === 0) return false;
      if (q && !m.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [materials, query, categoria, soloDisponibles]);

  // Simula una recarga (en semanas siguientes será una petición real a la API)
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  return (
    <View style={styles.screen}>
      <View style={styles.filters}>
        <Pressable style={styles.newButton} onPress={onNew} accessibilityRole="button">
          <Text style={styles.newButtonText}>+ Agregar material</Text>
        </Pressable>
        <SearchInput value={query} onChangeText={setQuery} placeholder="Buscar material" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {(['Todos', ...CATEGORIAS] as Filtro[]).map((c) => (
            <Chip key={c} label={c} selected={categoria === c} onPress={() => setCategoria(c)} />
          ))}
        </ScrollView>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Solo con existencias</Text>
          <Switch
            value={soloDisponibles}
            onValueChange={setSoloDisponibles}
            trackColor={{ false: colors.line, true: colors.accent }}
            thumbColor={colors.surface}
          />
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MaterialCard material={item} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <EmptyState icon="search-outline" title="Sin resultados" message="Cambia la búsqueda o quita algún filtro." />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  filters: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.md },
  newButton: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center' },
  newButtonText: { fontSize: font.md, fontWeight: '800', color: colors.accentInk },
  chips: { gap: spacing.sm },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchLabel: { fontSize: font.md, color: colors.ink },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },
});
