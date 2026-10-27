import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import {
  brl, pct, custeioCompleto, lucroAlvo, margemContribuicao, markupDivisor,
  markupMultiplicador, pontoEquilibrio, PricingError,
} from "@/lib/pricing/engine";

export const Route = createFileRoute("/app/precificacao")({
  head: () => ({
    meta: [
      { title: "Precificar peça — Precifica Moda" },
      { name: "description", content: "Calcule custo, preço sugerido, margem e ponto de equilíbrio de uma peça." },
      { property: "og:title", content: "Precificar peça — Precifica Moda" },
      { property: "og:description", content: "Calcule custo, preço sugerido, margem e ponto de equilíbrio de uma peça." },
    ],
  }),
  component: Precificacao,
});

type Modo = "fabricacao" | "revenda";
const camposFab = [
  ["tecido", "Tecido (consumo × preço)", "Ex.: 1,2 m × R$ 18,00 = 21,60"],
  ["aviamentos", "Aviamentos", "Elástico, linha, etiquetas, tags"],
  ["maoDeObra", "Corte, costura e acabamento", "Valor por peça da oficina"],
  ["beneficiamento", "Beneficiamentos", "Estampa, bordado, lavanderia"],
  ["outros", "Embalagem e perdas", "Embalagem, frete de entrada, retrabalho"],
] as const;
const camposRev = [
  ["compra", "Preço de compra", "Valor pago ao fornecedor por peça"],
  ["frete", "Frete de entrada rateado", "Frete total ÷ peças"],
  ["tributos", "Tributos não recuperáveis", "Se aplicável"],
  ["outros", "Embalagem e outros", "Sacola, etiqueta, brinde"],
] as const;

const num = (s: string) => {
  const n = parseFloat(s.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

function Field({ label, hint, value, onChange, suffix }: { label: string; hint?: string; value: string; onChange: (v: string) => void; suffix?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1 flex items-center rounded-md border bg-card focus-within:ring-2 focus-within:ring-ring">
        {!suffix && <span className="pl-3 text-sm text-muted-foreground">R$</span>}
        <input inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0,00" className="w-full bg-transparent px-3 py-2 text-sm outline-none" />
        {suffix && <span className="pr-3 text-sm text-muted-foreground">{suffix}</span>}
      </div>
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

function Precificacao() {
  const [step, setStep] = useState(0);
  const [modo, setModo] = useState<Modo>("fabricacao");
  const [custos, setCustos] = useState<Record<string, string>>({});
  const [v, setV] = useState({ imposto: "6", taxa: "4", comissao: "5", margem: "20", fixas: "8000", volume: "500", lucro: "5000", mult: "2,5" });
  const set = (k: keyof typeof v) => (x: string) => setV({ ...v, [k]: x });

  const campos = modo === "fabricacao" ? camposFab : camposRev;
  const custo = campos.reduce((s, [k]) => s + num(custos[k] ?? ""), 0);
  const variavel = (num(v.imposto) + num(v.taxa) + num(v.comissao)) / 100;

  const res = useMemo(() => {
    const out: { nome: string; preco: number | null; nota: string; erro?: string }[] = [];
    const tryAdd = (nome: string, nota: string, f: () => number) => {
      try { out.push({ nome, nota, preco: f() }); }
      catch (e) { out.push({ nome, nota, preco: null, erro: e instanceof PricingError ? e.message : "Erro" }); }
    };
    tryAdd("Markup divisor", "Cobre impostos, taxas, comissão e margem desejada", () => markupDivisor(custo, [variavel, num(v.margem) / 100]));
    tryAdd("Markup multiplicador", `Custo × ${v.mult}`, () => markupMultiplicador(custo, num(v.mult)));
    tryAdd("Custeio completo", "Inclui despesas fixas rateadas pelo volume", () => custeioCompleto(custo, num(v.fixas), num(v.volume), [variavel, num(v.margem) / 100]).preco);
    tryAdd("Lucro-alvo", `Para lucrar ${brl(num(v.lucro))}/mês`, () => lucroAlvo(custo, num(v.fixas), num(v.lucro), num(v.volume), variavel));
    return out;
  }, [custo, variavel, v]);

  const steps = ["Tipo", "Custos da peça", "Despesas e metas", "Resultado"];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-4xl">Precificar peça</h1>
      <p className="mt-1 text-sm text-muted-foreground">Protótipo — os cálculos ainda não são salvos.</p>

      <ol className="mt-6 flex flex-wrap gap-2">
        {steps.map((s, i) => (
          <li key={s}>
            <button onClick={() => setStep(i)} className={`rounded-full px-3 py-1 text-xs font-semibold ${i === step ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{i + 1}. {s}</button>
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-lg border bg-card p-6">
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {([["fabricacao", "Fabricação própria", "Marca, confecção ou ateliê: tecido, aviamentos, oficina."], ["revenda", "Revenda", "Compra peças prontas e revende ao consumidor."]] as const).map(([k, t, d]) => (
              <button key={k} onClick={() => setModo(k)} className={`rounded-lg border p-5 text-left transition ${modo === k ? "border-primary ring-2 ring-primary" : "hover:bg-muted"}`}>
                <p className="font-display text-xl">{t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {campos.map(([k, l, h]) => <Field key={k} label={l} hint={h} value={custos[k] ?? ""} onChange={(x) => setCustos({ ...custos, [k]: x })} />)}
            <div className="rounded-md bg-muted p-4 sm:col-span-2"><span className="text-sm text-muted-foreground">Custo unitário</span><p className="font-display text-2xl">{brl(custo)}</p></div>
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Impostos sobre a venda" suffix="%" value={v.imposto} onChange={set("imposto")} hint="Alíquota efetiva real da sua empresa" />
            <Field label="Taxa de pagamento / marketplace" suffix="%" value={v.taxa} onChange={set("taxa")} />
            <Field label="Comissões" suffix="%" value={v.comissao} onChange={set("comissao")} />
            <Field label="Margem de lucro desejada" suffix="%" value={v.margem} onChange={set("margem")} />
            <Field label="Despesas fixas mensais" value={v.fixas} onChange={set("fixas")} hint="Aluguel, salários, sistemas" />
            <Field label="Peças vendidas por mês" suffix="un." value={v.volume} onChange={set("volume")} />
            <Field label="Meta de lucro mensal" value={v.lucro} onChange={set("lucro")} />
            <Field label="Multiplicador de referência" suffix="×" value={v.mult} onChange={set("mult")} />
            <p className="flex gap-2 rounded-md bg-muted p-3 text-xs text-muted-foreground sm:col-span-2"><Info className="h-4 w-4 shrink-0" />O percentual de impostos deve refletir a situação real da empresa. Valide com seu contador.</p>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Custo unitário: <b className="text-foreground">{brl(custo)}</b> · Despesas variáveis: <b className="text-foreground">{pct(variavel)}</b></p>
            <div className="grid gap-4 sm:grid-cols-2">
              {res.map((r) => {
                const m = r.preco ? margemContribuicao(r.preco, custo, variavel) : null;
                return (
                  <div key={r.nome} className="rounded-lg border p-5">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">{r.nome}</p>
                    {r.preco !== null ? (
                      <>
                        <p className="mt-2 font-display text-3xl">{brl(r.preco)}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{r.nota}</p>
                        {m && <p className={`mt-3 text-sm font-semibold ${m.contribuicao < 0 ? "text-destructive" : "text-success"}`}>Contribuição {brl(m.contribuicao)} ({pct(m.margem)})</p>}
                      </>
                    ) : <p className="mt-2 text-sm text-destructive">{r.erro}</p>}
                  </div>
                );
              })}
            </div>
            <Equilibrio preco={res[0]?.preco ?? null} custo={custo} variavel={variavel} fixas={num(v.fixas)} />
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between">
        <button disabled={step === 0} onClick={() => setStep(step - 1)} className="rounded-md border px-4 py-2 text-sm disabled:opacity-40">Voltar</button>
        {step < 3 && <button onClick={() => setStep(step + 1)} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Continuar</button>}
      </div>
    </div>
  );
}

function Equilibrio({ preco, custo, variavel, fixas }: { preco: number | null; custo: number; variavel: number; fixas: number }) {
  if (!preco) return null;
  try {
    const pe = pontoEquilibrio(preco, custo, variavel, fixas);
    return <div className="rounded-md bg-secondary p-4 text-sm">Ponto de equilíbrio (preço por markup divisor): <b>{pe.unidades.toLocaleString("pt-BR")} peças/mês</b> ou <b>{brl(pe.faturamento)}</b> de faturamento.</div>;
  } catch (e) {
    return <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">{(e as Error).message}</div>;
  }
}
