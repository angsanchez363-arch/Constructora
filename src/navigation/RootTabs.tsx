import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ContactoScreen from '../screens/ContactoScreen';
import HomeScreen from '../screens/HomeScreen';
import { colors } from '../theme';
import type { RootTabParamList } from '../types/navigation';
import MaterialesStack from './MaterialesStack';
import ObrasStack from './ObrasStack';

const Tab = createBottomTabNavigator<RootTabParamList>();

type IconName = keyof typeof Ionicons.glyphMap;

const ICONS: Record<keyof RootTabParamList, { active: IconName; inactive: IconName }> = {
  InicioTab: { active: 'home', inactive: 'home-outline' },
  ObrasTab: { active: 'business', inactive: 'business-outline' },
  MaterialesTab: { active: 'cube', inactive: 'cube-outline' },
  ContactoTab: { active: 'call', inactive: 'call-outline' },
};

export default function RootTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.ink },
        headerTintColor: colors.surface,
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: '#8C98A3',
        tabBarStyle: { backgroundColor: colors.ink, borderTopColor: '#2C3A46' },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={focused ? ICONS[route.name].active : ICONS[route.name].inactive} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="InicioTab" component={HomeScreen} options={{ title: 'Inicio', headerTitle: 'Constructora Cimientos' }} />
      <Tab.Screen name="ObrasTab" component={ObrasStack} options={{ title: 'Obras', headerShown: false }} />
      <Tab.Screen name="MaterialesTab" component={MaterialesStack} options={{ title: 'Materiales', headerShown: false }} />
      <Tab.Screen name="ContactoTab" component={ContactoScreen} options={{ title: 'Contacto', headerTitle: 'Contacto' }} />
    </Tab.Navigator>
  );
}
