import type { Product } from '../types/product';
import { validateCatalog } from '../lib/catalog';
import { categories } from './categories';

// EXEMPLOS FICTÍCIOS: substituir peças, preços e ilustrações antes de publicar.
export const products = [
  {
    id: 'flor',
    slug: 'flor-de-bolso',
    name: 'Flor de bolso',
    description:
      'Uma pequena flor colorida para acompanhar as chaves ou dar um toque especial à mochila.',
    categoryId: 'chaveiros',
    images: [
      {
        src: '/images/flower.svg',
        alt: 'Ilustração de uma flor lilás em beads com miolo amarelo',
      },
    ],
    pricing: { type: 'fixed', amountInCents: 1500 },
    dimensions: { width: 6, height: 6, unit: 'cm' },
    customizable: true,
    available: true,
  },
  {
    id: 'morango',
    slug: 'moranguinho',
    name: 'Moranguinho',
    description:
      'Um morango em tons de vermelho e verde, pensado para trazer cor aos pequenos detalhes do dia.',
    categoryId: 'chaveiros',
    images: [
      {
        src: '/images/strawberry.svg',
        alt: 'Ilustração de um morango vermelho em beads',
      },
    ],
    pricing: { type: 'fixed', amountInCents: 1800 },
    dimensions: { width: 5, height: 7, unit: 'cm' },
    customizable: true,
    available: true,
  },
  {
    id: 'borboleta',
    slug: 'borboleta-colorida',
    name: 'Borboleta colorida',
    description:
      'Uma borboleta com asas em cores suaves para decorar um cantinho especial.',
    categoryId: 'decoracao',
    images: [
      {
        src: '/images/butterfly.svg',
        alt: 'Ilustração de uma borboleta em beads nas cores rosa e lilás',
      },
    ],
    pricing: { type: 'starting_at', amountInCents: 2500 },
    dimensions: { width: 10, height: 8, unit: 'cm' },
    customizable: true,
    available: true,
  },
  {
    id: 'coracao',
    slug: 'coracao-em-cores',
    name: 'Coração em cores',
    description: 'Um coração com listras coloridas para presentear.',
    categoryId: 'acessorios',
    images: [
      {
        src: '/images/heart.svg',
        alt: 'Ilustração de um coração em beads com listras coloridas',
      },
    ],
    pricing: { type: 'starting_at', amountInCents: 2000 },
    dimensions: { width: 6, height: 6, unit: 'cm' },
    customizable: true,
    available: true,
  },
  {
    id: 'fantasminha',
    slug: 'fantasminha-gentil',
    name: 'Fantasminha gentil',
    description: 'Um personagem simpático para uma decoração divertida.',
    categoryId: 'decoracao',
    images: [
      {
        src: '/images/ghost.svg',
        alt: 'Ilustração de um fantasminha branco em beads com bochechas rosadas',
      },
    ],
    pricing: { type: 'quote' },
    customizable: false,
    available: true,
  },
  {
    id: 'margarida',
    slug: 'margarida-solar',
    name: 'Margarida solar',
    description: 'Uma margarida de pétalas claras e miolo dourado.',
    categoryId: 'decoracao',
    images: [
      {
        src: '/images/daisy.svg',
        alt: 'Ilustração de uma margarida branca em beads com miolo amarelo',
      },
    ],
    pricing: { type: 'fixed', amountInCents: 2200 },
    dimensions: { width: 9, height: 9, unit: 'cm' },
    customizable: false,
    available: false,
  },
] as const satisfies readonly Product[];

validateCatalog(products, categories);
