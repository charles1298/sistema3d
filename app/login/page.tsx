"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${(i * 5.3 + 4) % 96}%`,
      top: `${(i * 7.1 + 3) % 94}%`,
      size: (i % 3) + 1.5,
      delay: i * 0.35,
      duration: 7 + (i % 6) * 1.5,
    })), []
  );

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

      {/* Animated gradient orbs */}
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
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, -35, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 7 }}
          className="absolute bottom-1/3 left-1/4 w-[350px] h-[350px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(91,33,182,0.18) 0%, transparent 70%)" }}
        />
      </div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Floating particles */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                background: "rgba(167,139,250,0.7)",
                boxShadow: "0 0 8px rgba(167,139,250,0.5)",
              }}
              animate={{
                y: [0, -28, 0],
                opacity: [0.15, 0.75, 0.15],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Horizontal accent lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute h-px w-[40%]"
          style={{ top: "30%", left: 0, background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)" }}
          animate={{ x: ["-100%", "300%"] }}
          transition={{ duration: 8, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute h-px w-[30%]"
          style={{ top: "65%", right: 0, background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.25), transparent)" }}
          animate={{ x: ["200%", "-200%"] }}
          transition={{ duration: 10, repeat: Infinity, repeatDelay: 6, ease: "easeInOut", delay: 3 }}
        />
      </div>

      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -20 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4"
      >
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="3D Sistema" className="w-8 h-8 object-contain" />
          <span className="text-white font-semibold text-sm tracking-tight">3D Sistema</span>
        </div>
        <div className="text-xs text-white/30 font-medium hidden sm:block">Bambu Lab A1 Mini</div>
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-10 pt-24 pb-8 lg:pt-0 lg:pb-0">

        {/* Desktop: left headline section */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: mounted ? 1 : 0, x: mounted ? 0 : -40 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="flex-1 text-center lg:text-left hidden lg:flex flex-col"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 10 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-6 w-fit"
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

          <p className="text-white/50 text-base leading-relaxed max-w-sm">
            Controle projetos, materiais e custos em um só lugar. Calculadora integrada em tempo real.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center gap-8 mt-10"
          >
            {[
              { label: "Projetos", value: "∞" },
              { label: "Materiais", value: "Multi" },
              { label: "Cálculo", value: "Real-time" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 10 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex flex-col"
              >
                <span className="text-2xl font-bold text-white">{s.value}</span>
                <span className="text-xs text-white/40 mt-0.5">{s.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Wireframe cube decoration */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: mounted ? 1 : 0 }}
            transition={{ duration: 1.5, delay: 1 }}
            className="mt-14"
          >
            <svg width="110" height="110" viewBox="0 0 120 120" fill="none">
              <motion.path
                d="M60 15 L100 37 L100 83 L60 105 L20 83 L20 37 Z"
                stroke="rgba(167,139,250,0.4)"
                strokeWidth="1"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.5, delay: 1.2, ease: "easeInOut" }}
              />
              <motion.path
                d="M60 15 L60 58 M100 37 L60 58 M20 37 L60 58 M100 83 L60 58 M20 83 L60 58 M60 105 L60 58"
                stroke="rgba(167,139,250,0.2)"
                strokeWidth="1"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.5, delay: 1.8, ease: "easeInOut" }}
              />
              {[
                [60, 15], [100, 37], [100, 83], [60, 105], [20, 83], [20, 37]
              ].map(([cx, cy], i) => (
                <motion.circle
                  key={i}
                  cx={cx} cy={cy} r="3"
                  fill="rgba(167,139,250,0.7)"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 2.8 + i * 0.08 }}
                />
              ))}
              <motion.circle
                cx="60" cy="58" r="4.5"
                fill="rgba(167,139,250,0.9)"
                style={{ filter: "drop-shadow(0 0 6px rgba(167,139,250,0.8))" }}
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.4, 1] }}
                transition={{ delay: 3.4, duration: 0.5 }}
              />
            </svg>
          </motion.div>
        </motion.div>

        {/* Mobile: compact header above form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 12 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex lg:hidden flex-col items-center text-center gap-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Sistema de Impressão 3D
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">
            Gerencie suas{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #A78BFA 0%, #7C3AED 50%, #C4B5FD 100%)" }}
            >
              impressões
            </span>
          </h2>
          <p className="text-white/40 text-sm max-w-xs">
            Controle projetos e custos em tempo real.
          </p>
        </motion.div>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 30, scale: mounted ? 1 : 0.97 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
          className="w-full max-w-sm relative"
        >
          {/* Outer glow */}
          <div
            className="absolute -inset-6 rounded-3xl blur-3xl pointer-events-none opacity-20"
            style={{ background: "radial-gradient(ellipse at center, #7C3AED 0%, transparent 70%)" }}
          />

          {/* Shimmer border */}
          <motion.div
            className="absolute -inset-[1px] rounded-3xl pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.6) 0%, rgba(255,255,255,0.04) 40%, rgba(167,139,250,0.5) 70%, rgba(124,58,237,0.3) 100%)",
              backgroundSize: "300% 300%",
            }}
            animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          />

          <div
            className="relative rounded-3xl p-8"
            style={{
              background: "rgba(9,7,18,0.92)",
              backdropFilter: "blur(28px)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.05) inset, 0 32px 80px rgba(0,0,0,0.7)",
            }}
          >
            <div className="mb-2">
              <h2 className="text-xl font-bold text-white mb-1">Entrar na conta</h2>
              <p className="text-sm text-white/40">Bem-vindo de volta</p>
            </div>

            {/* Gradient divider */}
            <div
              className="my-5 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.5), rgba(167,139,250,0.3), transparent)" }}
            />

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
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
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
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
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
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer disabled:opacity-60 mt-2 relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                  boxShadow: "0 8px 24px rgba(109,40,217,0.45), 0 0 0 1px rgba(255,255,255,0.1) inset",
                }}
              >
                {/* Button light sweep */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.12) 50%, transparent 65%)" }}
                  animate={{ x: ["-150%", "250%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3.5, ease: "easeInOut" }}
                />
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

      {/* Bottom label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: mounted ? 1 : 0 }}
        transition={{ duration: 1, delay: 0.9 }}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs text-white/20 whitespace-nowrap"
      >
        Sistema interno da equipe 3D
      </motion.p>
    </div>
  );
}
