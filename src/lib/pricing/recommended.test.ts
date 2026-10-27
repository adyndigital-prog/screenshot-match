import { describe, expect, it } from "vitest";
import { calcularPreco, contribuicao, equilibrio, simularDesconto } from "./recommended";

describe("preço recomendado C / (1 − D − M)", () => {
  it("C=60, D=16%, M=24% → R$ 100", () => {
    const r = calcularPreco({ custoDireto: 60, variaveis: [0.06, 0.1], margemAlvo: 0.24 });
    expect(r.precoRecomendado).toBeCloseTo(100, 10);
  });
  it("preço mínimo usa margem zero: 60 / 0,84", () => {
    const r = calcularPreco({ custoDireto: 60, variaveis: [0.16], margemAlvo: 0.24 });
    expect(r.precoMinimo).toBeCloseTo(71.428571, 5);
  });
  it("bloqueia denominador ≤ 0", () => {
    const r = calcularPreco({ custoDireto: 60, variaveis: [0.6], margemAlvo: 0.4 });
    expect(r.precoRecomendado).toBeNull();
    expect(r.alertas.some((a) => a.nivel === "erro")).toBe(true);
  });
  it("tarifa por pedido rateada: R$ 10 / 2 peças soma R$ 5 ao custo", () => {
    const r = calcularPreco({ custoDireto: 55, tarifaPorPedido: 10, unidadesPorPedido: 2, variaveis: [0.16], margemAlvo: 0.24 });
    expect(r.custoBase).toBe(60);
    expect(r.precoRecomendado).toBeCloseTo(100, 10);
  });
  it("fixas rateadas entram uma única vez no custo-base", () => {
    const r = calcularPreco({ custoDireto: 50, fixasMensais: 5000, volumeMensal: 500, variaveis: [0.16], margemAlvo: 0.24 });
    expect(r.custoBase).toBe(60);
  });
  it("sem custo não gera preço e alerta", () => {
    const r = calcularPreco({ custoDireto: 0, variaveis: [0.1], margemAlvo: 0.2 });
    expect(r.precoRecomendado).toBeNull();
    expect(r.alertas.length).toBeGreaterThan(0);
  });
  it("não arredonda internamente", () => {
    const r = calcularPreco({ custoDireto: 10, variaveis: [], margemAlvo: 0.3 });
    expect(r.precoRecomendado).toBe(10 / 0.7);
  });
});

describe("contribuição e promoções", () => {
  it("contribuição a R$ 100 com C=60, D=16% = R$ 24 (24%)", () => {
    const c = contribuicao(100, 60, 0.16);
    expect(c.valor).toBeCloseTo(24, 10);
    expect(c.margem).toBeCloseTo(0.24, 10);
  });
  it("desconto de 20% recalcula despesas sobre o preço promocional", () => {
    const s = simularDesconto(100, 0.2, 60, 0.16);
    expect(s.precoPromo).toBe(80);
    expect(s.variaveis).toBeCloseTo(12.8, 10);
    expect(s.valor).toBeCloseTo(7.2, 10);
  });
  it("ponto de equilíbrio só com fixas e contribuição positiva", () => {
    expect(equilibrio(24, 6000, 100)).toEqual({ unidades: 250, faturamento: 25000 });
    expect(equilibrio(-1, 6000, 100)).toBeNull();
    expect(equilibrio(24, 0, 100)).toBeNull();
  });
});
