import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import SimpleTabBar, { type TabItem } from './src/components/SimpleTabBar';
import { MaterialsProvider } from './src/context/MaterialsContext';
import ContactoScreen from './src/screens/ContactoScreen';
import HomeScreen from './src/screens/HomeScreen';
import MaterialFormScreen from './src/screens/MaterialFormScreen';
import MaterialesListScreen from './src/screens/MaterialesListScreen';
import ObrasListScreen from './src/screens/ObrasListScreen';
import { colors, font, spacing } from './src/theme';

const TABS: TabItem[] = [
  { key: 'inicio', label: 'Inicio', icon: 'home' },
  { key: 'obras', label: 'Obras', icon: 'business' },
  { key: 'materiales', label: 'Materiales', icon: 'cube' },
  { key: 'contacto', label: 'Contacto', icon: 'call' },
];

export default function App() {
  const [active, setActive] = useState('inicio');
  const [showForm, setShowForm] = useState(false);

  const changeTab = (key: string) => {
    setShowForm(false);
    setActive(key);
  };

  let screen;
  if (active === 'inicio') screen = <HomeScreen />;
  else if (active === 'obras') screen = <ObrasListScreen />;
  else if (active === 'materiales')
    screen = showForm ? <MaterialFormScreen onDone={() => setShowForm(false)} /> : <MaterialesListScreen onNew={() => setShowForm(true)} />;
  else screen = <ContactoScreen />;

  return (
    <SafeAreaProvider>
      <MaterialsProvider>
        <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
          <StatusBar style="light" />
          <View style={styles.header}>
            <Text style={styles.title}>Constructora Cimientos</Text>
          </View>
          <View style={styles.body}>{screen}</View>
          <SimpleTabBar items={TABS} active={active} onChange={changeTab} />
        </SafeAreaView>
      </MaterialsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { color: colors.surface, fontSize: font.lg, fontWeight: '700' },
  body: { flex: 1, backgroundColor: colors.bg },
});
