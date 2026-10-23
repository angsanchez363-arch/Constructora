import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import SimpleTabBar, { type TabItem } from './src/components/SimpleTabBar';
import ContactoScreen from './src/screens/ContactoScreen';
import HomeScreen from './src/screens/HomeScreen';
import { colors, font, spacing } from './src/theme';

const TABS: TabItem[] = [
  { key: 'inicio', label: 'Inicio', icon: 'home' },
  { key: 'contacto', label: 'Contacto', icon: 'call' },
];

export default function App() {
  const [active, setActive] = useState('inicio');

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Text style={styles.title}>Constructora Cimientos</Text>
        </View>
        <View style={styles.body}>{active === 'inicio' ? <HomeScreen /> : <ContactoScreen />}</View>
        <SimpleTabBar items={TABS} active={active} onChange={setActive} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { color: colors.surface, fontSize: font.lg, fontWeight: '700' },
  body: { flex: 1, backgroundColor: colors.bg },
});
