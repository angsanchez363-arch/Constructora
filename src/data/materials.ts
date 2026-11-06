import type { Material } from '../types/models';

export const MATERIALS: Material[] = [
  { id: 'mat-01', name: 'Cemento gris', category: 'Cemento y concreto', unit: 'bulto 50 kg', price: 32500, stock: 480, minStock: 100, emoji: '🧱', description: 'Cemento Portland de uso general para concreto, pañetes y mortero de pega.' },
  { id: 'mat-02', name: 'Concreto premezclado 3000 psi', category: 'Cemento y concreto', unit: 'm³', price: 385000, stock: 24, minStock: 30, emoji: '🚚', description: 'Concreto de 3000 psi para placas, columnas y vigas. Entrega en mixer.' },
  { id: 'mat-03', name: 'Varilla corrugada 1/2"', category: 'Acero', unit: 'barra 6 m', price: 38900, stock: 920, minStock: 200, emoji: '🔩', description: 'Acero de refuerzo corrugado de 1/2 pulgada, norma NTC 2289.' },
  { id: 'mat-04', name: 'Malla electrosoldada', category: 'Acero', unit: 'panel 6x2.35 m', price: 214000, stock: 36, minStock: 20, emoji: '🕸️', description: 'Malla para placas de contrapiso y losas de entrepiso.' },
  { id: 'mat-05', name: 'Ladrillo tolete', category: 'Mampostería', unit: 'millar', price: 980000, stock: 18, minStock: 10, emoji: '🧱', description: 'Ladrillo tolete macizo para muros de fachada y divisorios.' },
  { id: 'mat-06', name: 'Bloque de concreto No. 5', category: 'Mampostería', unit: 'unidad', price: 2650, stock: 5400, minStock: 1000, emoji: '⬜', description: 'Bloque estructural de concreto para muros de carga.' },
  { id: 'mat-07', name: 'Pintura vinilo tipo 1', category: 'Acabados', unit: 'cuñete 5 gal', price: 289000, stock: 14, minStock: 15, emoji: '🎨', description: 'Pintura lavable para interiores, rendimiento aproximado de 40 m² por galón.' },
  { id: 'mat-08', name: 'Porcelanato 60x60', category: 'Acabados', unit: 'm²', price: 56900, stock: 260, minStock: 80, emoji: '🔲', description: 'Piso en porcelanato mate para zonas sociales.' },
  { id: 'mat-09', name: 'Cable THHN #12', category: 'Eléctrico', unit: 'rollo 100 m', price: 198000, stock: 40, minStock: 12, emoji: '🔌', description: 'Cable de cobre para instalaciones eléctricas residenciales.' },
  { id: 'mat-10', name: 'Tubo conduit PVC 3/4"', category: 'Eléctrico', unit: 'tramo 3 m', price: 7800, stock: 0, minStock: 50, emoji: '🪈', description: 'Tubería para canalizar cableado en muros y placas.' },
  { id: 'mat-11', name: 'Tubo PVC presión 1/2"', category: 'Hidráulico', unit: 'tramo 6 m', price: 21500, stock: 150, minStock: 40, emoji: '🚰', description: 'Tubería para redes de agua potable fría.' },
  { id: 'mat-12', name: 'Tubo sanitario 4"', category: 'Hidráulico', unit: 'tramo 3 m', price: 46800, stock: 62, minStock: 25, emoji: '🛠️', description: 'Tubería sanitaria para bajantes y desagües.' },
];

export const CATEGORIAS = [
  'Cemento y concreto',
  'Acero',
  'Mampostería',
  'Acabados',
  'Eléctrico',
  'Hidráulico',
] as const;
