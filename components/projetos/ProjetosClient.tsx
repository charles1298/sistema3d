"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, Pencil, Trash2, ChevronLeft, CheckCircle2, Clock,
  Package, TrendingUp, Calculator, FolderOpen, AlertTriangle, FileBox,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Config = {
  valorImpressora: number;
  vidaUtilHoras: number;
  custoManutencao: number;
  margemLucro: number;
};

type Material = { id: string; nome: string; custoPorKg: number };

type Arquivo = {
  id: string;
  nome: string;
  nomeOriginal: string;
  tipo: string;
  projetoId: string | null;
};

type Projeto = {
  id: string;
  nome: string;
  descricao: string | null;
  cor: string;
  impressaoStatus: string;
  materialId: string | null;
  material: { nome: string; custoPorKg: number } | null;
  pesoGramas: number;
  tempoHoras: number;
  tempoMinutos: number;
  custoMaterial: number;
  custoOperacional: number;
  custoTotal: number;
  precoVenda: number;
  arquivoVinculadoId: string | null;
  arquivoVinculado: { id: string; nome: string; nomeOriginal: string; tipo: string } | null;
  criadoPor: { nome: string };
  criadoEm: string;
};

type CalcResult = {
  custoMaterial: number;
  depreciacaoHoraMaquina: number;
  custoOperacionalPorHora: number;
  custoOperacional: number;
  custoTotal: number;
  precoVenda: number;
  lucro: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcular(
  config: Config, custoPorKg: number, pesoGramas: number,
  tempoHoras: number, tempoMinutos: number
): CalcResult {
  const tempoDecimal = tempoHoras + tempoMinutos / 60;
  const custoMaterial = (custoPorKg / 1000) * pesoGramas;
  const depreciacaoHoraMaquina = config.valorImpressora / config.vidaUtilHoras;
  const custoOperacionalPorHora = depreciacaoHoraMaquina + config.custoManutencao;
  const custoOperacional = custoOperacionalPorHora * tempoDecimal;
  const custoTotal = custoMaterial + custoOperacional;
  const precoVenda = custoTotal * (1 + config.margemLucro / 100);
  return { custoMaterial, depreciacaoHoraMaquina, custoOperacionalPorHora, custoOperacional, custoTotal, precoVenda, lucro: precoVenda - custoTotal };
}

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtTempo = (h: number, m: number) => h > 0 ? (m > 0 ? `${h}h ${m}min` : `${h}h`) : `${m}min`;
const CORES = ["#00AE68", "#7C3AED", "#3B82F6", "#F59E0B", "#EF4444", "#06B6D4", "#EC4899"];

// ─── Shared styles ─────────────────────────────────────────────────────────────

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

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const ok = status === "produzido";
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
      style={
        ok
          ? { background: "rgba(52,211,153,0.12)", color: "#34D399", border: "1px solid rgba(52,211,153,0.25)" }
          : { background: "rgba(251,191,36,0.12)", color: "#FCD34D", border: "1px solid rgba(251,191,36,0.25)" }
      }
    >
      {ok ? <CheckCircle2 size={11} /> : <Clock size={11} />}
      {ok ? "Produzido" : "Rascunho"}
    </span>
  );
}

// ─── SummaryCard ──────────────────────────────────────────────────────────────

function SummaryCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string; icon: React.FC<{ size?: number; style?: React.CSSProperties }>;
  color: string; sub?: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02]"
      style={{ ...card, borderLeft: `4px solid ${color}` }}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-xl mb-4" style={{ backgroundColor: color + "22" }}>
        <Icon size={19} style={{ color }} />
      </div>
      <p className="text-3xl font-bold text-white tracking-tight truncate">{value}</p>
      <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
      {sub && <p className="text-xs font-medium mt-1" style={{ color }}>{sub}</p>}
    </div>
  );
}

// ─── CalculadoraPanel ─────────────────────────────────────────────────────────

function CalculadoraPanel({ config, custoPorKg, pesoGramas, tempoHoras, tempoMinutos, ready }: {
  config: Config; custoPorKg: number; pesoGramas: number;
  tempoHoras: number; tempoMinutos: number; ready: boolean;
}) {
  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8" style={{ color: "rgba(255,255,255,0.3)" }}>
        <Calculator size={32} className="mb-3 opacity-40" />
        <p className="text-sm">Preencha material, peso e tempo para ver o cálculo em tempo real</p>
      </div>
    );
  }

  const c = calcular(config, custoPorKg, pesoGramas, tempoHoras, tempoMinutos);

  const section = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Calculator size={16} style={{ color: "#A78BFA" }} />
        <p className="text-sm font-bold text-white/80 uppercase tracking-wide">Calculadora de Custos</p>
      </div>

      <div className="rounded-xl p-4 space-y-1.5" style={section}>
        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Material</p>
        <div className="flex justify-between text-sm">
          <span style={{ color: "rgba(255,255,255,0.5)" }}>Custo por kg</span>
          <span className="font-medium text-white">{brl(custoPorKg)}/kg</span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: "rgba(255,255,255,0.5)" }}>Custo por grama</span>
          <span className="font-medium text-white">{brl(custoPorKg / 1000)}/g</span>
        </div>
        <div className="flex justify-between text-sm pt-1.5 mt-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <span className="font-medium text-white/70">{pesoGramas}g de filamento</span>
          <span className="font-bold text-white">{brl(c.custoMaterial)}</span>
        </div>
      </div>

      <div className="rounded-xl p-4 space-y-1.5" style={section}>
        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Operacional</p>
        <div className="flex justify-between text-sm">
          <span style={{ color: "rgba(255,255,255,0.5)" }}>Depreciação hora-máquina</span>
          <span className="font-medium text-white">{brl(c.depreciacaoHoraMaquina)}/h</span>
        </div>
        <div className="flex justify-between text-sm">
          <span style={{ color: "rgba(255,255,255,0.5)" }}>+ Manutenção e energia</span>
          <span className="font-medium text-white">{brl(config.custoManutencao)}/h</span>
        </div>
        <div className="flex justify-between text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          <span>= Custo total por hora</span>
          <span>{brl(c.custoOperacionalPorHora)}/h</span>
        </div>
        <div className="flex justify-between text-sm pt-1.5 mt-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <span className="font-medium text-white/70">{fmtTempo(tempoHoras, tempoMinutos)} de impressão</span>
          <span className="font-bold text-white">{brl(c.custoOperacional)}</span>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex justify-between items-center px-4 py-3" style={{ background: "rgba(255,255,255,0.05)" }}>
          <span className="text-sm font-semibold text-white/70">Custo Total de Produção</span>
          <span className="text-base font-bold text-white">{brl(c.custoTotal)}</span>
        </div>
        <div className="flex justify-between items-center px-4 py-3.5" style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
          <div>
            <p className="text-sm font-bold text-white">Preço de Venda Sugerido</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Margem de {config.margemLucro}% sobre o custo</p>
          </div>
          <span className="text-xl font-black text-white">{brl(c.precoVenda)}</span>
        </div>
        <div className="flex justify-between items-center px-4 py-2.5" style={{ background: "rgba(52,211,153,0.1)" }}>
          <span className="text-sm" style={{ color: "#34D399" }}>Lucro projetado</span>
          <span className="text-sm font-bold" style={{ color: "#34D399" }}>{brl(c.lucro)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── ModalConfirmacao ─────────────────────────────────────────────────────────

function ModalConfirmacao({ motivo, onConfirm, onCancel }: {
  motivo: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative rounded-2xl w-full max-w-md p-6"
        style={{ background: "rgba(10,8,20,0.97)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(24px)", boxShadow: "0 32px 64px rgba(0,0,0,0.6)" }}
      >
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)" }}>
            <AlertTriangle size={20} style={{ color: "#FCD34D" }} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Tem certeza?</h3>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
              {motivo} Alterar esses dados afetará o histórico desta impressão.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors cursor-pointer"
            style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.98] cursor-pointer"
            style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", boxShadow: "0 4px 16px rgba(245,158,11,0.3)" }}
          >
            Sim, editar mesmo assim
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── ModalProjeto ─────────────────────────────────────────────────────────────

function ModalProjeto({ config, materiais, arquivos, editando, onClose, onSave }: {
  config: Config; materiais: Material[]; arquivos: Arquivo[];
  editando: Projeto | null; onClose: () => void; onSave: (p: Projeto) => void;
}) {
  const [nome, setNome] = useState(editando?.nome ?? "");
  const [descricao, setDescricao] = useState(editando?.descricao ?? "");
  const [cor, setCor] = useState(editando?.cor ?? "#7C3AED");
  const [impressaoStatus, setImpressaoStatus] = useState(editando?.impressaoStatus ?? "rascunho");
  const [materialId, setMaterialId] = useState(editando?.materialId ?? "");
  const [peso, setPeso] = useState(String(editando?.pesoGramas ?? ""));
  const [horas, setHoras] = useState(String(editando?.tempoHoras ?? "0"));
  const [minutos, setMinutos] = useState(String(editando?.tempoMinutos ?? "0"));
  const [arquivoVinculadoId, setArquivoVinculadoId] = useState(editando?.arquivoVinculadoId ?? "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const material = materiais.find((m) => m.id === materialId);
  const pesoNum = Number(peso) || 0;
  const horasNum = Number(horas) || 0;
  const minutosNum = Number(minutos) || 0;
  const calcReady = !!material && pesoNum > 0 && (horasNum > 0 || minutosNum > 0);

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.border = "1px solid rgba(124,58,237,0.7)";
    e.target.style.background = "rgba(124,58,237,0.08)";
    e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)";
  };
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.border = "1px solid rgba(255,255,255,0.12)";
    e.target.style.background = "rgba(255,255,255,0.05)";
    e.target.style.boxShadow = "none";
  };

  async function salvar() {
    if (!nome.trim()) { setErro("Nome do projeto é obrigatório."); return; }
    let custoMaterial = 0, custoOperacional = 0, custoTotal = 0, precoVenda = 0;
    if (calcReady && material) {
      const c = calcular(config, material.custoPorKg, pesoNum, horasNum, minutosNum);
      custoMaterial = c.custoMaterial; custoOperacional = c.custoOperacional;
      custoTotal = c.custoTotal; precoVenda = c.precoVenda;
    }
    const payload = {
      nome: nome.trim(), descricao: descricao || null, cor, impressaoStatus,
      materialId: materialId || null, pesoGramas: pesoNum, tempoHoras: horasNum,
      tempoMinutos: minutosNum, custoMaterial, custoOperacional, custoTotal, precoVenda,
      arquivoVinculadoId: arquivoVinculadoId || null,
    };
    setSalvando(true); setErro("");
    const res = await fetch(
      editando ? `/api/projetos/${editando.id}` : "/api/projetos",
      { method: editando ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
    );
    const data = await res.json();
    setSalvando(false);
    if (!res.ok) { setErro(data.erro || "Erro ao salvar."); return; }
    onSave(data);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        style={{ background: "rgba(8,7,18,0.97)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(24px)", boxShadow: "0 40px 80px rgba(0,0,0,0.7)" }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 sticky top-0 z-10"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(8,7,18,0.97)" }}
        >
          <h2 className="text-lg font-bold text-white">{editando ? "Editar Projeto" : "Novo Projeto"}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-all cursor-pointer"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "white"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0" style={{ borderTop: "none" }}>
          {/* Left: Form */}
          <div className="p-4 md:p-6 space-y-4" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.35)" }}>Dados do Projeto</p>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>Nome *</label>
              <input type="text" placeholder="Ex: Suporte para câmera" value={nome} onChange={(e) => setNome(e.target.value)}
                className={inputCls} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>Descrição</label>
              <textarea placeholder="Descreva o projeto..." value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={2}
                className={`${inputCls} resize-none`} style={inputStyle}
                onFocus={focusStyle as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
                onBlur={blurStyle as unknown as React.FocusEventHandler<HTMLTextAreaElement>} />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>Cor</label>
              <div className="flex items-center gap-2">
                {CORES.map((c) => (
                  <button key={c} type="button" onClick={() => setCor(c)}
                    className={`w-7 h-7 rounded-full cursor-pointer transition-all ${cor === c ? "scale-125 ring-2 ring-offset-2 ring-offset-transparent ring-white/40" : "opacity-70 hover:opacity-100"}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            <hr style={{ borderColor: "rgba(255,255,255,0.06)" }} />
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.35)" }}>Dados de Impressão</p>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>Material (Filamento)</label>
              <select value={materialId} onChange={(e) => setMaterialId(e.target.value)}
                className={inputCls} style={{ ...inputStyle, background: "rgba(255,255,255,0.05)" }}
                onFocus={focusStyle as unknown as React.FocusEventHandler<HTMLSelectElement>}
                onBlur={blurStyle as unknown as React.FocusEventHandler<HTMLSelectElement>}
              >
                <option value="" style={{ background: "#0F0F1A" }}>— Selecionar material —</option>
                {materiais.map((m) => (
                  <option key={m.id} value={m.id} style={{ background: "#0F0F1A" }}>{m.nome} — {brl(m.custoPorKg)}/kg</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>Peso da Peça (gramas)</label>
              <div className="relative">
                <input type="number" placeholder="85" min="0" step="0.1" value={peso} onChange={(e) => setPeso(e.target.value)}
                  className={`${inputCls} pr-10`} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>g</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>Tempo de Impressão</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input type="number" placeholder="4" min="0" max="999" value={horas} onChange={(e) => setHoras(e.target.value)}
                    className={`${inputCls} pr-10`} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>h</span>
                </div>
                <div className="relative flex-1">
                  <input type="number" placeholder="30" min="0" max="59" value={minutos} onChange={(e) => setMinutos(e.target.value)}
                    className={`${inputCls} pr-14`} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>min</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>Status</label>
              <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                <button type="button" onClick={() => setImpressaoStatus("rascunho")}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-all cursor-pointer"
                  style={impressaoStatus === "rascunho"
                    ? { background: "rgba(251,191,36,0.2)", color: "#FCD34D" }
                    : { color: "rgba(255,255,255,0.4)" }}>
                  <Clock size={14} /> Rascunho
                </button>
                <button type="button" onClick={() => setImpressaoStatus("produzido")}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-all cursor-pointer"
                  style={impressaoStatus === "produzido"
                    ? { background: "rgba(52,211,153,0.2)", color: "#34D399" }
                    : { color: "rgba(255,255,255,0.4)" }}>
                  <CheckCircle2 size={14} /> Produzido
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>Arquivo Vinculado</label>
              <select value={arquivoVinculadoId} onChange={(e) => setArquivoVinculadoId(e.target.value)}
                className={inputCls} style={{ ...inputStyle, background: "rgba(255,255,255,0.05)" }}
                onFocus={focusStyle as unknown as React.FocusEventHandler<HTMLSelectElement>}
                onBlur={blurStyle as unknown as React.FocusEventHandler<HTMLSelectElement>}
              >
                <option value="" style={{ background: "#0F0F1A" }}>— Nenhum arquivo —</option>
                {arquivos.map((a) => (
                  <option key={a.id} value={a.id} style={{ background: "#0F0F1A" }}>{a.nomeOriginal}</option>
                ))}
              </select>
            </div>

            <AnimatePresence>
              {erro && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="text-sm px-3.5 py-2.5 rounded-xl"
                  style={{ color: "#F87171", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  {erro}
                </motion.p>
              )}
            </AnimatePresence>

            <button onClick={salvar} disabled={salvando}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)", boxShadow: "0 4px 20px rgba(109,40,217,0.4)" }}>
              {salvando ? "Salvando..." : editando ? "Atualizar Projeto" : "Criar Projeto"}
            </button>
          </div>

          {/* Right: Calculadora */}
          <div className="p-4 md:p-6" style={{ background: "rgba(255,255,255,0.02)" }}>
            <CalculadoraPanel config={config} custoPorKg={material?.custoPorKg ?? 0}
              pesoGramas={pesoNum} tempoHoras={horasNum} tempoMinutos={minutosNum} ready={calcReady} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── ProjetoCard ──────────────────────────────────────────────────────────────

function ProjetoCard({ projeto, onView, onEdit, onDelete, onToggleStatus }: {
  projeto: Projeto; onView: () => void; onEdit: () => void; onDelete: () => void; onToggleStatus: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="rounded-2xl cursor-pointer overflow-hidden transition-all duration-200"
      style={{ ...card, boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
      onClick={onView}
    >
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${projeto.cor}, transparent)` }} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: projeto.cor + "22" }}>
              <FolderOpen size={18} style={{ color: projeto.cor }} />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-white text-sm truncate">{projeto.nome}</p>
              {projeto.descricao && <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{projeto.descricao}</p>}
            </div>
          </div>
          <StatusBadge status={projeto.impressaoStatus} />
        </div>

        {projeto.material && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>
            <span className="flex items-center gap-1"><Package size={11} />{projeto.material.nome}</span>
            {projeto.pesoGramas > 0 && <span>· {projeto.pesoGramas}g</span>}
            {(projeto.tempoHoras > 0 || projeto.tempoMinutos > 0) && (
              <span>· {fmtTempo(projeto.tempoHoras, projeto.tempoMinutos)}</span>
            )}
          </div>
        )}

        {projeto.custoTotal > 0 && (
          <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Custo total</p>
              <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>{brl(projeto.custoTotal)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Preço de venda</p>
              <p className="text-sm font-bold" style={{ color: "#34D399" }}>{brl(projeto.precoVenda)}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>por {projeto.criadoPor.nome}</p>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {[
              { icon: CheckCircle2, onClick: onToggleStatus, hoverColor: "#34D399", hoverBg: "rgba(52,211,153,0.12)", title: "Toggle status" },
              { icon: Pencil, onClick: onEdit, hoverColor: "#A78BFA", hoverBg: "rgba(124,58,237,0.15)", title: "Editar" },
              { icon: Trash2, onClick: onDelete, hoverColor: "#F87171", hoverBg: "rgba(239,68,68,0.12)", title: "Excluir" },
            ].map(({ icon: Icon, onClick, hoverColor, hoverBg, title }) => (
              <button key={title} onClick={onClick} title={title}
                className="p-1.5 rounded-lg transition-all cursor-pointer"
                style={{ color: "rgba(255,255,255,0.35)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = hoverColor; (e.currentTarget as HTMLElement).style.background = hoverBg; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── ProjetoDetalhe ───────────────────────────────────────────────────────────

function ProjetoDetalhe({ projeto, config, onEdit, onDelete, onToggleStatus, onBack }: {
  projeto: Projeto; config: Config; onEdit: () => void; onDelete: () => void;
  onToggleStatus: () => void; onBack: () => void;
}) {
  const temCalculo = projeto.custoTotal > 0 && !!projeto.material;
  const c = temCalculo
    ? calcular(config, projeto.material!.custoPorKg, projeto.pesoGramas, projeto.tempoHoras, projeto.tempoMinutos)
    : null;

  const btnBase = "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-sm transition-colors cursor-pointer"
          style={{ color: "rgba(255,255,255,0.45)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
        >
          <ChevronLeft size={16} /> Todos os Projetos
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={onToggleStatus} className={btnBase}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
            <CheckCircle2 size={14} />
            {projeto.impressaoStatus === "rascunho" ? "Marcar como Produzido" : "Voltar para Rascunho"}
          </button>
          <button onClick={onEdit} className={btnBase}
            style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#A78BFA" }}>
            <Pencil size={14} /> Editar
          </button>
          <button onClick={onDelete} className={btnBase}
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#F87171" }}>
            <Trash2 size={14} /> Excluir
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: projeto.cor + "22" }}>
          <FolderOpen size={24} style={{ color: projeto.cor }} />
        </span>
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white">{projeto.nome}</h1>
            <StatusBadge status={projeto.impressaoStatus} />
          </div>
          {projeto.descricao && <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{projeto.descricao}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 space-y-4" style={card}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.35)" }}>Dados da Impressão</p>
          {projeto.material ? (
            <div>
              {[
                { label: "Material", value: projeto.material.nome, icon: Package },
                { label: "Custo do kg", value: `${brl(projeto.material.custoPorKg)}/kg` },
                ...(projeto.pesoGramas > 0 ? [{ label: "Peso", value: `${projeto.pesoGramas}g` }] : []),
                ...((projeto.tempoHoras > 0 || projeto.tempoMinutos > 0) ? [{ label: "Tempo de impressão", value: fmtTempo(projeto.tempoHoras, projeto.tempoMinutos), icon: Clock }] : []),
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span className="text-sm flex items-center gap-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {row.icon && <row.icon size={14} />}{row.label}
                  </span>
                  <span className="text-sm font-medium text-white">{row.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm italic" style={{ color: "rgba(255,255,255,0.35)" }}>Nenhum dado de impressão informado. Edite o projeto para adicionar.</p>
          )}

          {projeto.arquivoVinculado && (
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <FileBox size={16} style={{ color: "rgba(255,255,255,0.4)" }} className="shrink-0" />
              <div className="min-w-0">
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Arquivo vinculado</p>
                <p className="text-sm font-medium text-white truncate">{projeto.arquivoVinculado.nomeOriginal}</p>
              </div>
            </div>
          )}
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Criado por {projeto.criadoPor.nome}</p>
        </div>

        <div className="rounded-2xl p-6" style={card}>
          {temCalculo && c ? (
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.35)" }}>Análise de Custo</p>
              <div>
                {[
                  { label: "Custo de material", value: brl(c.custoMaterial) },
                  { label: "Depreciação hora-máquina", value: `${brl(c.depreciacaoHoraMaquina)}/h` },
                  { label: "Manutenção e energia", value: `${brl(config.custoManutencao)}/h` },
                  { label: "Custo operacional total", value: brl(c.custoOperacional) },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{row.label}</span>
                    <span className="text-sm font-medium text-white">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="flex justify-between items-center px-4 py-3" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <span className="text-sm font-semibold text-white/70">Custo Total</span>
                  <span className="text-base font-bold text-white">{brl(c.custoTotal)}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-3.5" style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
                  <div>
                    <p className="text-sm font-bold text-white">Preço de Venda Sugerido</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Margem de {config.margemLucro}%</p>
                  </div>
                  <span className="text-xl font-black text-white">{brl(c.precoVenda)}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-2.5" style={{ background: "rgba(52,211,153,0.1)" }}>
                  <span className="text-sm" style={{ color: "#34D399" }}>Lucro projetado</span>
                  <span className="text-sm font-bold" style={{ color: "#34D399" }}>{brl(c.lucro)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
              <Calculator size={32} className="mb-3 opacity-40" />
              <p className="text-sm">Sem dados de custo. Edite o projeto e preencha o material, peso e tempo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Props = {
  initialConfig: Config;
  initialMateriais: Material[];
  initialArquivos: Arquivo[];
  initialProjetos: Projeto[];
};

export default function ProjetosClient({ initialConfig, initialMateriais, initialArquivos, initialProjetos }: Props) {
  const [config] = useState<Config>(initialConfig);
  const [materiais] = useState<Material[]>(initialMateriais);
  const [arquivos] = useState<Arquivo[]>(initialArquivos);
  const [projetos, setProjetos] = useState<Projeto[]>(initialProjetos);
  const [detalhe, setDetalhe] = useState<Projeto | null>(null);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editando, setEditando] = useState<Projeto | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [pendingEditTarget, setPendingEditTarget] = useState<Projeto | null>(null);
  const [filtro, setFiltro] = useState<"todos" | "rascunho" | "produzido">("todos");

  const produzidos = projetos.filter((p) => p.impressaoStatus === "produzido");
  const rascunhos = projetos.filter((p) => p.impressaoStatus === "rascunho");
  const receitaTotal = produzidos.reduce((s, p) => s + p.precoVenda, 0);
  const projetosFiltrados = filtro === "todos" ? projetos : projetos.filter((p) => p.impressaoStatus === filtro);

  function precisaConfirmacao(p: Projeto) {
    return p.impressaoStatus === "produzido" || !!p.arquivoVinculadoId;
  }

  function requestEdit(p: Projeto) {
    if (precisaConfirmacao(p)) { setPendingEditTarget(p); setConfirmando(true); }
    else { setEditando(p); setModal("edit"); }
  }

  function confirmarEdicao() {
    setConfirmando(false); setEditando(pendingEditTarget); setPendingEditTarget(null); setModal("edit");
  }

  async function handleToggleStatus(p: Projeto) {
    const novoStatus = p.impressaoStatus === "rascunho" ? "produzido" : "rascunho";
    const res = await fetch(`/api/projetos/${p.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...p, impressaoStatus: novoStatus }),
    });
    if (res.ok) {
      const updated = await res.json();
      setProjetos((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
      if (detalhe?.id === p.id) setDetalhe(updated);
    }
  }

  async function handleDelete(p: Projeto) {
    if (!confirm(`Excluir o projeto "${p.nome}" permanentemente?`)) return;
    const res = await fetch(`/api/projetos/${p.id}`, { method: "DELETE" });
    if (res.ok) { setProjetos((prev) => prev.filter((x) => x.id !== p.id)); if (detalhe?.id === p.id) setDetalhe(null); }
  }

  function handleSave(saved: Projeto) {
    setProjetos((prev) => editando ? prev.map((x) => (x.id === saved.id ? saved : x)) : [saved, ...prev]);
    if (detalhe?.id === saved.id) setDetalhe(saved);
    setModal(null); setEditando(null);
  }

  const motivoConfirmacao = pendingEditTarget
    ? pendingEditTarget.arquivoVinculadoId
      ? "Este projeto possui um arquivo vinculado."
      : "Este projeto já está marcado como Produzido."
    : "";

  if (detalhe) {
    const current = projetos.find((p) => p.id === detalhe.id) ?? detalhe;
    return (
      <>
        <ProjetoDetalhe projeto={current} config={config} onBack={() => setDetalhe(null)}
          onEdit={() => requestEdit(current)} onDelete={() => handleDelete(current)}
          onToggleStatus={() => handleToggleStatus(current)} />
        {modal === "edit" && editando && (
          <ModalProjeto config={config} materiais={materiais} arquivos={arquivos} editando={editando}
            onClose={() => { setModal(null); setEditando(null); }} onSave={handleSave} />
        )}
        {confirmando && (
          <ModalConfirmacao motivo={motivoConfirmacao} onConfirm={confirmarEdicao}
            onCancel={() => { setConfirmando(false); setPendingEditTarget(null); }} />
        )}
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Projetos</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Hub central de todas as impressões 3D</p>
        </div>
        <button
          onClick={() => { setEditando(null); setModal("create"); }}
          className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.98] cursor-pointer shrink-0"
          style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)", boxShadow: "0 4px 16px rgba(109,40,217,0.4)" }}
        >
          <Plus size={16} /> Novo Projeto
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total de Projetos" value={String(projetos.length)} icon={FolderOpen} color="#A78BFA" />
        <SummaryCard label="Rascunho" value={String(rascunhos.length)} icon={Clock} color="#FCD34D"
          sub={projetos.length > 0 ? `${Math.round((rascunhos.length / projetos.length) * 100)}% do total` : undefined} />
        <SummaryCard label="Produzido" value={String(produzidos.length)} icon={CheckCircle2} color="#34D399"
          sub={projetos.length > 0 ? `${Math.round((produzidos.length / projetos.length) * 100)}% do total` : undefined} />
        <SummaryCard label="Receita Projetada" value={brl(receitaTotal)} icon={TrendingUp} color="#60A5FA" sub="peças produzidas" />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {(["todos", "rascunho", "produzido"] as const).map((f) => (
          <button key={f} onClick={() => setFiltro(f)}
            className="px-3 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer"
            style={filtro === f
              ? { background: "rgba(124,58,237,0.25)", color: "#A78BFA", border: "1px solid rgba(124,58,237,0.4)" }
              : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.08)" }
            }
          >
            {f === "todos" ? "Todos" : f === "rascunho" ? "Rascunho" : "Produzido"}
          </button>
        ))}
        <span className="text-xs ml-2" style={{ color: "rgba(255,255,255,0.3)" }}>{projetosFiltrados.length} projeto(s)</span>
      </div>

      {/* Projects grid */}
      {projetos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl" style={card}>
          <FolderOpen size={40} className="mb-3" style={{ color: "rgba(255,255,255,0.15)" }} />
          <p className="font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>Nenhum projeto ainda</p>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>Clique em "Novo Projeto" para começar</p>
        </div>
      ) : projetosFiltrados.length === 0 ? (
        <div className="flex items-center justify-center py-16 rounded-2xl" style={card}>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Nenhum projeto com status "{filtro}"</p>
        </div>
      ) : (
        <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projetosFiltrados.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <ProjetoCard projeto={p} onView={() => setDetalhe(p)} onEdit={() => requestEdit(p)}
                onDelete={() => handleDelete(p)} onToggleStatus={() => handleToggleStatus(p)} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {modal === "create" && (
        <ModalProjeto config={config} materiais={materiais} arquivos={arquivos} editando={null}
          onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {modal === "edit" && editando && (
        <ModalProjeto config={config} materiais={materiais} arquivos={arquivos} editando={editando}
          onClose={() => { setModal(null); setEditando(null); }} onSave={handleSave} />
      )}
      {confirmando && (
        <ModalConfirmacao motivo={motivoConfirmacao} onConfirm={confirmarEdicao}
          onCancel={() => { setConfirmando(false); setPendingEditTarget(null); }} />
      )}
    </div>
  );
}
