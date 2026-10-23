import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialsProvider } from './src/context/MaterialsContext';
import RootTabs from './src/navigation/RootTabs';

export default function App() {
  return (
    <SafeAreaProvider>
      <MaterialsProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <RootTabs />
        </NavigationContainer>
      </MaterialsProvider>
    </SafeAreaProvider>
  );
}
