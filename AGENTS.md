# Orientações para agentes

## Produto e escopo

Catálogo estático de artes em Hama Beads. O cliente explora categorias, consulta detalhes/preços e continua a encomenda pelo WhatsApp. A V1 não é um e-commerce. Nome, identidade, fotos e telefone definitivos ainda não existem.

- Não implementar funcionalidades fora do escopo solicitado.
- Não introduzir backend ou banco de dados sem necessidade aprovada.
- Não implementar painel administrativo na V1.
- V2 reserva autenticação administrativa, CRUD, upload, persistência remota e disponibilidade editável por interface. Apenas documentar essas funcionalidades agora.
- Não criar carrinho, checkout, pagamentos, login de clientes, estoque ou gestão de conversas/pedidos.
- Não criar commits automaticamente nem executar comandos destrutivos.

## Stack e estrutura

React, Vite, TypeScript estrito, Tailwind CSS, Lucide React, npm e SPA estática para Cloudflare Pages. Vitest + React Testing Library, ESLint e Prettier. Usar shadcn/ui apenas com necessidade concreta; não está instalado.

- `src/app`: composição da página e estado local de seleção/filtro.
- `src/components/{layout,catalog,product,ui}`: apresentação e interações reutilizáveis.
- `src/types`: contratos explícitos de domínio.
- `src/data`: categorias e produtos locais TypeScript; não usar localStorage como banco.
- `src/config/store.ts`: configuração pública da loja, telefone e modo demonstrativo.
- `src/lib`: regras puras de preço, catálogo e URLs do WhatsApp.
- `src/styles`: tokens e estilos globais; `src/tests`: testes e setup.
- `public/images`: imagens locais e ilustrações demonstrativas.
- `docs`: especificação, arquitetura, plano e roadmap.

## Convenções

- Componentes funcionais e exports nomeados, PascalCase para componentes, camelCase para funções. Props tipadas, dados readonly quando possível.
- Não utilizar `any` indiscriminadamente. Usar `unknown` e narrowing nas fronteiras externas.
- Não criar abstrações genéricas para problemas que ainda não existem. Sem estado global ou repositórios antecipados.
- Separar domínio da UI; componentes não geram URLs nem formatam preços manualmente.
- Tailwind para layout, espaçamento e estados. Tokens em CSS; classes customizadas somente para padrões visuais compartilhados. Sem estilos duplicados ou classes Tailwind montadas dinamicamente.
- Não adicionar dependências sem justificativa. Não modificar arquivos não relacionados à tarefa.

## Produtos e preços

- Produto exige id/slug únicos, nome, descrição, categoryId existente, images, pricing, customizable e available. Dimensões opcionais estruturadas em centímetros, positivas.
- `ProductPricing` é união discriminada: `fixed` e `starting_at` exigem `amountInCents`; `quote` proíbe esse campo. Não adicionar modalidades sem requisito.
- Centavos inteiros seguros e não negativos. Validar em `src/lib/pricing.ts`; centralizar `Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' })` e textos nesse arquivo.
- Não duplicar regras de negócio ou formatação de preços.
- Não utilizar dados fictícios como se fossem reais. Preservar aviso demonstrativo até substituir produtos, preços e imagens por conteúdo aprovado.
- Produto indisponível pode ser consultado, mas não encomendado. Categoria sem produtos apresenta estado vazio.

## WhatsApp e erros

- Somente links HTTPS `wa.me`, com mensagem codificada por `encodeURIComponent`, gerados em `src/lib/whatsapp.ts`.
- Número público internacional, apenas dígitos; vazio/inválido resulta em `null` e UI de contato indisponível. Nunca inventar telefone nem usar href vazio ou `#` para contato.
- Links externos em nova aba exigem `rel="noopener noreferrer"`. Não enviar mensagens automaticamente.
- Imagem ausente/quebrada tem fallback local acessível; preço inválido produz erro explícito no cadastro, nunca vira zero silenciosamente.
- Mensagens de estado devem orientar a pessoa sem stack traces ou detalhes técnicos. Erros de dados locais devem ser corrigidos na origem.

## Acessibilidade e qualidade

- Mobile-first, contraste legível, foco visível, HTML semântico, labels e nomes acessíveis. Alvos de toque confortáveis e nenhum fluxo exclusivo de hover.
- Detalhes em dialog nativo: foco inicial, Escape, contenção e devolução de foco. Preservar navegação por teclado.
- Imagens com alt, dimensões/aspect ratio definidos e lazy loading fora da primeira área visível. Não depender de fontes ou imagens remotas.
- Testar regras monetárias, URLs e ausência de configuração; componentes devem cobrir preços, filtros, vazio, indisponibilidade e detalhes.
- Validar alterações com os testes pertinentes. Antes da entrega executar `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` e `npm run format:check` quando possível. Não alterar testes para ocultar falhas.
- Documentar decisões arquiteturais relevantes em `docs/ARCHITECTURE.md`; manter README, critérios/status do plano e roadmap coerentes com a implementação. Registrar limitações e comandos que não puderam ser executados.
- Trabalhar pelo ciclo Explore → Plan → Implement → Test → Review → Iterate → Report.
