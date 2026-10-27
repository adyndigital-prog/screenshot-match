import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Precifica Moda — Precificação inteligente para vestuário" },
      { name: "description", content: "Calcule custos, preços, margens e ponto de equilíbrio para marcas, confecções e lojas de roupa." },
      { property: "og:title", content: "Precifica Moda — Precificação inteligente para vestuário" },
      { property: "og:description", content: "Calcule custos, preços, margens e ponto de equilíbrio para marcas, confecções e lojas de roupa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const pilares = [
  ["Custeio da peça", "Tecido, aviamentos, oficina, estampa e perdas — tudo somado com clareza."],
  ["Doze métodos de preço", "Markup, margem de contribuição, custeio completo, lucro-alvo, mercado e valor."],
  ["Margem por canal", "Saiba quanto sobra no e-commerce, marketplace, loja física e atacado."],
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-xl">Precifica<span className="italic"> Moda</span></span>
        <Link to="/app" className="text-sm font-semibold underline-offset-4 hover:underline">Entrar</Link>
      </header>
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 lg:pt-28">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Para marcas, confecções e lojas de roupa</p>
        <h1 className="mt-6 max-w-4xl text-5xl leading-[1.05] lg:text-7xl">
          Preço certo em cada peça, <span className="italic">com margem de verdade.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Do metro de tecido ao preço no marketplace: calcule custos, simule cenários e decida com segurança.
        </p>
        <Link to="/app" className="mt-10 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90">
          Ver o painel de exemplo <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
      <section className="border-t">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-3">
          {pilares.map(([t, d], i) => (
            <div key={t}>
              <span className="font-display text-sm text-muted-foreground">0{i + 1}</span>
              <h2 className="mt-2 text-2xl">{t}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
