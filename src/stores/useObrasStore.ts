// SEMANA 4: segundo store. Guarda las obras y el filtro de estado seleccionado.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { OBRAS } from '../data/obras';
import type { EstadoObra, Obra } from '../types/models';

export type FiltroObras = 'todas' | EstadoObra;

interface ObrasState {
  obras: Obra[];
  filtro: FiltroObras;
  setFiltro: (filtro: FiltroObras) => void;
  /** Cambia el avance (0-100) y actualiza el estado de la obra según el valor. */
  setAvance: (id: string, avance: number) => void;
  resetObras: () => void;
}

function estadoPorAvance(avance: number): EstadoObra {
  if (avance >= 100) return 'finalizada';
  if (avance > 0) return 'en_curso';
  return 'planeacion';
}

export const useObrasStore = create<ObrasState>()(
  persist(
    (set) => ({
      obras: OBRAS,
      filtro: 'todas',

      setFiltro: (filtro) => set({ filtro }),

      setAvance: (id, avance) => {
        const valor = Math.min(100, Math.max(0, Math.round(avance)));
        set((state) => ({
          obras: state.obras.map((o) =>
            o.id === id ? { ...o, avance: valor, estado: estadoPorAvance(valor) } : o,
          ),
        }));
      },

      resetObras: () => set({ obras: OBRAS, filtro: 'todas' }),
    }),
    {
      name: 'constructora-obras',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      // El filtro es estado de UI: se mantiene entre pantallas pero no se guarda en disco
      partialize: (state) => ({ obras: state.obras }),
    },
  ),
);

export const selectObrasEnCurso = (s: ObrasState): Obra[] =>
  s.obras.filter((o) => o.estado === 'en_curso');

export const selectObrasFiltradas = (s: ObrasState): Obra[] =>
  s.filtro === 'todas' ? s.obras : s.obras.filter((o) => o.estado === s.filtro);
