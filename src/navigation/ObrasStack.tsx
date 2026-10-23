import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ObraDetailScreen from '../screens/ObraDetailScreen';
import ObrasListScreen from '../screens/ObrasListScreen';
import { colors } from '../theme';
import type { ObrasStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<ObrasStackParamList>();

export default function ObrasStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.ink },
        headerTintColor: colors.surface,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="ObrasList" component={ObrasListScreen} options={{ title: 'Obras' }} />
      <Stack.Screen name="ObraDetail" component={ObraDetailScreen} options={{ title: 'Detalle de obra' }} />
    </Stack.Navigator>
  );
}
