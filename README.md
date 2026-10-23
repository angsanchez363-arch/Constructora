# 🏗️ Constructora Cimientos — App móvil (React Native + Expo)

Proyecto del **Bootcamp React Native (bc-reactnative)** · Dominio asignado: **Constructora**
Entidades del dominio: `obras`, `materiales`.

Es **una sola app que evoluciona semana a semana**. Este entregable cubre las semanas 1 a 3.

## ▶️ Cómo ejecutarla

Requisitos: Node.js 22+, pnpm (o npm) y la app **Expo Go** en tu celular.

```bash
cd constructora-rn
pnpm install              # o: npm install
npm install --legacy-peer-deps
npx expo install --fix    # alinea las versiones de Expo/React Native con tu SDK
npx expo start            # escanea el QR con Expo Go (o presiona a / i / w)
```

Verificación de tipos: `pnpm typecheck`.

> Si el `install` falla por alguna versión, borra `node_modules` y ejecuta
> `npx expo install expo react react-native` seguido de `npx expo install --fix`.

## 🗓️ Qué se construyó cada semana

| Semana | Tema | Dónde está | Qué demuestra |
| --- | --- | --- | --- |
| 1 | Core Components y Flexbox | `screens/HomeScreen.tsx`, `screens/ContactoScreen.tsx`, `components/StatCard.tsx`, `components/Badge.tsx`, `components/ProgressBar.tsx` | `View`, `Text`, `Image`, `ScrollView`, `Pressable`, `Linking`, `StyleSheet`, `flexDirection`, `flex`, `gap`, `flexWrap`, `justifyContent`, `alignItems` |
| 2 | Listas, inputs y estilos | `screens/ObrasListScreen.tsx`, `screens/MaterialesListScreen.tsx`, `screens/MaterialFormScreen.tsx`, `components/SearchInput.tsx`, `components/Chip.tsx`, `components/FormField.tsx` | `FlatList`, `keyExtractor`, `ListEmptyComponent`, `RefreshControl`, `TextInput` controlado, `Switch`, filtros con `useState` + `useMemo`, validación de formularios, `KeyboardAvoidingView` |
| 3 | React Navigation 7 | `navigation/*`, `types/navigation.ts`, `screens/ObraDetailScreen.tsx`, `screens/MaterialDetailScreen.tsx` | Bottom Tabs + Native Stack anidados, params tipados, `CompositeScreenProps`, `setOptions`, navegación entre tabs (obra ↔ material), pantalla modal |

## 🧭 Mapa de navegación

```
RootTabs (Bottom Tabs)
├── InicioTab        → HomeScreen
├── ObrasTab         → ObrasStack
│     ├── ObrasList
│     └── ObraDetail      { obraId: string }
├── MaterialesTab    → MaterialesStack
│     ├── MaterialesList
│     ├── MaterialDetail  { materialId: string }
│     └── MaterialForm    (modal)
└── ContactoTab      → ContactoScreen
```

Desde una obra se puede saltar al detalle de un material (y viceversa) con
`navigation.navigate('MaterialesTab', { screen: 'MaterialDetail', params: { materialId } })`.

## 📁 Estructura

```
constructora-rn/
├── App.tsx                  # NavigationContainer + providers
├── index.ts                 # registerRootComponent
├── assets/                  # icono, splash y hero
└── src/
    ├── components/          # UI reutilizable
    ├── context/             # MaterialsContext (estado compartido simple)
    ├── data/                # datos de ejemplo (obras y materiales)
    ├── navigation/          # Tabs y Stacks
    ├── screens/             # pantallas
    ├── types/               # modelos y tipos de navegación
    ├── utils/               # formato de moneda y fechas
    └── theme.ts             # colores, espaciado y tipografía
```

## ✅ Checklist de entrega (adaptado a la rúbrica típica)

- [x] TypeScript estricto, sin `any`
- [x] Solo Core Components + React Navigation (sin librerías de UI de terceros)
- [x] Estilos con `StyleSheet`, sin estilos inline salvo valores dinámicos
- [x] Listas con `FlatList` y `keyExtractor`
- [x] Estados vacíos y de error (obra/material no encontrado)
- [x] Etiquetas de accesibilidad en botones e inputs
- [x] Todo el contenido refleja el dominio **constructora**

## 🔜 Próximas semanas (ideas de evolución)

- Reemplazar `MaterialsContext` por **Zustand**.
- Consumir una API REST con **TanStack Query**.
- Formularios con **React Hook Form + Zod**.
- Autenticación y persistencia con **SecureStore**.
