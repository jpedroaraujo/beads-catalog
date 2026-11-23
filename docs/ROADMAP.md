# Roadmap

## V1 — MVP (escopo desta execução)

**Status:** bootstrap técnico e catálogo demonstrativo funcional concluídos. Liberação comercial e deploy pendentes de conteúdo/configuração aprovados.

- Fundação documentada e tipada, dados locais e configuração central.
- Nome da loja definido como Cecília Roldan, com identidade visual provisória e conteúdo de exemplo na prévia local.
- Catálogo responsivo com filtros, cards, detalhes, galeria simples e vazio.
- Três modalidades de preço, validação e formatação central.
- WhatsApp por links, indisponível sem configuração; pedidos personalizados.
- Tratamento de disponibilidade e imagens ausentes.
- Testes prioritários, lint, typecheck e build para Cloudflare Pages.

Antes da liberação comercial: aprovar a identidade visual, substituir exemplos/preços/ilustrações por dados reais, cadastrar telefone comercial, conferir em dispositivos reais e publicar pelo responsável.

## V1.x — Melhorias incrementais (não implementadas)

- Links diretos de produtos e metadados por arte, conforme necessidade de compartilhamento.
- Busca textual se o volume justificar.
- Pipeline de variantes de fotos reais, formatos e tamanhos responsivos.
- Revisão com leitores de tela e auditoria de desempenho em produção.
- Ajustes de identidade definitiva e conteúdo a partir do uso real.

## V2 — Painel administrativo e persistência

**Status** — Fundação, leitura pública e painel administrativo implementados localmente. Configuração e teste dos dois logins reais no Access, R2 e publicação pendentes.

- Acesso administrativo para duas contas individuais, com as mesmas permissões e sem cadastro público.
- CRUD de produtos e categorias, upload de imagens.
- Persistência em banco e armazenamento de imagens.
- Gerenciamento de disponibilidade por interface.
- Ocultar e reexibir produtos sem excluir o cadastro ou as fotos. Produtos ocultos ficam acessíveis pelo painel e são omitidos das consultas públicas. Produtos visíveis e indisponíveis continuam na vitrine com a encomenda bloqueada.
- Cloudflare Workers para hospedagem e API, Access para autenticação, D1 para os cadastros e R2 para as fotos. Incluir validação de dados, controle de acesso e estados de rede.

O [plano de implementação da V2](IMPLEMENTATION_PLAN.md#v2--plano-de-implementação) começa pela fundação local e pela leitura pública do catálogo. A execução da V2 é separada da V1.

## Fora do escopo

Carrinho, checkout, pagamentos online, login de clientes, estoque, gateways, chat e gestão de pedidos/conversas. Não entram automaticamente na V2.
