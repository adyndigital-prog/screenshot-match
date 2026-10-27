// Motor de precificação — funções puras. Percentuais em fração (0.3 = 30%).

export class PricingError extends Error {}

const round2 = (n: number) => Math.round(n * 100) / 100;

function assertCost(cost: number) {
  if (!Number.isFinite(cost) || cost < 0) throw new PricingError("Custo inválido.");
}

/** Método 1 — custo + markup percentual. */
export function markupPercentual(cost: number, markup: number) {
  assertCost(cost);
  return round2(cost * (1 + markup));
}

/** Método 2 — markup multiplicador. */
export function markupMultiplicador(cost: number, multiplier: number) {
  assertCost(cost);
  if (multiplier <= 0) throw new PricingError("Multiplicador deve ser maior que zero.");
  return round2(cost * multiplier);
}

/** Método 3 — markup divisor: preço = custo / (1 − Σ percentuais). */
export function markupDivisor(cost: number, percentages: number[]) {
  assertCost(cost);
  const sum = percentages.reduce((a, b) => a + b, 0);
  if (sum >= 1) throw new PricingError("A soma dos percentuais deve ser menor que 100%.");
  return round2(cost / (1 - sum));
}

/** Método 4 — margem de contribuição. */
export function margemContribuicao(price: number, cost: number, variablePct: number) {
  const variable = price * variablePct;
  const contribution = price - cost - variable;
  return {
    contribuicao: round2(contribution),
    margem: price > 0 ? contribution / price : 0,
  };
}

/** Método 5 — custeio completo com despesas fixas rateadas por unidades. */
export function custeioCompleto(
  cost: number,
  fixedMonthly: number,
  unitsMonth: number,
  percentages: number[],
) {
  if (unitsMonth <= 0) throw new PricingError("Volume previsto deve ser maior que zero.");
  const fullCost = cost + fixedMonthly / unitsMonth;
  return { custoCompleto: round2(fullCost), preco: markupDivisor(fullCost, percentages) };
}

/** Método 6 — lucro-alvo mensal. */
export function lucroAlvo(
  cost: number,
  fixedMonthly: number,
  targetProfit: number,
  unitsMonth: number,
  variablePct: number,
) {
  if (unitsMonth <= 0) throw new PricingError("Volume previsto deve ser maior que zero.");
  if (variablePct >= 1) throw new PricingError("Despesas variáveis devem ser menores que 100%.");
  return round2((cost + (fixedMonthly + targetProfit) / unitsMonth) / (1 - variablePct));
}

/** Método 7 — ponto de equilíbrio. */
export function pontoEquilibrio(
  price: number,
  cost: number,
  variablePct: number,
  fixedMonthly: number,
) {
  const unitContribution = price - cost - price * variablePct;
  if (unitContribution <= 0)
    throw new PricingError("Contribuição unitária negativa ou nula: não há ponto de equilíbrio.");
  const unidades = Math.ceil(fixedMonthly / unitContribution);
  return { unidades, faturamento: round2(unidades * price) };
}

export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const pct = (n: number) =>
  (n * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%";
