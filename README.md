# Catálogo digital de Hama Beads

SPA estática para apresentar artes artesanais, consultar preços e iniciar encomendas pelo WhatsApp. Não possui carrinho, checkout ou backend. Nome, identidade e conteúdo visual são provisórios; os produtos e preços incluídos são exemplos fictícios, identificados na interface.

## Stack e requisitos

React, Vite, TypeScript estrito, Tailwind CSS com plugin Vite, Lucide React, Vitest, React Testing Library, ESLint e Prettier. Node.js 24 LTS e npm 11 (ver `.nvmrc`); dependências fixadas pelo `package-lock.json`. Nenhum componente pronto exige shadcn/ui nesta etapa.

## Instalação e comandos

```sh
npm ci
npm run dev
npm run typecheck
npm run lint
npm test
npm run test:watch
npm run format:check
npm run format
npm run build
npm run preview
```

O servidor de desenvolvimento informa a URL local. Build em `dist/`; `preview` serve esse resultado para conferência, sem publicar. `npm run check` executa tipos, lint, testes, formatação e build em sequência.

## Organização

```text
src/
  app/                 composição e estado local
  components/          layout, catalog, product e ui
  config/store.ts      configuração pública da loja
  data/                produtos e categorias TypeScript
  lib/                 preços e integração WhatsApp
  types/               modelos de domínio
  styles/              tokens e estilos globais
  tests/               testes e setup
  main.tsx             entrada React
public/images/         ilustrações e futuras fotografias
docs/                  especificação, arquitetura, plano e roadmap
```

Pastas como `hooks` só surgirão quando houver uso real.

## Cadastro de produtos

Edite `src/data/categories.ts` e `src/data/products.ts`. Use id e slug únicos e categoryId existente. Cada imagem contém `src` (por exemplo `/images/minha-arte.webp`) e `alt` descritivo. Uma lista vazia ou erro de carregamento apresenta fallback. Imagens adicionais aparecem na galeria de detalhes. Não use fotos sem autorização.

```ts
{
  id: 'minha-arte',
  slug: 'minha-arte',
  name: 'Nome aprovado da arte',
  description: 'Materiais e características da peça.',
  categoryId: 'decoracao',
  images: [{ src: '/images/minha-arte.webp', alt: 'Descrição da peça' }],
  pricing: { type: 'fixed', amountInCents: 1500 },
  dimensions: { width: 8, height: 8, unit: 'cm' },
  customizable: true,
  available: true,
}
```

Dimensões são opcionais e estruturadas em centímetros (largura, altura e profundidade opcional). `available: false` mantém a peça visível e impede encomenda. `customizable` informa se há adaptações possíveis; não altera preço automaticamente. Antes de publicar, substitua **todos** os exemplos por artes, preços e imagens aprovados; só então ajuste `store.demonstrationMode` para `false`. Trocar apenas o aviso não transforma exemplos em produtos reais.

## Preços

Exatamente três modalidades, com formatação central em `src/lib/pricing.ts`:

| Modelo        | Dados                 | Exibição             |
| ------------- | --------------------- | -------------------- |
| `fixed`       | `amountInCents: 1500` | R$ 15,00             |
| `starting_at` | `amountInCents: 2000` | A partir de R$ 20,00 |
| `quote`       | sem `amountInCents`   | Sob consulta         |

Valores são centavos inteiros seguros, inclusive zero, nunca negativos/fracionários/NaN/Infinity. O cadastro valida preços na carga; valores inválidos geram erro descritivo. Para sob consulta, o campo numérico é proibido inclusive na tipagem. Componentes consomem `formatProductPrice`, sem reconstruir textos de preço.

## Configuração da loja e WhatsApp

Edite `src/config/store.ts`: nome provisório, descrição, caminho do logo (`logoSrc`), telefone e modo demonstrativo. O telefone começa vazio. Configure apenas o número comercial autorizado, em formato internacional (código do país + DDD + número), somente dígitos, sem `+`, parênteses ou espaços. A validação estrutural não verifica a existência de uma conta WhatsApp.

Sem número válido, os botões ficam desabilitados e apresentam aviso de contato indisponível. As funções de `src/lib/whatsapp.ts` retornam `null`; não criam links inválidos. Com número válido e produto disponível, abrem `https://wa.me/…?text=…` com a arte identificada. O cliente decide se envia a mensagem. Há mensagem separada para arte personalizada. Nada é enviado ou armazenado pela aplicação. A configuração é pública; não adicione segredos.

## Deploy no Cloudflare Pages

1. Suba o código em um repositório de sua escolha (nenhum commit/deploy é feito pelo bootstrap).
2. No Pages, conecte o repositório, selecione o diretório raiz e configure build `npm run build`, saída `dist` e `NODE_VERSION=24`.
3. Instale pelo lockfile (`npm ci`); confira o preview antes de liberar o domínio.
4. Substitua exemplos, configure telefone/nome, revise metadados de `index.html` e teste o contato em celular.

Não há variáveis secretas, funções de servidor ou banco. A navegação atual usa âncoras e estado local, sem rotas de produto. O Pages atende uma SPA estática; não há SSR. Nunca publique exemplos como catálogo comercial definitivo.

## Documentação

- [Especificação do produto](docs/PRODUCT_SPEC.md)
- [Arquitetura e decisões](docs/ARCHITECTURE.md)
- [Plano e evidências de validação](docs/IMPLEMENTATION_PLAN.md)
- [Roadmap V1 / V1.x / V2](docs/ROADMAP.md)
- [Orientações para agentes](AGENTS.md)

Referências de configuração: [Vite](https://vite.dev/guide/), [Tailwind com Vite](https://tailwindcss.com/docs/installation/using-vite), [Vitest](https://vitest.dev/guide/) e [Cloudflare Pages / Vite](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/).
