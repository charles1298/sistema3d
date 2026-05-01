"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, CheckCircle2, Package, Save, AlertCircle } from "lucide-react";

type Config = {
  valorImpressora: number;
  vidaUtilHoras: number;
  custoManutencao: number;
  margemLucro: number;
};

type Material = { id: string; nome: string; custoPorKg: number };

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const card = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(12px)",
};

const inputStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "white",
};

const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 placeholder:text-white/25";

function focusIn(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.border = "1px solid rgba(124,58,237,0.7)";
  e.target.style.background = "rgba(124,58,237,0.08)";
  e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)";
}
function focusOut(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.border = "1px solid rgba(255,255,255,0.12)";
  e.target.style.background = "rgba(255,255,255,0.05)";
  e.target.style.boxShadow = "none";
}

// ─── TabMateriais ─────────────────────────────────────────────────────────────

function TabMateriais({ materiais, setMateriais }: {
  materiais: Material[];
  setMateriais: React.Dispatch<React.SetStateAction<Material[]>>;
}) {
  const [nome, setNome] = useState("");
  const [custo, setCusto] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function adicionar() {
    if (!nome.trim() || !custo || Number(custo) <= 0) { setErro("Preencha nome e custo maior que zero."); return; }
    setSalvando(true); setErro("");
    const res = await fetch("/api/materiais", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: nome.trim(), custoPorKg: Number(custo) }),
    });
    const data = await res.json();
    setSalvando(false);
    if (!res.ok) { setErro(data.erro || "Erro ao adicionar material"); return; }
    setMateriais((prev) => [...prev, data]);
    setNome(""); setCusto("");
  }

  async function deletar(id: string, nomeMat: string) {
    if (!confirm(`Excluir material "${nomeMat}"?`)) return;
    const res = await fetch(`/api/materiais/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { alert(data.erro); return; }
    setMateriais((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-sm font-semibold text-white/70 mb-3">Adicionar filamento</p>
        <div className="flex gap-3 flex-col sm:flex-row">
          <input type="text" placeholder="Nome (ex: PLA Preto, PETG Transparente)"
            value={nome} onChange={(e) => setNome(e.target.value)} onKeyDown={(e) => e.key === "Enter" && adicionar()}
            className={`flex-1 ${inputCls}`} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>R$</span>
            <input type="number" placeholder="100,00" min="0.01" step="0.01"
              value={custo} onChange={(e) => setCusto(e.target.value)} onKeyDown={(e) => e.key === "Enter" && adicionar()}
              className="w-36 pl-8 pr-3 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 placeholder:text-white/25"
              style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          </div>
          <button onClick={adicionar} disabled={salvando}
            className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 shrink-0"
            style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)", boxShadow: "0 4px 16px rgba(109,40,217,0.35)" }}>
            <Plus size={16} />
            Adicionar
          </button>
        </div>
        <AnimatePresence>
          {erro && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="text-xs flex items-center gap-1 mt-2" style={{ color: "#F87171" }}>
              <AlertCircle size={12} /> {erro}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {materiais.length === 0 ? (
        <div className="text-center py-10 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
          Nenhum material cadastrado. Adicione um filamento acima.
        </div>
      ) : (
        <div>
          <AnimatePresence>
            {materiais.map((m) => (
              <motion.div key={m.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className="flex items-center justify-between py-3 px-1"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(124,58,237,0.15)" }}>
                    <Package size={14} style={{ color: "#A78BFA" }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{m.nome}</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {brl(m.custoPorKg)}/kg · {brl(m.custoPorKg / 1000)}/g
                    </p>
                  </div>
                </div>
                <button onClick={() => deletar(m.id, m.nome)}
                  className="p-1.5 rounded-lg transition-all cursor-pointer"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#F87171"; (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.12)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ─── TabConfiguracoes ─────────────────────────────────────────────────────────

function TabConfiguracoes({ config, setConfig }: {
  config: Config; setConfig: React.Dispatch<React.SetStateAction<Config>>;
}) {
  const [form, setForm] = useState({ ...config });
  const [salvando, setSalvando] = useState(false);
  const [ok, setOk] = useState(false);

  async function salvar() {
    setSalvando(true); setOk(false);
    const res = await fetch("/api/configuracao", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const data = await res.json();
    setSalvando(false);
    if (res.ok) { setConfig(data); setOk(true); setTimeout(() => setOk(false), 2500); }
  }

  const fields: { key: keyof Config; label: string; desc: string; prefix?: string; suffix?: string; step?: string }[] = [
    { key: "valorImpressora", label: "Valor da Impressora", desc: "Custo de aquisição da Bambu Lab A1 Mini", prefix: "R$", step: "0.01" },
    { key: "vidaUtilHoras", label: "Vida Útil Estimada", desc: "Total de horas operacionais esperadas", suffix: "horas", step: "100" },
    { key: "custoManutencao", label: "Custo de Manutenção e Energia", desc: "Custo por hora incluindo energia elétrica", prefix: "R$", suffix: "/h", step: "0.01" },
    { key: "margemLucro", label: "Margem de Lucro Desejada", desc: "Percentual de lucro sobre o custo total", suffix: "%", step: "0.5" },
  ];

  return (
    <div className="max-w-lg space-y-5">
      <div className="rounded-xl px-4 py-3" style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)" }}>
        <p className="text-sm" style={{ color: "#93C5FD" }}>
          Estas configurações afetam o cálculo de <strong className="text-blue-300">todos os novos projetos</strong>.
          Projetos já salvos mantêm os valores calculados no momento de criação.
        </p>
      </div>

      {fields.map((f) => (
        <div key={f.key}>
          <label className="block text-sm font-medium text-white/70 mb-1">{f.label}</label>
          <p className="text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>{f.desc}</p>
          <div className="relative flex items-center">
            {f.prefix && <span className="absolute left-3 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>{f.prefix}</span>}
            <input type="number" min="0" step={f.step ?? "1"} value={form[f.key]}
              onChange={(e) => setForm((p) => ({ ...p, [f.key]: Number(e.target.value) }))}
              className={`w-full py-2.5 text-sm rounded-xl outline-none transition-all duration-200 ${f.prefix ? "pl-8" : "pl-3.5"} ${f.suffix ? "pr-14" : "pr-3.5"}`}
              style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
            {f.suffix && <span className="absolute right-3 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>{f.suffix}</span>}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3 pt-2">
        <button onClick={salvar} disabled={salvando}
          className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)", boxShadow: "0 4px 16px rgba(109,40,217,0.35)" }}>
          <Save size={16} />
          {salvando ? "Salvando..." : "Salvar Configurações"}
        </button>
        <AnimatePresence>
          {ok && (
            <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="text-sm flex items-center gap-1" style={{ color: "#34D399" }}>
              <CheckCircle2 size={14} /> Configurações salvas!
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="rounded-2xl p-4 mt-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
          Pré-visualização dos valores
        </p>
        <div className="space-y-2">
          {[
            { label: "Depreciação hora-máquina", value: `${brl(form.valorImpressora / form.vidaUtilHoras)}/h` },
            { label: "Custo operacional por hora", value: `${brl(form.valorImpressora / form.vidaUtilHoras + form.custoManutencao)}/h` },
            { label: "Margem de lucro aplicada", value: `${form.margemLucro}%` },
          ].map((row) => (
            <div key={row.label} className="flex justify-between text-sm">
              <span style={{ color: "rgba(255,255,255,0.5)" }}>{row.label}</span>
              <span className="font-medium text-white">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Tab = "materiais" | "configuracoes";
type Props = { initialConfig: Config; initialMateriais: Material[] };

export default function PrecificacaoClient({ initialConfig, initialMateriais }: Props) {
  const [config, setConfig] = useState<Config>(initialConfig);
  const [materiais, setMateriais] = useState<Material[]>(initialMateriais);
  const [tab, setTab] = useState<Tab>("materiais");

  const tabs: { id: Tab; label: string }[] = [
    { id: "materiais", label: `Materiais (${materiais.length})` },
    { id: "configuracoes", label: "Configurações" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Precificação</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          Gerencie materiais e configurações de custo. Os cálculos ficam no módulo Projetos.
        </p>
      </div>

      <div className="rounded-2xl overflow-hidden" style={card}>
        <div className="flex" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-5 py-3.5 text-sm font-medium border-b-2 transition-all cursor-pointer"
              style={tab === t.id
                ? { borderBottomColor: "#7C3AED", color: "#A78BFA" }
                : { borderBottomColor: "transparent", color: "rgba(255,255,255,0.4)" }}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
              {tab === "materiais" && <TabMateriais materiais={materiais} setMateriais={setMateriais} />}
              {tab === "configuracoes" && <TabConfiguracoes config={config} setConfig={setConfig} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
