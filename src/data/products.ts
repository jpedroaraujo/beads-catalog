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
      'Uma pequena flor colorida para acompanhar as chaves ou dar um toque especial à mochila. Exemplo fictício em Hama Beads; acabamento e cores seriam combinados no atendimento.',
    categoryId: 'chaveiros',
    images: [
      {
        src: '/images/flower.svg',
        alt: 'Ilustração demonstrativa de uma flor lilás em beads com miolo amarelo',
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
      'Um morango em tons de vermelho e verde, pensado para trazer cor aos pequenos detalhes do dia. Exemplo fictício: tamanho, argola e combinação de cores precisam ser confirmados.',
    categoryId: 'chaveiros',
    images: [
      {
        src: '/images/strawberry.svg',
        alt: 'Ilustração demonstrativa de um morango vermelho em beads',
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
      'Asas em cores suaves para decorar um cantinho especial. O valor inicial deste exemplo pode variar com tamanho e cores. A forma de fixação seria definida durante a conversa.',
    categoryId: 'decoracao',
    images: [
      {
        src: '/images/butterfly.svg',
        alt: 'Ilustração demonstrativa de uma borboleta em beads nas cores rosa e lilás',
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
    description:
      'Um coração com listras coloridas para transformar em um pequeno presente. Exemplo fictício de acessório; o formato final e as possibilidades de uso seriam combinados antes da encomenda.',
    categoryId: 'acessorios',
    images: [
      {
        src: '/images/heart.svg',
        alt: 'Ilustração demonstrativa de um coração em beads com listras coloridas',
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
    description:
      'Um personagem simpático para uma decoração divertida. Exemplo fictício com orçamento sob consulta, conforme tamanho e acabamento. Nenhum valor ou prazo final é prometido pelo catálogo.',
    categoryId: 'decoracao',
    images: [
      {
        src: '/images/ghost.svg',
        alt: 'Ilustração demonstrativa de um fantasminha branco em beads com bochechas rosadas',
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
    description:
      'Uma margarida de pétalas claras e miolo dourado. Exemplo fictício de decoração, temporariamente indisponível para demonstrar esse estado do catálogo.',
    categoryId: 'decoracao',
    images: [
      {
        src: '/images/daisy.svg',
        alt: 'Ilustração demonstrativa de uma margarida branca em beads com miolo amarelo',
      },
    ],
    pricing: { type: 'fixed', amountInCents: 2200 },
    dimensions: { width: 9, height: 9, unit: 'cm' },
    customizable: false,
    available: false,
  },
] as const satisfies readonly Product[];

validateCatalog(products, categories);
