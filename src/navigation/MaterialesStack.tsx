import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable } from 'react-native';
import MaterialDetailScreen from '../screens/MaterialDetailScreen';
import MaterialFormScreen from '../screens/MaterialFormScreen';
import MaterialesListScreen from '../screens/MaterialesListScreen';
import { colors } from '../theme';
import type { MaterialesStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<MaterialesStackParamList>();

export default function MaterialesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.ink },
        headerTintColor: colors.surface,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="MaterialesList"
        component={MaterialesListScreen}
        options={({ navigation }) => ({
          title: 'Materiales',
          headerRight: () => (
            <Pressable
              onPress={() => navigation.navigate('MaterialForm')}
              accessibilityRole="button"
              accessibilityLabel="Agregar material"
              hitSlop={10}
            >
              <Ionicons name="add-circle" size={28} color={colors.accent} />
            </Pressable>
          ),
        })}
      />
      <Stack.Screen name="MaterialDetail" component={MaterialDetailScreen} options={{ title: 'Material' }} />
      <Stack.Screen
        name="MaterialForm"
        component={MaterialFormScreen}
        options={{ title: 'Nuevo material', presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
