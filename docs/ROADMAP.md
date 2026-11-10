# Roadmap

## V1 — MVP (escopo desta execução)

**Status:** bootstrap técnico e catálogo demonstrativo funcional concluídos. Liberação comercial e deploy pendentes de conteúdo/configuração aprovados.

- Fundação documentada e tipada, dados locais e configuração central.
- Identidade provisória e conteúdo demonstrativo explicitamente marcado.
- Catálogo responsivo com filtros, cards, detalhes, galeria simples e vazio.
- Três modalidades de preço, validação e formatação central.
- WhatsApp por links, indisponível sem configuração; pedidos personalizados.
- Tratamento de disponibilidade e imagens ausentes.
- Testes prioritários, lint, typecheck e build para Cloudflare Pages.

Antes da liberação comercial: aprovar nome e identidade, substituir exemplos/preços/ilustrações por dados reais, cadastrar telefone comercial, conferir em dispositivos reais e publicar pelo responsável. Infraestrutura preparada não significa catálogo comercial pronto.

## V1.x — Melhorias incrementais (não implementadas)

- Links diretos de produtos e metadados por arte, conforme necessidade de compartilhamento.
- Busca textual se o volume justificar.
- Pipeline de variantes de fotos reais, formatos e tamanhos responsivos.
- Revisão com leitores de tela e auditoria de desempenho em produção.
- Ajustes de identidade definitiva e conteúdo a partir do uso real.

## V2 — Painel administrativo e persistência (somente planejamento)

- Autenticação de administradores.
- CRUD de produtos e categorias, upload de imagens.
- Persistência em banco e armazenamento de imagens.
- Gerenciamento de disponibilidade por interface.
- Avaliação de Supabase ou equivalente, validação de dados, políticas de acesso e estados de rede.

V2 depende de requisito aprovado e projeto específico. Não instalar SDKs, criar endpoints, tabelas, autenticação ou painel na V1. A evolução preservará contratos de domínio sem antecipar um repositório complexo.

## Fora do escopo

Carrinho, checkout, pagamentos online, login de clientes, estoque, gateways, chat e gestão de pedidos/conversas. Não entram automaticamente na V2.
