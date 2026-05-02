"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, Eye, EyeOff, CheckCircle2, Cloud, Printer } from "lucide-react";

const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-sm text-white outline-none transition-all duration-200 placeholder:text-white/25";
const inputStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "white",
};
const focusStyle = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.border = "1px solid rgba(124,58,237,0.7)";
  e.target.style.background = "rgba(124,58,237,0.08)";
  e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)";
};
const blurStyle = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.border = "1px solid rgba(255,255,255,0.12)";
  e.target.style.background = "rgba(255,255,255,0.05)";
  e.target.style.boxShadow = "none";
};

export default function ConfiguracoesPage() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrarAtual, setMostrarAtual] = useState(false);
  const [mostrarNova, setMostrarNova] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso(false);

    if (novaSenha !== confirmar) {
      setErro("As senhas não coincidem");
      return;
    }

    setSalvando(true);
    const res = await fetch("/api/auth/change-senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senhaAtual, novaSenha }),
    });
    const data = await res.json();
    setSalvando(false);

    if (!res.ok) {
      setErro(data.erro || "Erro ao alterar senha");
      return;
    }

    setSucesso(true);
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmar("");
  }

  const card = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Configurações</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          Gerencie suas preferências de conta
        </p>
      </div>

      {/* R2 Storage info */}
      <div className="rounded-2xl p-5 space-y-3" style={card}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(96,165,250,0.15)" }}>
            <Cloud size={17} style={{ color: "#60A5FA" }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Armazenamento</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Cloudflare R2 ou local</p>
          </div>
        </div>
        <div className="rounded-xl px-4 py-3 text-xs space-y-1.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p style={{ color: "rgba(255,255,255,0.5)" }}>Para ativar o Cloudflare R2, adicione essas variáveis de ambiente no Railway:</p>
          {["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME", "NEXT_PUBLIC_STORAGE_URL"].map((v) => (
            <code key={v} className="block px-2 py-1 rounded-lg font-mono" style={{ background: "rgba(255,255,255,0.06)", color: "#A78BFA" }}>
              {v}
            </code>
          ))}
        </div>
      </div>

      {/* Bambu info */}
      <div className="rounded-2xl p-5" style={card}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(52,211,153,0.15)" }}>
            <Printer size={17} style={{ color: "#34D399" }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Bambu Lab</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Configure em <span style={{ color: "#A78BFA" }}>Impressora</span> no menu lateral</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-6 space-y-5" style={card}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.2)" }}>
            <KeyRound size={17} style={{ color: "#A78BFA" }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Alterar Senha</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Mínimo 6 caracteres</p>
          </div>
        </div>

        <hr style={{ borderColor: "rgba(255,255,255,0.06)" }} />

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Senha atual */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
              Senha Atual
            </label>
            <div className="relative">
              <input
                type={mostrarAtual ? "text" : "password"}
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                placeholder="••••••••"
                required
                className={`${inputCls} pr-10`}
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
              <button
                type="button"
                onClick={() => setMostrarAtual(!mostrarAtual)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                {mostrarAtual ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Nova senha */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
              Nova Senha
            </label>
            <div className="relative">
              <input
                type={mostrarNova ? "text" : "password"}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="••••••••"
                required
                className={`${inputCls} pr-10`}
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
              <button
                type="button"
                onClick={() => setMostrarNova(!mostrarNova)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                {mostrarNova ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirmar nova senha */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <input
                type={mostrarConfirmar ? "text" : "password"}
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                placeholder="••••••••"
                required
                className={`${inputCls} pr-10`}
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                {mostrarConfirmar ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {erro && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm px-3.5 py-2.5 rounded-xl"
                style={{ color: "#F87171", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                {erro}
              </motion.p>
            )}
            {sucesso && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-sm px-3.5 py-2.5 rounded-xl"
                style={{ color: "#34D399", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}
              >
                <CheckCircle2 size={15} /> Senha alterada com sucesso!
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={salvando}
            className="w-full py-2.5 text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)", boxShadow: "0 4px 20px rgba(109,40,217,0.4)" }}
          >
            {salvando ? "Salvando..." : "Alterar Senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
