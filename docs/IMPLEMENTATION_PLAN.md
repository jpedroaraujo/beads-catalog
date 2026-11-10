# Plano de implementação — Loop Engineering

## Estado inicial e método

Explore (05/11/2026): diretório vazio, sem aplicação, Git, AGENTS.md ou lockfile; Node 24.14.0 e npm 11.21.1 disponíveis. Nenhum arquivo anterior a preservar. Gerenciador escolhido: npm. Não criar commits ou publicar nesta execução.

Plan: documentação e decisões registradas antes dos componentes. Implement → Test → Review → Iterate → Report: executar as fases abaixo, revisar escopo e registrar resultados reais no final deste documento.

## Fase 0 — Fundação

**Status: concluída nesta execução.** Dependências: inspeção inicial.

- Criar README, AGENTS e os quatro documentos de produto/arquitetura/plano/roadmap.
- Configurar Vite/React/TypeScript estrito, Tailwind, Lucide, ESLint, Prettier e Vitest/RTL.
- Criar diretórios apenas com uso real e scripts de qualidade/build.

**Aceite:** instalação via lockfile, servidor local e comandos documentados funcionando.

## Fase 1 — Modelo de dados

**Status: concluída nesta execução.** Dependências: Fase 0.

- Tipar produto, categoria, imagem, dimensões em cm e união de preços.
- Centralizar configuração pública, preço e validação monetária.
- Cadastrar exemplos identificados das três modalidades e produto indisponível.

**Aceite:** contratos estritos e testes para modalidades, zero, centavos e entradas inválidas.

## Fase 2 — Catálogo

**Status: concluída nesta execução.** Dependências: Fase 1.

- Header, apresentação provisória e ilustrações locais identificadas.
- Cards, grid mobile-first, filtros e contagem de resultados.
- Estado vazio recuperável e fallback de imagem ausente/quebrada.

**Aceite:** três preços visíveis, filtros verificáveis, vazio e imagens sem bloquear navegação.

## Fase 3 — Detalhes e encomendas

**Status: concluída nesta execução.** Dependências: Fase 2 e configuração da Fase 1.

- Dialog com descrição, imagens, preço, dimensões, personalização e disponibilidade.
- URLs wa.me codificadas, pedido de produto e personalizado.
- Contato ausente e produto indisponível bloqueiam encomenda.

**Aceite:** fluxo de seleção e fechamento acessível, sem links inválidos, testes do domínio e UI.

## Fase 4 — Refinamento

**Status: concluída para o bootstrap.** Dependências: Fases 0–3. Publicação e revisão com conteúdo real permanecem pendentes.

- Revisar semântica, foco, responsividade e links externos.
- Reservar proporções de imagens, usar assets locais e lazy loading.
- SEO geral e instruções Cloudflare Pages, sem publicação.
- Executar typecheck, lint, testes, format:check e build; corrigir falhas.

**Aceite:** verificações passam e limitações de revisão manual ficam explícitas.

## Validação desta execução

### Test

- `npm ci`: instalação reproduzível pelo lockfile.
- `npm run typecheck`: tipagem rigorosa, inclusive testes de contratos com `@ts-expect-error`.
- `npm run lint`: sem erros ou avisos.
- `npm test`: **69 testes, 4 arquivos**, cobrindo preços, entradas inválidas, cadastro, WhatsApp, cards, filtros, vazio, detalhes, foco, galeria, imagens e links.
- `npm run format:check`: formatação consistente.
- `npm run build`: bundle estático gerado em `dist/`.
- `npm run dev -- --host 127.0.0.1`: servidor local iniciado com sucesso.
- Chromium headless: larguras de 320, 375, 768 e 1440 px sem overflow horizontal ou imagens quebradas; filtros/vazio, abertura via Enter, foco inicial, ciclo de Tab, Escape e foco restaurado verificados. Contato ausente não produz links wa.me. Peça indisponível bloqueia pedido também em 320 px. Sem erros JavaScript observados.
- axe-core no Chromium, viewport de 375 px: nenhuma violação automática nas regras WCAG 2 A/AA e 2.1 AA avaliadas, tanto no catálogo quanto no modal aberto. Isso não substitui testes com pessoas e tecnologias assistivas.
- Ferramentas de browser QA foram instaladas apenas em diretório temporário fora do projeto; não acrescentam dependência ao catálogo.

### Review e Iterate

Revisadas separação de domínio/UI, ausência de duplicação monetária, contratos estritos, estado local, dimensões estruturadas, links HTTPS com proteção de nova aba, mensagens demonstrativas, HTML semântico e responsividade. A configuração do logo foi centralizada durante a revisão. O modal utiliza comportamento nativo confirmado no Chromium; os testes jsdom adaptam apenas os métodos ausentes de dialog. Nenhuma funcionalidade V2, backend, autenticação ou abstração de repositórios foi adicionada.

`npm audit --omit=dev`: **0 vulnerabilidades**. A auditoria completa retorna **10 avisos moderados** na árvore de lint, derivados do mesmo [alerta de minimatch](https://github.com/advisories/GHSA-g3hv-75wg-m249). As dependências atuais de ESLint/typescript-eslint pedem minimatch 10; a correção do alerta exige 11. Não foi aplicado override de major nem `audit fix --force`. Acompanhar atualização compatível das ferramentas. Essas dependências não entram no bundle de produção.

### Report: arquivos e pendências

O diretório inicial estava vazio; todos os arquivos são novos. Entrega:

- Raiz: `AGENTS.md`, `README.md`, `package.json`, `package-lock.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `.gitignore`, `.nvmrc`, `.prettierrc.json`, `.prettierignore`.
- Documentação: `docs/PRODUCT_SPEC.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/ROADMAP.md`.
- Aplicação: `src/main.tsx`, `src/app/App.tsx`, componentes de layout/catálogo/produto/UI, `src/styles/index.css`.
- Domínio: `src/types/{product,category}.ts`, `src/data/{products,categories}.ts`, `src/config/store.ts`, `src/lib/{pricing,whatsapp,catalog}.ts`.
- Qualidade: `src/tests/setup.ts`, testes de preços (execução e contratos de tipo), WhatsApp, cadastro e componentes.
- Assets: `public/images/{beads-mark,hero-beads,flower,strawberry,butterfly,heart,ghost,daisy}.svg`, todos locais e ilustrativos.

**Pendente de configuração comercial:** nome/identidade, logo e metadados definitivos, produtos e preços reais, fotografias autorizadas e otimizadas, telefone comercial e substituição de todos os demonstrativos antes de desativar `demonstrationMode`. Não é necessário telefone para iniciar o projeto localmente.

**Pendente de operação:** criar/conectar repositório por decisão da responsável, revisar preview e publicar no Cloudflare Pages. Nenhum commit, repositório remoto ou deploy foi criado.

**Limites de validação:** conferência em Chromium headless e testes de DOM; não foi realizada validação com leitor de tela, Safari/Firefox ou aparelhos físicos. Auditoria automatizada não certifica acessibilidade completa. Não há link permanente de detalhes por produto nem fotos reais para medir otimização final.

**Próxima iteração:** inserir conteúdo comercial aprovado, testar o telefone em dispositivo real, revisar a experiência com tecnologias assistivas e então seguir o deploy documentado. V1.x e V2 seguem exclusivamente no roadmap.
