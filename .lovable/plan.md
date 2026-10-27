# Precifica Moda — Plano de desenvolvimento

Micro SaaS de precificação para vestuário (marcas/confecções e revenda), 100% pt-BR, R$ e formatos brasileiros.

## Ambiguidades a confirmar
- Nome e identidade visual do produto (proposta provisória: "Precifica Moda").
- Planos e preços da assinatura (gratuito limitado? valores mensal/anual?) — fica para a última etapa.
- Uma conta = uma empresa no início; multiempresa/equipe depois.
- Impostos: apenas alíquota efetiva informada pelo usuário, com aviso de validação contábil (sem cálculo automático de tributos).

## Etapas

**Etapa 1 — Base visual e navegação (esta entrega)**
- Design premium: tons grafite + terracota/linho, tipografia editorial.
- Página inicial de apresentação, layout do app com menu lateral (desktop) e menu móvel.
- Dashboard com dados de exemplo claramente marcados como "Exemplo".
- Telas das 12 áreas criadas (as ainda não prontas mostram "em breve").
- Motor de cálculo puro com testes automatizados: markup percentual, multiplicador, divisor, margem de contribuição, custeio completo, lucro-alvo, ponto de equilíbrio.
- Protótipo do cadastro guiado de produto + resultado da precificação (sem salvar ainda).

**Etapa 2 — Contas e dados persistentes (Lovable Cloud)**
- Login, cadastro do negócio com escolha do perfil (marca/confecção/revenda/híbrido).
- Configurações financeiras: regime, alíquota efetiva, despesas fixas, metas, canais e taxas, arredondamento.
- Produtos, variantes, insumos e custos salvos com segurança por empresa.

**Etapa 3 — Custeio completo**
- Matéria-prima com consumo, perdas, rendimento e conversão de unidades; aviamentos, mão de obra, beneficiamentos, outros custos; revenda.
- Custo previsto x realizado.

**Etapa 4 — Métodos avançados**
- Atacado e varejo, preço por canal, mercado e valor percebido, promoções/descontos, comparação de métodos.

**Etapa 5 — Histórico, relatórios e exportação**
- Histórico de cálculos e versões de preço, PDF e CSV, relatório por canal, alertas do dashboard com dados reais.

**Etapa 6 — Assinatura**
- Planos, limites, pagamento, cancelamento e recusas.

## Detalhes técnicos
- Motor de cálculo em módulo isolado (`src/lib/pricing/`) com funções puras e testes Vitest; validação de divisores (ex.: soma de percentuais >= 100% bloqueia markup divisor).
- Rotas TanStack por área; dados com Lovable Cloud + RLS por empresa na Etapa 2.
