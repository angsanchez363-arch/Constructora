// SEMANA 4: store global de materiales con Zustand + persistencia en AsyncStorage.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MATERIALS } from '../data/materials';
import type { Material } from '../types/models';

export type NuevoMaterial = Omit<Material, 'id' | 'emoji' | 'minStock'>;

interface MaterialsState {
  materials: Material[];
  addMaterial: (data: NuevoMaterial) => Material;
  adjustStock: (id: string, delta: number) => void;
  removeMaterial: (id: string) => void;
  resetMaterials: () => void;
}

export const useMaterialsStore = create<MaterialsState>()(
  persist(
    (set) => ({
      materials: MATERIALS,

      addMaterial: (data) => {
        const nuevo: Material = { ...data, id: `mat-${Date.now()}`, emoji: '📦', minStock: 10 };
        set((state) => ({ materials: [nuevo, ...state.materials] }));
        return nuevo;
      },

      // El stock nunca baja de 0
      adjustStock: (id, delta) =>
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === id ? { ...m, stock: Math.max(0, m.stock + delta) } : m,
          ),
        })),

      removeMaterial: (id) =>
        set((state) => ({ materials: state.materials.filter((m) => m.id !== id) })),

      resetMaterials: () => set({ materials: MATERIALS }),
    }),
    {
      name: 'constructora-materials',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      // Solo se persisten los datos, no las funciones
      partialize: (state) => ({ materials: state.materials }),
    },
  ),
);

// Selectores reutilizables (se usan con useShallow cuando devuelven arrays nuevos)
export const selectStockBajo = (s: MaterialsState): Material[] =>
  s.materials.filter((m) => m.stock <= m.minStock);

export const selectValorInventario = (s: MaterialsState): number =>
  s.materials.reduce((sum, m) => sum + m.price * m.stock, 0);
