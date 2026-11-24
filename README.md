# Catálogo digital de Hama Beads

SPA estática da loja de Cecília Roldan para apresentar artes artesanais, consultar preços e iniciar encomendas pelo WhatsApp. Não possui carrinho, checkout ou backend. As peças, os preços e as ilustrações cadastrados são exemplos para a prévia local.

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

Dimensões são opcionais e estruturadas em centímetros (largura, altura e profundidade opcional). `available: false` mantém a peça visível e impede encomenda. `customizable` informa se há adaptações possíveis; não altera preço automaticamente. Antes de publicar, substitua **todos** os exemplos por artes, preços e imagens aprovados.

## Preços

Exatamente três modalidades, com formatação central em `src/lib/pricing.ts`:

| Modelo        | Dados                 | Exibição             |
| ------------- | --------------------- | -------------------- |
| `fixed`       | `amountInCents: 1500` | R$ 15,00             |
| `starting_at` | `amountInCents: 2000` | A partir de R$ 20,00 |
| `quote`       | sem `amountInCents`   | Sob consulta         |

Valores são centavos inteiros seguros, inclusive zero, nunca negativos/fracionários/NaN/Infinity. O cadastro valida preços na carga; valores inválidos geram erro descritivo. Para sob consulta, o campo numérico é proibido inclusive na tipagem. Componentes consomem `formatProductPrice`, sem reconstruir textos de preço.

## Configuração da loja e WhatsApp

`src/config/store.ts` reúne nome da loja, descrição, caminho do logo (`logoSrc`), telefone e visibilidade dos avisos de demonstração (`demonstrationMode`, desativado na prévia atual). O telefone começa vazio. Configure apenas o número comercial autorizado, em formato internacional (código do país + DDD + número), somente dígitos, sem `+`, parênteses ou espaços. A validação estrutural não verifica a existência de uma conta WhatsApp.

Sem número válido, os botões ficam desabilitados e apresentam aviso de contato indisponível. As funções de `src/lib/whatsapp.ts` retornam `null`; não criam links inválidos. Com número válido e produto disponível, abrem `https://wa.me/…?text=…` com a arte identificada. O cliente decide se envia a mensagem. Há mensagem separada para arte personalizada. Nada é enviado ou armazenado pela aplicação. A configuração é pública; não adicione segredos.

## Deploy no Cloudflare Pages

1. Suba o código em um repositório de sua escolha (nenhum commit/deploy é feito pelo bootstrap).
2. No Pages, conecte o repositório, selecione o diretório raiz e configure build `npm run build`, saída `dist` e `NODE_VERSION=24`.
3. Instale pelo lockfile (`npm ci`); confira o preview antes de liberar o domínio.
4. Substitua exemplos, configure o telefone, revise metadados de `index.html` e teste o contato em celular.

Na V1, o Pages atende uma SPA estática com âncoras e estado local. Nunca publique exemplos como catálogo comercial definitivo.

## Executar a V2 localmente

```sh
npm ci
npm run db:v2:setup
npm run dev:v2
```

Abra `http://127.0.0.1:8787`. A vitrine lê categorias e peças visíveis de `GET /api/catalog`. As migrações e os exemplos ficam em `worker/d1`. Use `npm run db:v2:setup` para montar uma prévia com exemplos. Para atualizar um banco existente sem repor exemplos removidos, use `npm run db:v2:migrate`. O Wrangler usa apenas o banco local, e `npm run dev:v2` gera o build separado em `dist-v2` antes de servir a SPA. Rode esse comando novamente após alterar a interface.

O painel local fica em `http://127.0.0.1:8787/admin`. Use esse endereço para testar produtos, categorias, visibilidade e disponibilidade com o D1 local. Em **Fotos**, envie, ordene, substitua ou remova até oito fotos por peça. O upload aceita JPEG, PNG e WebP de até 50 MB e exige texto alternativo. A primeira foto é a capa. O Wrangler guarda os arquivos no R2 local.

O Worker de desenvolvimento aceita acesso administrativo apenas nessa prévia em loopback, sem login real. `npm run dev` e `npm run build` continuam servindo o fluxo estático da V1.

## Homologar a V2 na Cloudflare

`npm run check:v2:staging` valida o build e empacota o Worker de homologação com `--dry-run`. O modelo [wrangler.staging.example.jsonc](wrangler.staging.example.jsonc) usa a entrada que valida Cloudflare Access, um D1 próprio, um bucket R2 privado e limpeza de fotos sem vínculo a cada 15 minutos. O deploy de homologação usa o endereço `workers.dev` do Worker. [Ambientes do Wrangler](https://developers.cloudflare.com/workers/wrangler/environments/)

1. Autentique o Wrangler com `npx wrangler login`. Crie um D1 e um bucket R2 para homologação, seguindo os nomes do modelo ou preenchendo os nomes escolhidos. Deixe o bucket sem acesso público. Copie o modelo para `wrangler.staging.jsonc`, que fica fora do Git, e preencha o ID do novo D1.
2. Aplique as migrações com `npx wrangler d1 migrations apply DB --config wrangler.staging.jsonc --remote`. Gere o build com `npm run build:v2` e faça o deploy de homologação com `npx wrangler deploy --config wrangler.staging.jsonc`. O painel retorna acesso negado até o Access ser configurado.
3. No Zero Trust, crie **uma** aplicação do Access para o hostname da homologação. Inclua `/admin`, `/admin/*`, `/api/admin` e `/api/admin/*` e permita os dois e-mails individuais por código de uso único. Deixe `/` e `/api/catalog` públicos. Uma única aplicação garante o mesmo público de token para as rotas do painel e da API. [Cloudflare Access para Workers](https://developers.cloudflare.com/workers/configuration/cloudflare-access/)
4. Defina `ACCESS_TEAM_DOMAIN` com o hostname da equipe, `ACCESS_AUD` com o público da aplicação e `ADMIN_EMAILS` com os dois endereços separados por vírgula. Use os segredos do Worker ou carregue um arquivo local `.env.staging.secrets` com `npx wrangler secret bulk .env.staging.secrets --config wrangler.staging.jsonc`. Mantenha esse arquivo fora do Git. [Segredos do Workers](https://developers.cloudflare.com/workers/configuration/secrets/)
5. Rode `npm run smoke:v2 -- <URL-da-homologação> --require-access`. Teste os dois logins em sessões separadas, confirme a recusa com um e-mail fora da lista e confira cadastro, foto, ocultação e encomenda pelo WhatsApp. Use conteúdo aprovado antes da liberação comercial.

Para ensaiar a recuperação, exporte o D1 com `wrangler d1 export` e copie os objetos do R2, preservando suas chaves e o `Content-Type`. Guarde as cópias fora do repositório. Restaure o SQL em um D1 vazio e as fotos em um bucket separado. Rode a checagem contra a cópia e confira uma foto restaurada pelo catálogo. Como o SQL guarda referências, a recuperação do catálogo precisa dos dois backups correspondentes. [Importação e exportação no D1](https://developers.cloudflare.com/d1/best-practices/import-export-data/) · [API S3 do R2](https://developers.cloudflare.com/r2/api/s3/api/)

## Documentação

- [Especificação do produto](docs/PRODUCT_SPEC.md)
- [Arquitetura e decisões](docs/ARCHITECTURE.md)
- [Plano e evidências de validação](docs/IMPLEMENTATION_PLAN.md)
- [Roadmap V1 / V1.x / V2](docs/ROADMAP.md)
- [Orientações para agentes](AGENTS.md)

Referências de configuração: [Vite](https://vite.dev/guide/), [Tailwind com Vite](https://tailwindcss.com/docs/installation/using-vite), [Vitest](https://vitest.dev/guide/) e [Cloudflare Pages / Vite](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/).
