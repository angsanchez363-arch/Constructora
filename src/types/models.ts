export type Categoria =
  | 'Cemento y concreto'
  | 'Acero'
  | 'Mampostería'
  | 'Acabados'
  | 'Eléctrico'
  | 'Hidráulico';

export interface Material {
  id: string;
  name: string;
  category: Categoria;
  unit: string;
  price: number;
  stock: number;
  minStock: number;
  emoji: string;
  description: string;
}

export type EstadoObra = 'planeacion' | 'en_curso' | 'finalizada';

export interface Obra {
  id: string;
  nombre: string;
  cliente: string;
  ubicacion: string;
  estado: EstadoObra;
  avance: number; // 0 - 100
  presupuesto: number;
  fechaInicio: string; // ISO yyyy-mm-dd
  descripcion: string;
  materialIds: string[];
}
