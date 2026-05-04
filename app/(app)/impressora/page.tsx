"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Printer, Wifi, WifiOff, RefreshCw, LogOut, Eye, EyeOff, CheckCircle2, AlertCircle, Clock, Zap } from "lucide-react";

type Device = {
  dev_id: string;
  name: string;
  online: boolean;
  print_status: string;
  nozzle_diameter?: number;
  dev_product_name?: string;
};

type StatusResponse = {
  conectado: boolean;
  email?: string;
  expirado?: boolean;
  erro?: string;
  dispositivos: Device[];
};

const STATUS_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  IDLE:     { text: "#A78BFA", bg: "rgba(124,58,237,0.1)",  border: "rgba(124,58,237,0.3)"  },
  RUNNING:  { text: "#34D399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.3)"  },
  PAUSE:    { text: "#FCD34D", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.3)"  },
  PAUSED:   { text: "#FCD34D", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.3)"  },
  FAILED:   { text: "#F87171", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)"   },
  FINISH:   { text: "#60A5FA", bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.3)"  },
  FINISHED: { text: "#60A5FA", bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.3)"  },
  PREPARE:  { text: "#FCD34D", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.3)"  },
};

const STATUS_LABELS: Record<string, string> = {
  IDLE: "Aguardando", RUNNING: "Imprimindo", PAUSE: "Pausada",
  PAUSED: "Pausada", FAILED: "Falha", FINISH: "Concluído",
  FINISHED: "Concluído", PREPARE: "Preparando",
};

const card = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(12px)",
};

const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-sm text-white outline-none transition-all duration-200 placeholder:text-white/25";
const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "white" };

function focusBorder(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.border = "1px solid rgba(124,58,237,0.7)";
  e.target.style.background = "rgba(124,58,237,0.08)";
  e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)";
}
function blurBorder(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.border = "1px solid rgba(255,255,255,0.12)";
  e.target.style.background = "rgba(255,255,255,0.05)";
  e.target.style.boxShadow = "none";
}

export default function ImpressoraPage() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [conectando, setConectando] = useState(false);
  const [erro, setErro] = useState("");
  const [ultimaAtt, setUltimaAtt] = useState<Date | null>(null);
  const [precisaCodigo, setPrecisaCodigo] = useState(false);
  const [codigo, setCodigo] = useState("");

  const buscarStatus = useCallback(async (silencioso = false) => {
    if (!silencioso) setAtualizando(true);
    try {
      const res = await fetch("/api/bambu/status");
      const data = await res.json();
      setStatus(data);
      setUltimaAtt(new Date());
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    buscarStatus();
    const interval = setInterval(() => buscarStatus(true), 30_000);
    return () => clearInterval(interval);
  }, [buscarStatus]);

  async function conectar(e: React.FormEvent) {
    e.preventDefault();
    setConectando(true);
    setErro("");
    const body = precisaCodigo
      ? { email, password: senha, verifyCode: codigo }
      : { email, password: senha };
    const res = await fetch("/api/bambu/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setConectando(false);
    if (!res.ok) {
      setErro(data.erro || "Erro ao conectar");
      return;
    }
    if (data.needsCode) {
      setPrecisaCodigo(true);
      setCodigo("");
      setErro("");
      return;
    }
    setSenha(""); setEmail(""); setCodigo(""); setPrecisaCodigo(false); setErro("");
    buscarStatus();
  }

  async function desconectar() {
    if (!confirm("Desconectar da Bambu Lab?")) return;
    await fetch("/api/bambu/connect", { method: "DELETE" });
    buscarStatus();
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Impressora</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            Monitor em tempo real via Bambu Cloud
          </p>
        </div>
        {status?.conectado && (
          <button
            onClick={() => buscarStatus()}
            disabled={atualizando}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition-all cursor-pointer disabled:opacity-50"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
          >
            <RefreshCw size={14} className={atualizando ? "animate-spin" : ""} />
            Atualizar
          </button>
        )}
      </div>

      {!status?.conectado ? (
        <div className="rounded-2xl p-6 space-y-5 max-w-md" style={card}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.2)" }}>
              <Printer size={19} style={{ color: "#A78BFA" }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Conectar à Bambu Lab</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                {status?.expirado ? "Token expirado — reconecte" : "Use sua conta do aplicativo Bambu Handy"}
              </p>
            </div>
          </div>

          <hr style={{ borderColor: "rgba(255,255,255,0.06)" }} />

          <form onSubmit={conectar} className="space-y-4">
            {!precisaCodigo ? (
              <>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com" required className={inputCls} style={inputStyle}
                    onFocus={focusBorder} onBlur={blurBorder} />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>Senha</label>
                  <div className="relative">
                    <input type={mostrarSenha ? "text" : "password"} value={senha} onChange={(e) => setSenha(e.target.value)}
                      placeholder="••••••••" required className={`${inputCls} pr-10`} style={inputStyle}
                      onFocus={focusBorder} onBlur={blurBorder} />
                    <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                      style={{ color: "rgba(255,255,255,0.3)" }}>
                      {mostrarSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl mb-4 text-xs"
                  style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)", color: "#93C5FD" }}>
                  <CheckCircle2 size={14} />
                  Bambu enviou um código de 6 dígitos para <strong>{email}</strong>
                </div>
                <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Código de verificação
                </label>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  required
                  maxLength={6}
                  className={`${inputCls} tracking-[0.5em] text-center text-lg font-bold`}
                  style={inputStyle}
                  onFocus={focusBorder}
                  onBlur={blurBorder}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => { setPrecisaCodigo(false); setCodigo(""); setErro(""); }}
                  className="mt-2 text-xs cursor-pointer"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  ← Voltar
                </button>
              </div>
            )}

            <AnimatePresence>
              {erro && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="text-sm px-3.5 py-2.5 rounded-xl"
                  style={{ color: "#F87171", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  {erro}
                </motion.p>
              )}
            </AnimatePresence>

            <button type="submit" disabled={conectando || (precisaCodigo && codigo.length < 6)}
              className="w-full py-2.5 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)", boxShadow: "0 4px 20px rgba(109,40,217,0.4)" }}>
              {conectando ? "Verificando..." : precisaCodigo ? "Confirmar código" : "Conectar"}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Connection header */}
          <div className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap" style={card}>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_#34D399]" />
              <div>
                <p className="text-sm font-semibold text-white">Conectado à Bambu Lab</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {status.email}
                  {ultimaAtt && ` · Atualizado ${ultimaAtt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`}
                </p>
              </div>
            </div>
            <button onClick={desconectar}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer"
              style={{ color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#F87171"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.3)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
            >
              <LogOut size={13} /> Desconectar
            </button>
          </div>

          {/* Devices */}
          {status.dispositivos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl" style={card}>
              <Printer size={36} className="mb-3" style={{ color: "rgba(255,255,255,0.15)" }} />
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Nenhuma impressora encontrada na conta</p>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>Verifique se sua impressora está vinculada ao Bambu Handy</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {status.dispositivos.map((dev) => {
                const statusKey = (dev.print_status ?? "IDLE").toUpperCase();
                const sc = STATUS_COLORS[statusKey] ?? STATUS_COLORS.IDLE;
                const label = STATUS_LABELS[statusKey] ?? dev.print_status;
                return (
                  <motion.div key={dev.dev_id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl p-5 space-y-4" style={{ ...card, boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.25)" }}>
                          <Printer size={18} style={{ color: "#A78BFA" }} />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{dev.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                            {dev.dev_product_name ?? "Bambu Lab"}
                          </p>
                        </div>
                      </div>
                      <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0"
                        style={{ backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                        {statusKey === "RUNNING" ? <Zap size={11} /> : statusKey === "FAILED" ? <AlertCircle size={11} /> : <Clock size={11} />}
                        {label}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 pt-3"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="flex items-center gap-2">
                        {dev.online
                          ? <Wifi size={14} style={{ color: "#34D399" }} />
                          : <WifiOff size={14} style={{ color: "rgba(255,255,255,0.3)" }} />}
                        <span className="text-xs" style={{ color: dev.online ? "#34D399" : "rgba(255,255,255,0.3)" }}>
                          {dev.online ? "Online" : "Offline"}
                        </span>
                      </div>
                      {dev.nozzle_diameter && (
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                          Bico Ø{dev.nozzle_diameter}mm
                        </span>
                      )}
                      {statusKey === "RUNNING" && (
                        <span className="flex items-center gap-1 text-xs ml-auto" style={{ color: "#34D399" }}>
                          <CheckCircle2 size={12} /> Em impressão
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {status.erro && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
              style={{ color: "#F87171", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle size={15} /> {status.erro}
            </div>
          )}

          <p className="text-xs text-center pt-2" style={{ color: "rgba(255,255,255,0.2)" }}>
            Atualiza automaticamente a cada 30 segundos
          </p>
        </div>
      )}
    </div>
  );
}
