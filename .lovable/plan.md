# Precifica Moda — Experiência guiada

## Análise da versão atual

A tela já oferece quatro etapas, um preço recomendado, comparação com preço atual e mercado, simulação de desconto e análise financeira opcional. Vamos reutilizar esse fluxo e preservar o menu, as cores, a tipografia e a adaptação a telas pequenas.

As principais lacunas são: ausência do caminho de produção terceirizada, entrada de tecido apenas como valor pronto, margem inicial arbitrária de 20% e falta de distinção entre dados ausentes, estimados e confirmados. Também há uma inconsistência na análise: despesas fixas rateadas são descontadas da contribuição e novamente no ponto de equilíbrio.

## Alterações propostas

### 1. Como você trabalha com suas roupas?
- Três opções, sem seleção automática: compro para revender; tenho marca e terceirizo; produzo minhas peças.
- Manter nome, preço atual e faixa de mercado como informações opcionais.

### 2. Custo da peça, com ajuda
- Permitir escolher entre custo total conhecido e composição assistida, sem somar os dois.
- **Revenda:** compra, frete de entrada e custos adicionais.
- **Terceirização:** orçamento por peça, identificação de tecido e aviamentos incluídos e somente os adicionais não incluídos.
- **Produção própria:** tipo de peça, pergunta sobre consumo conhecido, materiais com quantidade e preço na mesma unidade (metro ou quilograma), aviamentos, trabalho, beneficiamentos, embalagem e perdas informadas pelo usuário.
- Se o consumo for desconhecido, aceitar custo total estimado ou cálculo com materiais informados. Não oferecer estimativas automáticas por categoria sem uma base verificável; não inventar conversão de quilogramas em metros.
- Identificar custos estimados e permitir substituí-los por valores confirmados.

### 3. Objetivo financeiro em linguagem simples
- Coletar canais de venda, impostos conhecidos, taxas e comissões, tarifa por pedido e peças por pedido.
- Perguntar despesas mensais, previsão de peças **ou** faturamento mensal e resultado financeiro desejado em reais.
- Remover a margem padrão de 20%. A contribuição necessária será derivada dos dados, não de uma média inventada.
- Se a meta de lucro estiver vazia, não assumir que o usuário escolheu lucro zero: mostrar cobertura dos gastos como objetivo provisório, com lucro desejado pendente.
- Sem volume/faturamento suficiente, apresentar somente um preço parcial para cobrir os custos conhecidos, sem prometer cobertura das despesas mensais ou lucro.
- Identificar impostos e outros dados desconhecidos como pendências, sem confundi-los com zero confirmado.
- Para projeções do negócio inteiro, explicitar que a análise considera esta peça representativa das vendas; não simular um mix desconhecido.

### 4. Resultado único e compreensível
- Manter um preço recomendado, custo utilizado, despesas da venda, contribuição por peça, desconto e avisos de mercado.
- Mostrar objetivo utilizado, dados estimados/pendentes, cobertura dos gastos mensais e lucro operacional estimado quando houver dados suficientes.
- Acrescentar explicação curta e detalhes opcionais dos cálculos.
- Mostrar o impacto do preço atual, faixa de mercado e desconto sem reduzir o preço automaticamente.

## Detalhes técnicos

- Estender a camada pura em `src/lib/pricing/`, reutilizando o motor recomendado existente; cálculos e classificação dos custos ficam fora da apresentação.
- Separar custo variável unitário de despesas fixas mensais. Contribuição é calculada antes das fixas; lucro operacional e ponto de equilíbrio consideram essas despesas uma única vez.
- Com previsão de peças, obter o preço que cobre custo, despesas variáveis, gastos mensais e lucro desejado por unidade. Com faturamento previsto, derivar a margem-alvo como `(despesas fixas + lucro desejado) / faturamento` e aplicar o divisor existente.
- Validar entradas brasileiras, valores não finitos/negativos, descontos fora de 0–100%, tarifas sem quantidade e denominadores não positivos; custo ausente/zero não gera recomendação artificial.
- Reutilizar os controles visuais existentes, separar partes do formulário quando necessário e atualizar os textos da própria tela e seus metadados.

## Verificação

- Testes automatizados para custo ausente/zero, percentuais elevados, denominadores inválidos, tarifas por pedido, orçamento com materiais incluídos, custo total versus componentes, descontos, estimativas e confirmação, despesas/volume ausentes, metas por volume/faturamento e despesas fixas sem duplicação.
- Executar os testes existentes e novos; conferir o fluxo preenchido de cada perfil e o resultado no navegador, incluindo telas pequenas.

## Limites desta entrega

Os cálculos continuam sem salvamento. Login, cadastro persistente, demais áreas demonstrativas, assinaturas e integração de preços de mercado não entram nesta evolução. A conclusão distinguirá o que funciona, o que continua demonstrativo e o que foi efetivamente testado.