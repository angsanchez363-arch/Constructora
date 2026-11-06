// SEMANA 2: FlatList, filtros con estado local y ListEmptyComponent.
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import Chip from '../components/Chip';
import EmptyState from '../components/EmptyState';
import ObraCard from '../components/ObraCard';
import { useShallow } from 'zustand/react/shallow';
import { selectObrasFiltradas, useObrasStore, type FiltroObras } from '../stores/useObrasStore';
import { colors, spacing } from '../theme';
import type { ObrasStackScreenProps } from '../types/navigation';

const FILTROS: { value: FiltroObras; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'en_curso', label: 'En curso' },
  { value: 'planeacion', label: 'En planeación' },
  { value: 'finalizada', label: 'Finalizadas' },
];

export default function ObrasListScreen({ navigation }: ObrasStackScreenProps<'ObrasList'>) {
  // SEMANA 4: el filtro vive en el store, así se conserva al navegar entre pantallas
  const filtro = useObrasStore((s) => s.filtro);
  const setFiltro = useObrasStore((s) => s.setFiltro);
  const data = useObrasStore(useShallow(selectObrasFiltradas));

  return (
    <View style={styles.screen}>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {FILTROS.map((f) => (
            <Chip key={f.value} label={f.label} selected={filtro === f.value} onPress={() => setFiltro(f.value)} />
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ObraCard obra={item} onPress={() => navigation.navigate('ObraDetail', { obraId: item.id })} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState title="Sin obras" message="No hay obras con este estado. Prueba con otro filtro." />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  chips: { gap: spacing.sm, padding: spacing.lg },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },
});
