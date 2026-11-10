# Arquitetura

## Fundação

SPA React + Vite + TypeScript estrito. Build estático para Cloudflare Pages, sem SSR, servidor, banco ou serviços pagos. npm e lockfile para instalação reproduzível. Tailwind via plugin Vite; Lucide para ícones. Dialog nativo evita biblioteca de modal. Não há necessidade de shadcn/ui ou estado global agora.

Versões da fundação: React 19.3, Vite 8.3, Tailwind 4.3 e Vitest 5.1; TypeScript 5.9 foi escolhido dentro da faixa suportada pelo typescript-eslint 8.72 (`>=4.8.4 <6.1.0`), evitando adotar TypeScript 7 sem suporte declarado do lint. Versões exatas resolvidas ficam no lockfile; não atualizar majors automaticamente.

## Organização e responsabilidades

`app/App.tsx` compõe a página e mantém filtro e produto selecionado em estado local. Componentes de layout apresentam identidade e navegação; catálogo apresenta filtros/grid/vazio; produto apresenta card, imagem com fallback e detalhes; UI compartilha o botão de contato. `config/store.ts` guarda configurações públicas. `types` guarda contratos, `data` fornece cadastros locais e `lib` concentra regras puras. CSS global define tokens; utilitários Tailwind definem o layout. `tests` reúne setup e testes de domínio/componentes.

Fluxo: `config + data tipada → App (filtro/seleção) → grid/card/detalhes → funções puras de preço/WhatsApp → apresentação ou link externo`. Não há escrita remota nem armazenamento de conversas. Apenas a ação deliberada no link inicia navegação ao WhatsApp.

## Modelo de dados

- `Category`: id, nome e descrição opcional.
- `ProductImage`: src e alt.
- `ProductDimensions`: width, height, depth opcional e unit literal `cm`.
- `Product`: id, slug, name, description, categoryId, images readonly, pricing obrigatório, dimensions opcional, customizable e available.
- `ProductPricing`: união discriminada com type `fixed | starting_at | quote`; `quote` usa `amountInCents?: never` com `exactOptionalPropertyTypes`, proibindo inclusive undefined explícito. Demais modalidades exigem número.

## Decisões e trade-offs

1. **Centavos**: números inteiros seguros não negativos; `isProductPricing(unknown)` verifica o contrato na fronteira e `formatProductPrice` rejeita dados inválidos. Uma instância `Intl.NumberFormat` define BRL/pt-BR. Nenhum componente replica a regra. O catálogo local valida preços na carga para identificar erros de edição na origem.
2. **Dimensões estruturadas**: cm, largura/altura e profundidade opcional. Facilita exibição consistente e futura validação remota, sem campos livres difíceis de consultar. Não calculam preço ou frete. Dimensões omitidas são explicadas na UI.
3. **Dados locais**: arquivos TypeScript com `satisfies` e referências de categoria conferidas na carga. Sem localStorage ou camada de repositórios. Alterações exigem novo build; isso é aceitável no MVP.
4. **Identidade provisória**: configuração central de nome, descrição, caminho do logo e telefone; tokens de cor em CSS. `demonstrationMode` exibe avisos. Ilustrações SVG locais de beads são esquemáticas e não representam fotografias ou peças reais. Não há downloads de imagens/fontes externos.
5. **Detalhes em dialog nativo**: aproveita top layer, comportamento modal, contenção de foco e Escape dos navegadores atuais. React controla a seleção; o componente restaura foco e limpa estado. Sem roteador agora; links diretos de produtos ficam para V1.x.
6. **WhatsApp**: funções recebem produto e, opcionalmente, número (padrão na configuração). Retornam string HTTPS ou null. Validação estrutural de 8–15 dígitos internacionais, primeiro dígito não zero; não garante conta existente. Mensagem codificada com encodeURIComponent. Disponibilidade bloqueada tanto no domínio quanto na UI. Links usam noopener/noreferrer. Contato personalizado tem mensagem própria.
7. **Imagens**: aspect ratio reservado, dimensões explícitas, lazy loading nos cards e fallback para lista vazia ou falha. Galeria simples para imagens adicionais, sem carrossel/dependência. Fotos reais devem ser otimizadas em WebP/AVIF antes de cadastrar.
8. **Escopo de estado**: filtro e seleção no App; imagem ativa no detalhe. Sem Context, Redux, cache remoto ou abstração de serviços.

## Erros e validação

Dados locais inválidos são erro do cadastro: tipo rigoroso e validação explícita com identificação do produto. Não corrigir preço inválido para zero. Falhas esperadas (contato ausente, produto indisponível, imagem quebrada, filtro vazio) têm UI específica. Configuração pública não admite segredos.

Vitest cobre regras e componentes; jsdom fornece DOM e o setup adapta somente métodos de dialog ausentes no ambiente. Comportamento modal real requer conferência no navegador. Build e typecheck são separados; ESLint inclui regras React/hooks e TypeScript. Prettier é a configuração única de formatação.

## Evolução para V2 (somente planejada)

Preservar contratos de domínio e funções de apresentação. Quando houver requisito aprovado, substituir importação estática por carregamento remoto, validando unknown na fronteira e adicionando loading/erro/retry. Só então avaliar um módulo de acesso a dados simples. Serviço como Supabase pode prover banco, storage e autenticação administrativa com políticas de acesso. Não incluir SDK, credenciais, tabelas ou repositório genérico agora. Nunca expor segredo administrativo no bundle público.

## Deploy

`npm ci` + `npm run build` → `dist/`. Cloudflare Pages executa e serve os assets estáticos. Node 24 escolhido para padronizar ambiente com as versões estáveis instaladas. Sem redirects de rotas internos nesta versão, pois os detalhes são estado local. Metadados gerais em index.html, sem URL canônica/domínio inventados.
