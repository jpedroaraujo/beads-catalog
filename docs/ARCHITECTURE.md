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
4. **Identidade da loja**: configuração central do nome Cecília Roldan, da descrição, do caminho do logo e do telefone. Os tokens de cor ficam em CSS. `demonstrationMode` controla os avisos, que estão desativados na prévia atual. As ilustrações SVG locais são esquemáticas. Não há downloads de imagens/fontes externos.
5. **Detalhes em dialog nativo**: aproveita top layer, comportamento modal, contenção de foco e Escape dos navegadores atuais. React controla a seleção; o componente restaura foco e limpa estado. Sem roteador agora; links diretos de produtos ficam para V1.x.
6. **WhatsApp**: funções recebem produto e, opcionalmente, número (padrão na configuração). Retornam string HTTPS ou null. Validação estrutural de 8–15 dígitos internacionais, primeiro dígito não zero; não garante conta existente. Mensagem codificada com encodeURIComponent. Disponibilidade bloqueada tanto no domínio quanto na UI. Links usam noopener/noreferrer. Contato personalizado tem mensagem própria.
7. **Imagens**: aspect ratio reservado, dimensões explícitas, lazy loading nos cards e fallback para lista vazia ou falha. Galeria simples para imagens adicionais, sem carrossel/dependência. Fotos reais devem ser otimizadas em WebP/AVIF antes de cadastrar.
8. **Escopo de estado**: filtro e seleção no App; imagem ativa no detalhe. Sem Context, Redux, cache remoto ou abstração de serviços.

## Erros e validação

Dados locais inválidos são erro do cadastro: tipo rigoroso e validação explícita com identificação do produto. Não corrigir preço inválido para zero. Falhas esperadas (contato ausente, produto indisponível, imagem quebrada, filtro vazio) têm UI específica. Configuração pública não admite segredos.

Vitest cobre regras e componentes; jsdom fornece DOM e o setup adapta somente métodos de dialog ausentes no ambiente. Comportamento modal real requer conferência no navegador. Build e typecheck são separados; ESLint inclui regras React/hooks e TypeScript. Prettier é a configuração única de formatação.

## Evolução para V2

O build local da V2 usa a mesma apresentação da V1 e lê `GET /api/catalog`. A interface valida respostas na fronteira e distingue carregamento, vazio e falha com nova tentativa. O catálogo estático continua disponível pelo build padrão da V1.

Modelar a visibilidade separadamente de `available`. A consulta pública exclui produtos ocultos na origem. As duas contas administrativas podem consultar e reexibir esses produtos preservando cadastro, fotos e disponibilidade. Para fotos do R2, o Worker consulta a visibilidade a cada solicitação e serve o conteúdo sem cache. Ilustrações locais da prévia continuam como arquivos estáticos.

Workers Static Assets serve a SPA e o Worker expõe a API. A leitura pública consulta categorias e produtos no mesmo lote D1, filtra `visible = 1` na origem e devolve apenas dados de apresentação. O cadastro local usa as tabelas `categories`, `products` e `product_images`. Fotos têm ordem explícita por produto. Migrações versionadas separam o esquema dos exemplos locais. Respostas da API usam `Cache-Control: no-store` para refletir a próxima leitura após uma alteração.

O painel consulta `/api/admin/catalog`, que inclui produtos ocultos. Gravações usam a revisão do cadastro para detectar alterações concorrentes. A operação de visibilidade altera apenas `visible` e a revisão do produto. A disponibilidade, os demais dados e a galeria são preservados. A chave estrangeira do D1 restringe exclusões de categorias vinculadas.

O entrypoint principal verifica o token do Access para `/admin` e `/api/admin`, incluindo assinatura, emissor, público esperado, validade e e-mail autorizado. A validação é feita no Worker porque o roteador de Static Assets não repassa `ctx.access`. O entrypoint da prévia local usa a mesma API e limita o acesso administrativo ao endereço de loopback do servidor de desenvolvimento. [Cloudflare Access para Workers](https://developers.cloudflare.com/workers/configuration/cloudflare-access/) · [Validação de tokens do Access](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)

O bucket R2 permanece privado. Cada upload grava um objeto novo, e a galeria troca o vínculo no D1 após a gravação. D1 atualiza os vínculos e a revisão da peça no mesmo lote. Arquivos substituídos, removidos ou abandonados ficam registrados na fila `image_cleanup`. Alterações na galeria e o handler agendado processam a fila com tentativas repetíveis. Em homologação, configurar o Cron Trigger e verificar a limpeza periódica. [API do R2](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)

O [modelo de homologação](../wrangler.staging.example.jsonc) aponta para a entrada com validação do Access, separa os bindings D1 e R2 e agenda a limpeza a cada 15 minutos. `npm run check:v2:staging` empacota a configuração sem publicar. `npm run smoke:v2` verifica a leitura pública e a proteção das rotas administrativas sem credenciais.

## Deploy

`npm ci` + `npm run build` → `dist/`. Cloudflare Pages executa e serve os assets estáticos. Node 24 escolhido para padronizar ambiente com as versões estáveis instaladas. Sem redirects de rotas internos nesta versão, pois os detalhes são estado local. Metadados gerais em index.html, sem URL canônica/domínio inventados.
