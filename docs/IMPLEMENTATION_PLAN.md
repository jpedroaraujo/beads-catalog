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

- Header com acesso direto às criações e ilustrações locais identificadas.
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
- Assets: `public/images/{beads-mark,flower,strawberry,butterfly,heart,ghost,daisy}.svg`, todos locais e ilustrativos.

**Pendente de configuração comercial:** identidade visual e logo definitivos, produtos e preços reais, fotografias autorizadas e otimizadas e telefone comercial. O nome Cecília Roldan já consta na interface e nos metadados. Os avisos de demonstração estão desativados na prévia local. Os exemplos devem ser substituídos antes da publicação.

**Pendente de operação:** criar/conectar repositório por decisão da responsável, revisar preview e publicar no Cloudflare Pages. Nenhum commit, repositório remoto ou deploy foi criado.

**Limites de validação:** conferência em Chromium headless e testes de DOM; não foi realizada validação com leitor de tela, Safari/Firefox ou aparelhos físicos. Auditoria automatizada não certifica acessibilidade completa. Não há link permanente de detalhes por produto nem fotos reais para medir otimização final.

**Próxima iteração da V1:** inserir conteúdo comercial aprovado, testar o telefone em dispositivo real e revisar a experiência com tecnologias assistivas antes do deploy.

## V2 — Plano de implementação

**Status** — Etapas 1 a 3 concluídas, com Worker, D1 e R2 implantados na homologação. O Access protege as rotas administrativas. O teste dos dois logins reais, o conteúdo aprovado e a publicação comercial permanecem pendentes. A stack escolhida é Cloudflare Workers, Access, D1 e R2.

1. **Fundação local e leitura pública.** Servir o build da SPA pelo Worker local, versionar as migrações do D1 e carregar produtos e categorias de teste. Preservar as regras de preço e os vínculos de categoria. Modelar visibilidade separadamente de `available`. A API pública devolve somente produtos visíveis. A interface distingue carregamento, vazio e erro com nova tentativa. **Aceite:** um produto oculto fica fora da resposta pública. Um produto visível e indisponível aparece com a encomenda bloqueada. O catálogo funciona localmente sem consumir recursos de produção.
2. **Painel e persistência.** Proteger o painel e a API administrativa com Access para os dois e-mails autorizados. Implementar CRUD e os controles de visibilidade e disponibilidade. Bloquear exclusão de categoria com produtos vinculados. **Aceite:** chamadas diretas de visitantes e de pessoas fora da lista são recusadas. Cada administrador pode ocultar e reexibir uma peça preservando cadastro e disponibilidade. As mudanças aparecem na próxima leitura pública sem redeploy.
3. **Fotos no R2.** Implementar envio, ordenação, substituição e remoção com texto alternativo e limites de arquivo. **Aceite:** uma falha na troca preserva a foto anterior. Ocultar a peça preserva suas fotos. Uma imagem ausente tem fallback acessível.
4. **Homologação e publicação.** Testar os dois logins, as rotas administrativas, os limites de uso e a recuperação de dados. Importar apenas cadastros e fotos aprovados e conferir o telefone comercial em aparelho real. **Aceite:** o catálogo em homologação funciona sem usar dados de produção e o conteúdo aprovado passa pela revisão antes da publicação.

**Validação da etapa 1:** migração e exemplos aplicados no D1 local. A API retornou apenas as duas peças visíveis, incluindo a indisponível, e respondeu com 404 para rota inexistente e 405 para método de escrita. Chromium a 375 px confirmou aviso demonstrativo, detalhes, encomenda bloqueada e filtro vazio. Os testes de interface também cobrem carregamento, falha, nova tentativa e catálogo vazio.

**Validação da etapa 2** — A API foi exercitada contra um D1 local isolado para testar CRUD, ocultação e reexibição, conflito de revisão, integridade das categorias e rejeição de solicitações sem autorização ou de outra origem. Chromium a 375 px confirmou a ocultação e a reexibição pelo painel, com efeito na próxima leitura pública. Testes automatizados usam tokens assinados localmente para verificar o Access e cobrem a preservação do formulário após falha de gravação. O login com os dois e-mails reais será verificado na homologação.

**Validação da etapa 3** — D1 e R2 locais isolados confirmaram upload, ordenação, edição de texto alternativo, substituição concorrente e remoção. O handler agendado removeu um objeto vencido sem vínculo. Uma substituição rejeitada preservou a foto anterior, e ocultar a peça bloqueou a URL pública da foto mantendo a prévia administrativa. Chromium a 375 px confirmou o upload pelo painel, a troca da capa e a exibição na vitrine.

**Validação local da etapa 4** — `npm run check:v2:staging` empacotou a configuração com `--dry-run`. O ensaio restaurou um export do D1 e uma foto do R2 em recursos locais isolados. A checagem HTTP confirmou a leitura sem login, a ausência da peça oculta, a recusa sem autenticação nas rotas do painel e a leitura da foto restaurada com o conteúdo original.

**Homologação remota** — O D1 `beads-catalog-staging` recebeu as três migrações. O bucket `beads-catalog-photos-staging` foi criado com acesso público desativado. O Worker foi implantado com limpeza de fotos a cada 15 minutos. Nas requisições sem sessão, `/` e `/api/catalog` retornaram `200` e `/admin` e `/api/admin/catalog` redirecionaram para a equipe correta do Access. Falta testar o login com os dois e-mails autorizados.
