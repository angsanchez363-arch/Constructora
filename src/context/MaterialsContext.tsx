import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { MATERIALS } from '../data/materials';
import type { Material } from '../types/models';

interface MaterialsContextValue {
  materials: Material[];
  addMaterial: (data: Omit<Material, 'id' | 'emoji' | 'minStock'>) => Material;
}

const MaterialsContext = createContext<MaterialsContextValue | undefined>(undefined);

/**
 * Estado compartido y simple (sin librerías externas) para que los materiales
 * creados en el formulario aparezcan en la lista y en el detalle.
 * En semanas posteriores se reemplaza por Zustand.
 */
export function MaterialsProvider({ children }: { children: ReactNode }) {
  const [materials, setMaterials] = useState<Material[]>(MATERIALS);

  const addMaterial = useCallback((data: Omit<Material, 'id' | 'emoji' | 'minStock'>) => {
    const nuevo: Material = { ...data, id: `mat-${Date.now()}`, emoji: '📦', minStock: 10 };
    setMaterials((prev) => [nuevo, ...prev]);
    return nuevo;
  }, []);

  const value = useMemo(() => ({ materials, addMaterial }), [materials, addMaterial]);
  return <MaterialsContext.Provider value={value}>{children}</MaterialsContext.Provider>;
}

export function useMaterials(): MaterialsContextValue {
  const ctx = useContext(MaterialsContext);
  if (!ctx) throw new Error('useMaterials debe usarse dentro de MaterialsProvider');
  return ctx;
}
