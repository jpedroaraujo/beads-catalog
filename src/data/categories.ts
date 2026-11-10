import type { Category } from '../types/category';

export const categories = [
  { id: 'chaveiros', name: 'Chaveiros' },
  { id: 'decoracao', name: 'Decoração' },
  { id: 'acessorios', name: 'Acessórios' },
  { id: 'marcadores', name: 'Marcadores' },
] as const satisfies readonly Category[];
