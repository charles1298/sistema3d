"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const data = await res.json();
    setCarregando(false);

    if (!res.ok) {
      setErro(data.erro || "Erro ao fazer login");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#07070F]">

      {/* ── Animated gradient orbs ── */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(109,40,217,0.35) 0%, transparent 70%)" }}
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-40 -right-20 w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)" }}
        />
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)" }}
        />
      </div>

      {/* ── Subtle grid ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Top bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -20 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-5"
      >
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 shrink-0">
            <Image src="/logo.png" alt="3D Sistema" fill className="object-contain drop-shadow-lg" />
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">3D Sistema</span>
        </div>
        <div className="text-xs text-white/30 font-medium">Bambu Lab A1 Mini</div>
      </motion.div>

      {/* ── Main content ── */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">

        {/* Left: headline */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: mounted ? 1 : 0, x: mounted ? 0 : -40 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="flex-1 text-center lg:text-left"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 10 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Sistema de Impressão 3D
          </motion.div>

          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-4">
            Gerencie suas{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #A78BFA 0%, #7C3AED 50%, #C4B5FD 100%)" }}
            >
              impressões
            </span>
            {" "}com precisão
          </h1>

          <p className="text-white/50 text-base leading-relaxed max-w-sm mx-auto lg:mx-0">
            Controle projetos, materiais e custos em um só lugar. Calculadora integrada em tempo real.
          </p>

          {/* Floating stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="hidden lg:flex items-center gap-6 mt-10"
          >
            {[
              { label: "Projetos", value: "∞" },
              { label: "Materiais", value: "Multi" },
              { label: "Cálculo", value: "Real-time" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col">
                <span className="text-2xl font-bold text-white">{s.value}</span>
                <span className="text-xs text-white/40 mt-0.5">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: login card */}
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.97 }}
          animate={{ opacity: mounted ? 1 : 0, x: mounted ? 0 : 40, scale: mounted ? 1 : 0.97 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          className="w-full max-w-sm"
        >
          {/* Card glow */}
          <div className="absolute inset-0 rounded-3xl blur-2xl opacity-30 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, #7C3AED 0%, transparent 70%)" }}
          />

          <div
            className="relative rounded-3xl p-8 border border-white/10"
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.06) inset, 0 32px 64px rgba(0,0,0,0.5)",
            }}
          >
            <div className="mb-7">
              <h2 className="text-xl font-bold text-white mb-1">Entrar na conta</h2>
              <p className="text-sm text-white/40">Bem-vindo de volta</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "1px solid rgba(124,58,237,0.7)";
                    e.target.style.background = "rgba(124,58,237,0.08)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid rgba(255,255,255,0.1)";
                    e.target.style.background = "rgba(255,255,255,0.05)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">Senha</label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "1px solid rgba(124,58,237,0.7)";
                    e.target.style.background = "rgba(124,58,237,0.08)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid rgba(255,255,255,0.1)";
                    e.target.style.background = "rgba(255,255,255,0.05)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <AnimatePresence>
                {erro && (
                  <motion.p
                    initial={{ opacity: 0, y: -6, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -6, height: 0 }}
                    className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl"
                  >
                    {erro}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={carregando}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer disabled:opacity-60 mt-2"
                style={{
                  background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                  boxShadow: "0 8px 24px rgba(109,40,217,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset",
                }}
              >
                {carregando ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Entrar <ArrowRight size={15} />
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>

      {/* ── Bottom label ── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: mounted ? 1 : 0 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/20"
      >
        Sistema interno da equipe 3D
      </motion.p>
    </div>
  );
}
