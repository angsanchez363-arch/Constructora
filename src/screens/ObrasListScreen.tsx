// SEMANA 2: FlatList, filtros con estado local y ListEmptyComponent.
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import Chip from '../components/Chip';
import EmptyState from '../components/EmptyState';
import ObraCard from '../components/ObraCard';
import { OBRAS } from '../data/obras';
import { colors, spacing } from '../theme';
import type { EstadoObra } from '../types/models';
import type { ObrasStackScreenProps } from '../types/navigation';

type Filtro = 'todas' | EstadoObra;

const FILTROS: { value: Filtro; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'en_curso', label: 'En curso' },
  { value: 'planeacion', label: 'En planeación' },
  { value: 'finalizada', label: 'Finalizadas' },
];

export default function ObrasListScreen({ navigation }: ObrasStackScreenProps<'ObrasList'>) {
  const [filtro, setFiltro] = useState<Filtro>('todas');

  const data = useMemo(() => (filtro === 'todas' ? OBRAS : OBRAS.filter((o) => o.estado === filtro)), [filtro]);

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
