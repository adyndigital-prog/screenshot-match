import {
  LayoutDashboard, Building2, Shirt, Layers, Calculator, SlidersHorizontal, Store,
  Percent, Target, History, FileText, CreditCard, type LucideIcon,
} from "lucide-react";

export type Area = { slug: string; label: string; icon: LucideIcon; desc: string; etapa: number };

// Áreas ainda não construídas (renderizadas em /app/$area como "em breve").
export const areas: Area[] = [
  { slug: "negocio", label: "Meu negócio", icon: Building2, desc: "Perfil, regime tributário, despesas fixas e metas.", etapa: 2 },
  { slug: "produtos", label: "Produtos", icon: Shirt, desc: "Peças, SKUs, coleções, grades e variantes.", etapa: 2 },
  { slug: "custos", label: "Custos e insumos", icon: Layers, desc: "Tecidos, aviamentos, mão de obra e beneficiamentos.", etapa: 3 },
  { slug: "simulador", label: "Simulador", icon: SlidersHorizontal, desc: "Compare métodos e cenários de preço e margem.", etapa: 4 },
  { slug: "canais", label: "Canais de venda", icon: Store, desc: "Preço ideal por e-commerce, marketplace, loja e atacado.", etapa: 4 },
  { slug: "promocoes", label: "Promoções", icon: Percent, desc: "Descontos, cupons, kits e liquidações.", etapa: 4 },
  { slug: "metas", label: "Equilíbrio e metas", icon: Target, desc: "Ponto de equilíbrio e lucro-alvo mensal.", etapa: 4 },
  { slug: "historico", label: "Histórico", icon: History, desc: "Todas as simulações e versões de preço.", etapa: 5 },
  { slug: "relatorios", label: "Relatórios", icon: FileText, desc: "Exportação em PDF e CSV.", etapa: 5 },
  { slug: "assinatura", label: "Conta e assinatura", icon: CreditCard, desc: "Plano, pagamento e limites.", etapa: 6 },
];

export const mainNav = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/precificacao", label: "Precificar peça", icon: Calculator },
] as const;
