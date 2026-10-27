import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { areas, mainNav } from "@/lib/nav";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

const linkCls =
  "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";
const activeCls = "bg-sidebar-accent text-sidebar-accent-foreground font-semibold";

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 p-3">
      {mainNav.map((i) => (
        <Link key={i.to} to={i.to} activeOptions={{ exact: true }} className={linkCls} activeProps={{ className: activeCls }} onClick={onNavigate}>
          <i.icon className="h-4 w-4" /> {i.label}
        </Link>
      ))}
      <p className="mt-4 px-3 pb-1 text-[11px] uppercase tracking-widest text-sidebar-foreground/50">Gestão</p>
      {areas.map((a) => (
        <Link key={a.slug} to="/app/$area" params={{ area: a.slug }} className={linkCls} activeProps={{ className: activeCls }} onClick={onNavigate}>
          <a.icon className="h-4 w-4" /> {a.label}
        </Link>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/" className="block px-6 py-5 font-display text-xl text-sidebar-primary">
      Precifica<span className="italic"> Moda</span>
    </Link>
  );
}

function AppLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="hidden w-64 shrink-0 bg-sidebar lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto"><Brand /><Nav /></div>
      </aside>
      <header className="flex items-center justify-between bg-sidebar lg:hidden">
        <Brand />
        <button aria-label="Abrir menu" onClick={() => setOpen(!open)} className="p-4 text-sidebar-primary">
          {open ? <X /> : <Menu />}
        </button>
      </header>
      {open && <div className="bg-sidebar lg:hidden"><Nav onNavigate={() => setOpen(false)} /></div>}
      <main className="flex-1 px-5 py-8 lg:px-10"><Outlet /></main>
    </div>
  );
}
