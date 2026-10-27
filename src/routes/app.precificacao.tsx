import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, Info } from "lucide-react";
import { brl, pct } from "@/lib/pricing/engine";
import { calcularPreco, contribuicao, equilibrio, simularDesconto } from "@/lib/pricing/recommended";

export const Route = createFileRoute("/app/precificacao")({
  head: () => ({
    meta: [
      { title: "Precificar peça — Precifica Moda" },
      { name: "description", content: "Descubra o preço de venda recomendado da sua peça com base nos seus custos e na sua meta de margem." },
      { property: "og:title", content: "Precificar peça — Precifica Moda" },
      { property: "og:description", content: "Descubra o preço de venda recomendado da sua peça com base nos seus custos e na sua meta de margem." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Precificacao,
});

type Modo = "fabricacao" | "revenda";
type Produto = "camiseta" | "blusa" | "calca" | "vestido" | "saia" | "legging" | "moletom";
const consumoEstimado: Record<Produto, number> = {
  camiseta: 0.9, blusa: 1.2, calca: 1.5, vestido: 2, saia: 1,
  legging: 1.1, moletom: 1.8,
};
const nomesProduto: Record<Produto, string> = {
  camiseta: "Camiseta", blusa: "Blusa", calca: "Calça", vestido: "Vestido",
  saia: "Saia", legging: "Legging", moletom: "Moletom",
};
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

function Field({ label, hint, value, onChange, suffix, text }: { label: string; hint?: string; value: string; onChange: (v: string) => void; suffix?: string; text?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1 flex items-center rounded-md border bg-card focus-within:ring-2 focus-within:ring-ring">
        {!suffix && !text && <span className="pl-3 text-sm text-muted-foreground">R$</span>}
        <input inputMode={text ? "text" : "decimal"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={text ? "" : "0,00"} className="w-full bg-transparent px-3 py-2 text-sm outline-none" />
        {suffix && <span className="pr-3 text-sm text-muted-foreground">{suffix}</span>}
      </div>
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

function Precificacao() {
  const [step, setStep] = useState(0);
  const [modo, setModo] = useState<Modo>("fabricacao");
  const [nome, setNome] = useState("");
  const [produto, setProduto] = useState<Produto>("camiseta");
  const [precoMetro, setPrecoMetro] = useState("");
  const [usarReferencia, setUsarReferencia] = useState(false);
  const [estrategia, setEstrategia] = useState<"conservadora" | "equilibrada" | "valor">("equilibrada");
  const [custos, setCustos] = useState<Record<string, string>>({});
  const [v, setV] = useState({ imposto: "", taxa: "", comissao: "", outrasPct: "", tarifa: "", porPedido: "1", margem: "25", fixas: "", volume: "", atual: "", mercadoMin: "", mercadoMax: "", desconto: "10" });
  const set = (k: keyof typeof v) => (x: string) => setV({ ...v, [k]: x });
  const escolherEstrategia = (x: "conservadora" | "equilibrada" | "valor") => {
    setEstrategia(x);
    setV((atual) => ({ ...atual, margem: x === "conservadora" ? "15" : x === "equilibrada" ? "25" : "35" }));
  };

  const campos = modo === "fabricacao" ? camposFab.filter(([k]) => k !== "tecido") : camposRev;
  // Consumo orientativo inicial; varia conforme modelagem, tamanho, largura e rendimento do tecido.
  const consumo = consumoEstimado[produto];
  // R$ 20/m é apenas uma hipótese ilustrativa para simulação, nunca uma cotação de mercado.
  const valorMetro = usarReferencia ? 20 : num(precoMetro);
  const custoTecido = modo === "fabricacao" ? consumo * valorMetro : 0;
  const custoDireto = campos.reduce((s, [k]) => s + num(custos[k] ?? ""), 0) + custoTecido;

  const r = useMemo(() => calcularPreco({
    custoDireto,
    tarifaPorPedido: num(v.tarifa), unidadesPorPedido: num(v.porPedido),
    fixasMensais: num(v.fixas), volumeMensal: num(v.volume),
    variaveis: [v.imposto, v.taxa, v.comissao, v.outrasPct].map((x) => num(x) / 100),
    margemAlvo: num(v.margem) / 100,
  }), [custoDireto, v]);

  const steps = ["Negócio e produto", "Custo da peça", "Despesas e meta", "Resultado"];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-4xl">Precificar peça</h1>
      <p className="mt-1 text-sm text-muted-foreground">Os cálculos ainda não são salvos.</p>

      <ol className="mt-6 flex flex-wrap gap-2">
        {steps.map((s, i) => (
          <li key={s}>
            <button onClick={() => setStep(i)} className={`rounded-full px-3 py-1 text-xs font-semibold ${i === step ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{i + 1}. {s}</button>
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-lg border bg-card p-6">
        {step === 0 && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {([["fabricacao", "Fabricação própria", "Marca, confecção ou ateliê: tecido, aviamentos, oficina."], ["revenda", "Revenda", "Compra peças prontas e revende ao consumidor."]] as const).map(([k, t, d]) => (
                <button key={k} onClick={() => setModo(k)} className={`rounded-lg border p-5 text-left transition ${modo === k ? "border-primary ring-2 ring-primary" : "hover:bg-muted"}`}>
                  <p className="font-display text-xl">{t}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{d}</p>
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field text label="Nome da peça" value={nome} onChange={setNome} hint="Ex.: Legging Compressão" />
              <Field label="Preço atual (opcional)" value={v.atual} onChange={set("atual")} hint="Se a peça já está à venda" />
              <Field label="Preço de mercado — mínimo (opcional)" value={v.mercadoMin} onChange={set("mercadoMin")} hint="Faixa que você observa no mercado" />
              <Field label="Preço de mercado — máximo (opcional)" value={v.mercadoMax} onChange={set("mercadoMax")} />
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-5">
            {modo === "fabricacao" && (
              <section className="rounded-lg border p-4 space-y-4">
                <div>
                  <p className="font-medium">Vamos estimar o tecido para você</p>
                  <p className="mt-1 text-sm text-muted-foreground">Escolha a peça. O sistema sugere um consumo inicial para você não precisar saber essa conta.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium">Tipo de peça</span>
                    <select value={produto} onChange={(e) => setProduto(e.target.value as Produto)} className="mt-1 w-full rounded-md border bg-card px-3 py-2 text-sm">
                      {Object.entries(nomesProduto).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                    </select>
                  </label>
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Consumo inicial estimado</p>
                    <p className="font-display text-xl">{consumo.toLocaleString("pt-BR")} m por peça</p>
                    <p className="text-xs text-muted-foreground">Referência aproximada; pode variar por tamanho, modelagem e largura do tecido.</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Preço do tecido por metro" value={precoMetro} onChange={(x) => { setPrecoMetro(x); setUsarReferencia(false); }} hint="Se tiver uma cotação, informe aqui." />
                  <label className="flex items-start gap-2 rounded-md border p-3 text-sm">
                    <input type="checkbox" checked={usarReferencia} onChange={(e) => setUsarReferencia(e.target.checked)} className="mt-1" />
                    <span><b>Não sei o preço ainda</b><span className="mt-1 block text-xs text-muted-foreground">Usar R$ 20/m apenas como hipótese ilustrativa, não como preço real de mercado.</span></span>
                  </label>
                </div>
                <p className="text-sm">Custo estimado do tecido: <b>{brl(custoTecido)}</b> {usarReferencia && <span className="text-xs text-muted-foreground">(simulação provisória)</span>}</p>
              </section>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {campos.map(([k, l, h]) => <Field key={k} label={l} hint={h} value={custos[k] ?? ""} onChange={(x) => setCustos({ ...custos, [k]: x })} />)}
            </div>
            <div className="rounded-md bg-muted p-4"><span className="text-sm text-muted-foreground">Custo da peça {usarReferencia ? " (estimativa provisória)" : ""}</span><p className="font-display text-2xl">{brl(custoDireto)}</p></div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Impostos sobre a venda" suffix="%" value={v.imposto} onChange={set("imposto")} hint="Alíquota efetiva real da sua empresa" />
              <Field label="Taxa de pagamento / marketplace" suffix="%" value={v.taxa} onChange={set("taxa")} />
              <Field label="Comissões" suffix="%" value={v.comissao} onChange={set("comissao")} />
              <Field label="Outras despesas sobre a venda" suffix="%" value={v.outrasPct} onChange={set("outrasPct")} hint="Não repita custos já lançados na peça" />
              <Field label="Tarifa fixa por pedido" value={v.tarifa} onChange={set("tarifa")} hint="Ex.: tarifa fixa do marketplace" />
              <Field label="Peças por pedido (média)" suffix="un." value={v.porPedido} onChange={set("porPedido")} hint="Usado para dividir a tarifa por peça" />
            </div>
            <div className="rounded-lg border p-4 space-y-3">
              <div>
                <p className="font-medium">Qual é sua prioridade ao vender?</p>
                <p className="mt-1 text-sm text-muted-foreground">Você não precisa conhecer margem de contribuição. Escolha uma estratégia e calculamos um cenário inicial para você.</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {([
                  ["conservadora", "Preço competitivo", "Meta inicial de 15%"],
                  ["equilibrada", "Equilíbrio", "Meta inicial de 25%"],
                  ["valor", "Maior contribuição", "Meta inicial de 35%"],
                ] as const).map(([key, title, desc]) => (
                  <button type="button" key={key} onClick={() => escolherEstrategia(key)} className={`rounded-md border p-3 text-left ${estrategia === key ? "border-primary ring-2 ring-primary" : "hover:bg-muted"}`}>
                    <span className="block text-sm font-medium">{title}</span><span className="mt-1 block text-xs text-muted-foreground">{desc}</span>
                  </button>
                ))}
              </div>
              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground">Personalizar a meta (opcional)</summary>
                <div className="mt-3"><Field label="Meta de margem de contribuição" suffix="%" value={v.margem} onChange={(x) => { set("margem")(x); setEstrategia("equilibrada"); }} /></div>
              </details>
              <p className="text-xs text-muted-foreground">Esses percentuais são cenários iniciais para simulação, não regras universais do mercado. A margem é o valor que sobra após custo da peça e despesas variáveis para ajudar a pagar as despesas fixas; não é lucro líquido.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Despesas fixas mensais (opcional)" value={v.fixas} onChange={set("fixas")} hint="Aluguel, salários, sistemas" />
              <Field label="Peças vendidas por mês" suffix="un." value={v.volume} onChange={set("volume")} hint="Para dividir as fixas por peça" />
            </div>
            <p className="flex gap-2 rounded-md bg-muted p-3 text-xs text-muted-foreground"><Info className="h-4 w-4 shrink-0" />Os percentuais devem refletir a situação real da empresa. Valide os impostos com seu contador.</p>
          </div>
        )}
        {step === 3 && <Resultado r={r} nome={nome} atual={num(v.atual)} mMin={num(v.mercadoMin)} mMax={num(v.mercadoMax)} margemAlvo={num(v.margem) / 100} fixas={num(v.fixas)} desconto={v.desconto} setDesconto={set("desconto")} />}
      </div>

      <div className="mt-4 flex justify-between">
        <button disabled={step === 0} onClick={() => setStep(step - 1)} className="rounded-md border px-4 py-2 text-sm disabled:opacity-40">Voltar</button>
        {step < 3 && <button onClick={() => setStep(step + 1)} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Continuar</button>}
      </div>
    </div>
  );
}

function Stat({ l, v, s }: { l: string; v: string; s?: string | undefined }) {
  return (
    <div className="rounded-md bg-muted p-4">
      <p className="text-xs text-muted-foreground">{l}</p>
      <p className="mt-1 font-display text-xl">{v}</p>
      {s && <p className="text-xs text-muted-foreground">{s}</p>}
    </div>
  );
}

function Resultado({ r, nome, atual, mMin, mMax, margemAlvo, fixas, desconto, setDesconto }: {
  r: ReturnType<typeof calcularPreco>; nome: string; atual: number; mMin: number; mMax: number; margemAlvo: number; fixas: number; desconto: string; setDesconto: (v: string) => void;
}) {
  const alertas = [...r.alertas];
  const p = r.precoRecomendado;
  const c = p ? contribuicao(p, r.custoBase, r.D) : null;
  const cAtual = atual > 0 ? contribuicao(atual, r.custoBase, r.D) : null;
  if (r.D === 0) alertas.push({ nivel: "aviso", msg: "Nenhuma despesa sobre a venda informada (impostos, taxas, comissões). Confira se está correto." });
  if (cAtual && cAtual.margem < margemAlvo) alertas.push({ nivel: cAtual.valor < 0 ? "erro" : "aviso", msg: `O preço atual (${brl(atual)}) dá margem de contribuição de ${pct(cAtual.margem)}, abaixo da meta de ${pct(margemAlvo)}.` });
  if (p && mMin > 0 && p < mMin) alertas.push({ nivel: "aviso", msg: `O preço recomendado está abaixo da faixa de mercado informada (${brl(mMin)}).` });
  if (p && mMax > 0 && p > mMax) alertas.push({ nivel: "aviso", msg: `O preço recomendado está acima da faixa de mercado informada (${brl(mMax)}). Revise custos ou a meta.` });
  const promo = p ? simularDesconto(p, num(desconto) / 100, r.custoBase, r.D) : null;
  const pe = c && fixas > 0 ? equilibrio(c.valor - r.rateioFixas, fixas, p!) : null;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-primary/30 p-6 text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Preço de venda recomendado{nome && ` · ${nome}`}</p>
        <p className="mt-2 font-display text-5xl">{p ? brl(p) : "—"}</p>
        {r.precoMinimo && <p className="mt-2 text-sm text-muted-foreground">Preço mínimo (sem margem): {brl(r.precoMinimo)}</p>}
      </div>

      {alertas.length > 0 && (
        <ul className="space-y-2">
          {alertas.map((a) => (
            <li key={a.msg} className={`flex gap-2 rounded-md p-3 text-sm ${a.nivel === "erro" ? "bg-destructive/10 text-destructive" : "bg-warning/15"}`}>
              <AlertTriangle className="h-4 w-4 shrink-0" />{a.msg}
            </li>
          ))}
        </ul>
      )}

      {p && c && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat l="Custo unitário considerado" v={brl(r.custoBase)} s={r.rateioFixas || r.rateioTarifa ? `inclui rateios: ${brl(r.rateioFixas + r.rateioTarifa)}` : undefined} />
          <Stat l="Despesas sobre a venda" v={brl(c.variaveis)} s={pct(r.D)} />
          <Stat l="Margem de contribuição" v={brl(c.valor)} s={pct(c.margem)} />
          <Stat l="Meta de margem" v={pct(margemAlvo)} />
        </div>
      )}

      {p && cAtual && (
        <div className="rounded-lg border p-4 text-sm">
          <p className="font-medium">Comparação com o preço atual</p>
          <p className="mt-1 text-muted-foreground">Atual {brl(atual)} · diferença {brl(p - atual)} ({pct((p - atual) / atual)}) · contribuição atual {brl(cAtual.valor)} ({pct(cAtual.margem)})</p>
        </div>
      )}

      {promo && (
        <div className="rounded-lg border p-4">
          <p className="text-sm font-medium">Simular desconto promocional</p>
          <div className="mt-3 grid items-end gap-4 sm:grid-cols-3">
            <Field label="Desconto" suffix="%" value={desconto} onChange={setDesconto} />
            <Stat l="Preço promocional" v={brl(promo.precoPromo)} />
            <Stat l="Contribuição na promoção" v={brl(promo.valor)} s={pct(promo.margem)} />
          </div>
          {promo.valor < 0 && <p className="mt-3 text-sm text-destructive">Com esse desconto cada venda dá prejuízo antes mesmo das despesas fixas.</p>}
        </div>
      )}

      {p && (
        <details className="rounded-lg border p-4 text-sm">
          <summary className="cursor-pointer font-medium">Análise financeira</summary>
          <div className="mt-3 space-y-2 text-muted-foreground">
            {pe ? (
              <p>Ponto de equilíbrio: <b className="text-foreground">{pe.unidades.toLocaleString("pt-BR")} peças/mês</b> ({brl(pe.faturamento)} de faturamento). Faturamento não é lucro: nesse volume o resultado é zero.</p>
            ) : (
              <p>Informe despesas fixas mensais (etapa 3) para calcular o ponto de equilíbrio. Considera apenas esta peça, sem mix de vendas.</p>
            )}
            <p>Margem de contribuição não é lucro líquido: dela ainda saem as despesas fixas{r.rateioFixas ? " (já rateadas no custo considerado)" : ""}.</p>
          </div>
        </details>
      )}
    </div>
  );
}
