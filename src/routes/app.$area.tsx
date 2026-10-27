import { createFileRoute, notFound } from "@tanstack/react-router";
import { areas } from "@/lib/nav";

export const Route = createFileRoute("/app/$area")({
  loader: ({ params }) => {
    const a = areas.find((x) => x.slug === params.area);
    if (!a) throw notFound();
    return { slug: a.slug };
  },
  head: ({ params }) => {
    const a = areas.find((x) => x.slug === params.area);
    const t = `${a?.label ?? "Área"} — Precifica Moda`;
    return { meta: [{ title: t }, { name: "description", content: a?.desc ?? "" }, { property: "og:title", content: t }, { property: "og:description", content: a?.desc ?? "" }] };
  },
  component: AreaPage,
  notFoundComponent: () => <p className="text-muted-foreground">Área não encontrada.</p>,
  errorComponent: () => <p className="text-destructive">Não foi possível carregar esta área.</p>,
});

function AreaPage() {
  const { slug } = Route.useLoaderData();
  const a = areas.find((x) => x.slug === slug)!;
  return (
    <div className="mx-auto max-w-2xl py-16 text-center">
      <a.icon className="mx-auto h-10 w-10 text-muted-foreground" />
      <h1 className="mt-4 text-3xl">{a.label}</h1>
      <p className="mt-2 text-muted-foreground">{a.desc}</p>
      <span className="mt-6 inline-block rounded-full border px-3 py-1 text-xs text-muted-foreground">Em breve · etapa {a.etapa}</span>
    </div>
  );
}
