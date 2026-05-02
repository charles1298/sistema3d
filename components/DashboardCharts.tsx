"use client";

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

type MesData = { mes: string; projetos: number; receita: number };
type TipoData = { name: string; value: number };
type StatusData = { name: string; value: number; fill: string };

type Props = {
  mesesData: MesData[];
  tiposData: TipoData[];
  statusData: StatusData[];
};

const card = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(12px)",
};

const TIPO_COLORS = ["#A78BFA", "#34D399", "#60A5FA", "#FCD34D", "#F87171"];

const tooltipStyle = {
  contentStyle: {
    background: "rgba(10,8,20,0.95)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    color: "white",
    fontSize: "12px",
  },
  labelStyle: { color: "rgba(255,255,255,0.6)" },
  cursor: { fill: "rgba(255,255,255,0.03)" },
};

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function CustomTooltipReceita({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ ...tooltipStyle.contentStyle, padding: "10px 14px" }}>
      <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 4, fontSize: 11 }}>{label}</p>
      <p style={{ color: "#34D399", fontWeight: 600 }}>{brl(payload[0].value)}</p>
    </div>
  );
}

function CustomTooltipProjetos({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ ...tooltipStyle.contentStyle, padding: "10px 14px" }}>
      <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 4, fontSize: 11 }}>{label}</p>
      <p style={{ color: "#A78BFA", fontWeight: 600 }}>{payload[0].value} projeto{payload[0].value !== 1 ? "s" : ""}</p>
    </div>
  );
}

export default function DashboardCharts({ mesesData, tiposData, statusData }: Props) {
  const totalProjetos = statusData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-4">
      {/* Row 1: area chart + pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Receita por mês — area */}
        <div className="lg:col-span-2 rounded-2xl p-5" style={card}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>
            Receita Acumulada (6 meses)
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={mesesData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="receitaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34D399" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="mes" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `R$${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`}
                tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} axisLine={false} tickLine={false} width={44} />
              <Tooltip content={<CustomTooltipReceita />} />
              <Area type="monotone" dataKey="receita" stroke="#34D399" strokeWidth={2} fill="url(#receitaGrad)" dot={false} activeDot={{ r: 4, fill: "#34D399" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status donut */}
        <div className="rounded-2xl p-5" style={card}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>
            Status dos Projetos
          </p>
          {totalProjetos === 0 ? (
            <div className="flex items-center justify-center h-[180px]" style={{ color: "rgba(255,255,255,0.25)" }}>
              <p className="text-xs">Nenhum projeto</p>
            </div>
          ) : (
            <div className="relative">
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={60}
                    paddingAngle={3} dataKey="value" stroke="none">
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle.contentStyle} />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex flex-col gap-1.5 mt-2">
                {statusData.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.fill }} />
                      <span style={{ color: "rgba(255,255,255,0.5)" }}>{s.name}</span>
                    </div>
                    <span className="font-medium" style={{ color: s.fill }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: bar chart + tipos donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Projetos por mês */}
        <div className="lg:col-span-2 rounded-2xl p-5" style={card}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>
            Projetos por Mês (6 meses)
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={mesesData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barSize={20}>
              <XAxis dataKey="mes" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} axisLine={false} tickLine={false} width={20} allowDecimals={false} />
              <Tooltip content={<CustomTooltipProjetos />} cursor={tooltipStyle.cursor} />
              <Bar dataKey="projetos" fill="#7C3AED" radius={[4, 4, 0, 0]}
                style={{ filter: "drop-shadow(0 0 6px rgba(124,58,237,0.4))" }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tipos de arquivo */}
        <div className="rounded-2xl p-5" style={card}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>
            Tipos de Arquivo
          </p>
          {tiposData.length === 0 ? (
            <div className="flex items-center justify-center h-[160px]" style={{ color: "rgba(255,255,255,0.25)" }}>
              <p className="text-xs">Nenhum arquivo</p>
            </div>
          ) : (
            <div>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={tiposData} cx="50%" cy="50%" innerRadius={32} outerRadius={50}
                    paddingAngle={3} dataKey="value" stroke="none">
                    {tiposData.map((_, i) => <Cell key={i} fill={TIPO_COLORS[i % TIPO_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle.contentStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5 mt-2">
                {tiposData.map((t, i) => (
                  <div key={t.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: TIPO_COLORS[i % TIPO_COLORS.length] }} />
                      <span style={{ color: "rgba(255,255,255,0.5)" }}>{t.name}</span>
                    </div>
                    <span className="font-medium text-white">{t.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
