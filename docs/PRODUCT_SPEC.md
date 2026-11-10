# Especificação do produto

## Problema e público

Uma artesã precisa apresentar criações de Hama Beads por um link simples, sem operar uma loja virtual. Clientes em celular ou desktop precisam descobrir peças, entender preço/personalização e iniciar atendimento pelo WhatsApp.

## Objetivos do MVP

- Catálogo visual rápido, responsivo e acessível.
- Categorias, detalhes, disponibilidade e exatamente três modalidades de preço.
- Conteúdo e configuração editáveis em arquivos locais, sem backend.
- Encaminhamento seguro ao WhatsApp, inclusive com preço sob consulta.
- Fundação simples que permita migrar dados na V2.

## Jornadas

1. Abrir o link → ler apresentação → explorar todas as artes ou filtrar categoria.
2. Selecionar uma peça → consultar imagem, descrição, dimensões, preço, personalização e disponibilidade → encomendar no WhatsApp se configurado e disponível.
3. Acessar seção personalizada → entender que referência, tamanho e cores serão combinados → iniciar conversa sem produto selecionado.
4. Sem contato configurado → receber explicação e botão desabilitado, sem navegação.
5. Categoria vazia → visualizar mensagem e ação para voltar a todas as peças.

## Escopo

Incluído: header configurável, apresentação, filtros, cards, dialog de detalhes com galeria, fallback de imagens, estado vazio, disponibilidade, contato e personalização, dados locais, testes e SEO básico.

Excluído da V1: painel, autenticação, CRUD por interface, uploads, banco, gerenciamento remoto da disponibilidade. Excluído do produto nesta etapa: carrinho, checkout, pagamentos, clientes autenticados, estoque, backend próprio e gerenciamento de conversas/pedidos.

## Regras de negócio

- `pricing` obrigatório: `fixed`, `starting_at` ou `quote`. As duas primeiras exigem centavos inteiros seguros não negativos; a última proíbe valor numérico.
- Preço inicial comunica variação por tamanho, cores ou personalização. Sob consulta nunca mostra valor numérico.
- Valores monetários formatados exclusivamente em pt-BR/BRL pela função de domínio.
- Produtos indisponíveis continuam visíveis, com encomenda desabilitada.
- Filtro não altera dados e inclui uma opção para todos os produtos. Categorias vazias são permitidas.
- Telefone vazio ou estruturalmente inválido impede abertura do WhatsApp. A existência da conta deve ser conferida pela responsável.
- Personalização e prazo são acordados no atendimento, sem prometer valores, prazos ou condições inventados.
- Todos os produtos iniciais e suas ilustrações/preços são fictícios. Nome da loja e identidade são provisórios e a UI informa isso.
- Dimensões opcionais estruturadas em cm. Sem dimensões cadastradas, detalhes orientam consulta no atendimento.

## Acessibilidade e responsividade

Mobile-first, conteúdo utilizável a partir de 320px, sem rolagem horizontal. Grid adapta colunas sem reduzir legibilidade. Semântica de header/nav/main/footer, link para pular ao conteúdo, botões de filtro com estado anunciado, foco visível, contraste legível e alvos de toque confortáveis.

Dialog com nome/descrição acessíveis, foco inicial, Escape e restauração do foco. Interações disponíveis por teclado. Imagens têm alt e proporção consistente, incluindo fallback. Contagem de resultados anunciada sem interromper a leitura. Respeitar preferências de movimento reduzido. Não transmitir disponibilidade apenas por cor.

## Critérios de aceite

- Instalação reproduzível e desenvolvimento local funcionando.
- Os três tipos de preço aparecem no catálogo e nos detalhes e têm testes.
- Categorias filtram corretamente e o vazio tem saída clara.
- Detalhes abrem/fecham por teclado; produto indisponível não pode ser encomendado.
- Telefone não configurado nunca gera link inválido.
- Imagem ausente/quebrada não impede leitura nem navegação.
- Tipos, lint, testes e build passam; limitações de validação são registradas no plano.
- Documentação distingue entrega atual de melhorias e V2; nenhuma administração implementada.

## Limitações conhecidas

Sem conteúdo comercial real, telefone ou identidade definitiva. Não há estoque, cálculo de prazo, cálculo de personalização ou verificação da conta WhatsApp. Dados mudam por edição de código e novo build. Detalhes não têm URL própria; SEO é da página geral. Testes de DOM não substituem revisão em navegadores e tecnologias assistivas reais.
