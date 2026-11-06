// SEMANA 4: tercer store. Materiales marcados como favoritos (persistido).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface FavoritosState {
  materialIds: string[];
  toggleFavorito: (materialId: string) => void;
}

export const useFavoritosStore = create<FavoritosState>()(
  persist(
    (set) => ({
      materialIds: [],
      toggleFavorito: (materialId) =>
        set((state) => ({
          materialIds: state.materialIds.includes(materialId)
            ? state.materialIds.filter((id) => id !== materialId)
            : [...state.materialIds, materialId],
        })),
    }),
    {
      name: 'constructora-favoritos',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
