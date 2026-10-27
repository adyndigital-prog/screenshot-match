import { describe, expect, it } from "vitest";
import {
  custeioCompleto,
  lucroAlvo,
  margemContribuicao,
  markupDivisor,
  markupMultiplicador,
  markupPercentual,
  pontoEquilibrio,
} from "./engine";

describe("motor de precificação", () => {
  it("markup percentual 100% sobre R$ 40 = R$ 80", () => {
    expect(markupPercentual(40, 1)).toBe(80);
  });
  it("multiplicador 2,5 sobre R$ 40 = R$ 100", () => {
    expect(markupMultiplicador(40, 2.5)).toBe(100);
  });
  it("divisor com 6% + 10% + 24% sobre R$ 60 = R$ 100", () => {
    expect(markupDivisor(60, [0.06, 0.1, 0.24])).toBe(100);
  });
  it("divisor bloqueia percentuais somando 100% ou mais", () => {
    expect(() => markupDivisor(60, [0.5, 0.5])).toThrow();
  });
  it("margem de contribuição", () => {
    expect(margemContribuicao(100, 40, 0.2)).toEqual({ contribuicao: 40, margem: 0.4 });
  });
  it("custeio completo rateia fixas por unidade", () => {
    expect(custeioCompleto(40, 10000, 1000, [0.5]).preco).toBe(100);
  });
  it("lucro-alvo", () => {
    expect(lucroAlvo(40, 5000, 5000, 1000, 0.5)).toBe(100);
  });
  it("ponto de equilíbrio em unidades", () => {
    expect(pontoEquilibrio(100, 40, 0.2, 10000)).toEqual({ unidades: 250, faturamento: 25000 });
  });
  it("sem ponto de equilíbrio com contribuição negativa", () => {
    expect(() => pontoEquilibrio(50, 60, 0, 1000)).toThrow();
  });
});
