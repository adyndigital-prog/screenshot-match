// Fluxo padrão de precificação (markup divisor). Percentuais em fração (0.3 = 30%).
// Nada é arredondado aqui — arredonde apenas na apresentação.

export interface PrecoInput {
  /** Custo direto unitário (fabricação ou aquisição). */
  custoDireto: number;
  /** Tarifas fixas por pedido/venda (R$) — rateadas por unidades por pedido. */
  tarifaPorPedido?: number;
  unidadesPorPedido?: number;
  /** Despesas fixas mensais a ratear por unidade (opcional, cálculo gerencial). */
  fixasMensais?: number;
  volumeMensal?: number;
  /** Despesas variáveis percentuais sobre a venda (impostos, taxas, comissões). */
  variaveis: number[];
  /** Meta de margem de contribuição sobre o preço. */
  margemAlvo: number;
}

export type Alerta = { nivel: "erro" | "aviso"; msg: string };

export interface PrecoResultado {
  custoBase: number;
  rateioTarifa: number;
  rateioFixas: number;
  D: number;
  precoRecomendado: number | null;
  precoMinimo: number | null; // margem 0: cobre custo-base + variáveis
  alertas: Alerta[];
}

const valid = (n: number | undefined) => typeof n === "number" && Number.isFinite(n);

export function calcularPreco(i: PrecoInput): PrecoResultado {
  const alertas: Alerta[] = [];
  if (!valid(i.custoDireto) || i.custoDireto < 0) alertas.push({ nivel: "erro", msg: "Custo inválido." });
  if (!(i.custoDireto > 0)) alertas.push({ nivel: "aviso", msg: "Informe o custo da peça para calcular o preço." });
  if (i.variaveis.some((p) => !valid(p) || p < 0)) alertas.push({ nivel: "erro", msg: "Percentuais de despesas inválidos." });

  let rateioTarifa = 0;
  if ((i.tarifaPorPedido ?? 0) > 0) {
    if (!((i.unidadesPorPedido ?? 0) > 0)) alertas.push({ nivel: "erro", msg: "Informe quantas peças há, em média, por pedido para ratear a tarifa." });
    else rateioTarifa = i.tarifaPorPedido! / i.unidadesPorPedido!;
  }
  let rateioFixas = 0;
  if ((i.fixasMensais ?? 0) > 0) {
    if (!((i.volumeMensal ?? 0) > 0)) alertas.push({ nivel: "aviso", msg: "Despesas fixas não rateadas: informe as peças vendidas por mês." });
    else rateioFixas = i.fixasMensais! / i.volumeMensal!;
  }

  const custoBase = Math.max(0, i.custoDireto || 0) + rateioTarifa + rateioFixas;
  const D = i.variaveis.reduce((a, b) => a + (valid(b) ? b : 0), 0);
  const M = i.margemAlvo;

  let precoRecomendado: number | null = null;
  let precoMinimo: number | null = null;
  const temErro = alertas.some((a) => a.nivel === "erro");
  if (!temErro && custoBase > 0) {
    if (1 - D <= 0) alertas.push({ nivel: "erro", msg: "As despesas sobre a venda somam 100% ou mais: não há preço possível." });
    else precoMinimo = custoBase / (1 - D);
    if (1 - D - M <= 0) alertas.push({ nivel: "erro", msg: "Despesas + meta de margem somam 100% ou mais. Reduza a meta ou revise as despesas." });
    else precoRecomendado = custoBase / (1 - D - M);
  }
  return { custoBase, rateioTarifa, rateioFixas, D, precoRecomendado, precoMinimo, alertas };
}

/** Contribuição unitária a um preço: preço − custo-base − despesas % recalculadas sobre esse preço. */
export function contribuicao(preco: number, custoBase: number, D: number) {
  const variaveis = preco * D;
  const valor = preco - custoBase - variaveis;
  return { variaveis, valor, margem: preco > 0 ? valor / preco : 0 };
}

export function simularDesconto(preco: number, desconto: number, custoBase: number, D: number) {
  const precoPromo = preco * (1 - desconto);
  return { precoPromo, ...contribuicao(precoPromo, custoBase, D) };
}

/** Ponto de equilíbrio por unidades; null quando faltam dados ou contribuição ≤ 0. */
export function equilibrio(contribUnit: number, fixasMensais: number, preco: number) {
  if (!(fixasMensais > 0) || !(contribUnit > 0)) return null;
  const unidades = Math.ceil(fixasMensais / contribUnit);
  return { unidades, faturamento: unidades * preco };
}
