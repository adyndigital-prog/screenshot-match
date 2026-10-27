import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { brl, pct } from "@/lib/pricing/engine";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Precifica Moda" },
      { name: "description", content: "Visão geral de preços, margens e alertas da sua marca." },
      { property: "og:title", content: "Dashboard — Precifica Moda" },
      { property: "og:description", content: "Visão geral de preços, margens e alertas da sua marca." },
    ],
  }),
  component: Dashboard,
});

const exemplos = [
  { nome: "Legging Compressão", custo: 38.4, preco: 129.9, margem: 0.31 },
  { nome: "Top Nadador", custo: 24.1, preco: 89.9, margem: 0.27 },
  { nome: "Camiseta Básica", custo: 21.5, preco: 59.9, margem: 0.12 },
  { nome: "Vestido Midi", custo: 72.0, preco: 249.9, margem: 0.34 },
  { nome: "Short Saia", custo: 29.8, preco: 69.9, margem: -0.03 },
];

const kpis = [
  { l: "Produtos cadastrados", v: "5" },
  { l: "Margem média", v: pct(0.202) },
  { l: "Abaixo da meta (20%)", v: "2" },
  { l: "Contribuição negativa", v: "1" },
];

function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="rounded-full bg-warning/20 px-2.5 py-0.5 text-xs font-semibold text-foreground">Exemplo · dados demonstrativos</span>
          <h1 className="mt-3 text-4xl">Dashboard</h1>
        </div>
        <Link to="/app/precificacao" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          Precificar nova peça <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.l} className="rounded-lg border bg-card p-5">
            <p className="text-xs text-muted-foreground">{k.l}</p>
            <p className="mt-2 font-display text-3xl">{k.v}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-lg border bg-card p-5 lg:col-span-3">
          <h2 className="text-lg">Custo x preço por peça</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <BarChart data={exemplos}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="nome" tick={{ fontSize: 11 }} interval={0} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => brl(v)} />
                <Bar dataKey="custo" name="Custo" fill="var(--chart-2)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="preco" name="Preço" fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-5 lg:col-span-2">
          <h2 className="text-lg">Alertas</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {exemplos.filter((e) => e.margem < 0.2).map((e) => (
              <li key={e.nome} className="flex gap-3">
                <AlertTriangle className={`h-4 w-4 shrink-0 ${e.margem < 0 ? "text-destructive" : "text-warning"}`} />
                <span><b>{e.nome}</b> — margem {pct(e.margem)}{e.margem < 0 ? ": contribuição negativa" : ": abaixo da meta"}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs text-muted-foreground">
            <tr><th className="p-3">Peça</th><th className="p-3 text-right">Custo</th><th className="p-3 text-right">Preço</th><th className="p-3 text-right">Margem líquida</th></tr>
          </thead>
          <tbody>
            {exemplos.map((e) => (
              <tr key={e.nome} className="border-t">
                <td className="p-3">{e.nome}</td>
                <td className="p-3 text-right">{brl(e.custo)}</td>
                <td className="p-3 text-right">{brl(e.preco)}</td>
                <td className={`p-3 text-right font-semibold ${e.margem < 0 ? "text-destructive" : e.margem < 0.2 ? "text-warning" : "text-success"}`}>{pct(e.margem)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
