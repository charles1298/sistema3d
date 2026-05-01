import { prisma } from "@/lib/prisma";
import { getSessao } from "@/lib/auth";
import { FolderOpen, CheckCircle2, Clock, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const sessao = await getSessao();

  const [totalProjetos, totalRascunho, totalProduzido, ultimosProjetos] =
    await Promise.all([
      prisma.projeto.count(),
      prisma.projeto.count({ where: { impressaoStatus: "rascunho" } }),
      prisma.projeto.count({ where: { impressaoStatus: "produzido" } }),
      prisma.projeto.findMany({
        take: 5,
        orderBy: { atualizadoEm: "desc" },
        include: {
          criadoPor: { select: { nome: true } },
          material: { select: { nome: true } },
        },
      }),
    ]);

  const receitaProjetada = await prisma.projeto.aggregate({
    where: { impressaoStatus: "produzido" },
    _sum: { precoVenda: true },
  });

  const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const stats = [
    { label: "Total de Projetos", valor: String(totalProjetos), icon: FolderOpen, cor: "#A78BFA" },
    { label: "Rascunho", valor: String(totalRascunho), icon: Clock, cor: "#FCD34D" },
    { label: "Produzido", valor: String(totalProduzido), icon: CheckCircle2, cor: "#34D399" },
    { label: "Receita Projetada", valor: brl(receitaProjetada._sum.precoVenda ?? 0), icon: TrendingUp, cor: "#60A5FA" },
  ];

  const statusCfg: Record<string, { label: string; bg: string; text: string; border: string }> = {
    rascunho: { label: "Rascunho", bg: "rgba(251,191,36,0.1)", text: "#FCD34D", border: "rgba(251,191,36,0.25)" },
    produzido: { label: "Produzido", bg: "rgba(52,211,153,0.1)", text: "#34D399", border: "rgba(52,211,153,0.25)" },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Olá, {sessao?.nome?.split(" ")[0]}
        </h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          Visão geral do sistema de impressão 3D
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-4 md:p-5 transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `1px solid rgba(255,255,255,0.08)`,
              borderLeft: `4px solid ${s.cor}`,
              backdropFilter: "blur(12px)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            }}
          >
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl mb-4"
              style={{ backgroundColor: s.cor + "20" }}
            >
              <s.icon size={19} style={{ color: s.cor }} />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-white tracking-tight">{s.valor}</p>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent projects */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 className="text-sm font-semibold text-white">Projetos Recentes</h2>
        </div>
        {ultimosProjetos.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
            Nenhum projeto criado ainda
          </div>
        ) : (
          <div>
            {ultimosProjetos.map((p) => {
              const st = statusCfg[p.impressaoStatus] ?? {
                label: p.impressaoStatus,
                bg: "rgba(255,255,255,0.08)",
                text: "rgba(255,255,255,0.6)",
                border: "rgba(255,255,255,0.15)",
              };
              return (
                <div
                  key={p.id}
                  className="px-6 py-3.5 flex items-center justify-between gap-4 transition-colors hover:bg-white/[0.03]"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.cor }} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{p.nome}</p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.35)" }}>
                        {p.material ? p.material.nome : "Sem material"} · {p.criadoPor.nome}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {p.precoVenda > 0 && (
                      <span className="text-sm font-bold" style={{ color: "#34D399" }}>
                        {brl(p.precoVenda)}
                      </span>
                    )}
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: st.bg, color: st.text, border: `1px solid ${st.border}` }}
                    >
                      {st.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
