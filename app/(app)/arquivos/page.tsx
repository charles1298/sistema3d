"use client";

import { useEffect, useState, useRef } from "react";
import { Upload, FileBox, Download, Trash2, X, FileCode2, Box } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Arquivo = {
  id: string;
  nomeOriginal: string;
  nome: string;
  tamanho: number;
  tipo: string;
  thumbnailNome: string | null;
  enviadoEm: string;
  projeto: { nome: string; cor: string } | null;
  usuario: { nome: string };
};

type Projeto = { id: string; nome: string; cor: string };

function formatarTamanho(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function ext(nome: string) {
  return nome.split(".").pop()?.toUpperCase() ?? "";
}

function is3mf(nome: string) {
  return nome.toLowerCase().endsWith(".3mf");
}

const inputClass = "w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200";
const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" };

export default function ArquivosPage() {
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modal, setModal] = useState(false);
  const [projetoId, setProjetoId] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [arrastando, setArrastando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function carregar() {
    const [arqRes, projRes] = await Promise.all([
      fetch("/api/arquivos"),
      fetch("/api/projetos"),
    ]);
    setArquivos(await arqRes.json());
    setProjetos(await projRes.json());
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  async function enviarArquivo(e: React.FormEvent) {
    e.preventDefault();
    if (!arquivo) return;
    setEnviando(true);
    const formData = new FormData();
    formData.append("arquivo", arquivo);
    if (projetoId) formData.append("projetoId", projetoId);
    await fetch("/api/arquivos", { method: "POST", body: formData });
    setEnviando(false);
    setModal(false);
    setArquivo(null);
    setProjetoId("");
    carregar();
  }

  async function deletarArquivo(id: string) {
    if (!confirm("Remover este arquivo?")) return;
    await fetch(`/api/arquivos/${id}`, { method: "DELETE" });
    carregar();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setArrastando(false);
    const file = e.dataTransfer.files[0];
    if (file) setArquivo(file);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Arquivos</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            Modelos .3mf e arquivos do Bambu Studio
          </p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.98] cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
            boxShadow: "0 4px 16px rgba(109,40,217,0.4)",
          }}
        >
          <Upload size={16} />
          <span className="hidden sm:inline">Enviar Arquivo</span>
          <span className="sm:hidden">Enviar</span>
        </button>
      </div>

      {carregando ? (
        <div className="text-center py-16 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
          Carregando...
        </div>
      ) : arquivos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.2)" }}
          >
            <Box size={28} style={{ color: "#A78BFA" }} />
          </div>
          <p className="text-white/70 font-semibold">Nenhum arquivo enviado</p>
          <p className="text-sm mt-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
            Envie seus arquivos .3mf do Bambu Studio
          </p>
          <button
            onClick={() => setModal(true)}
            className="mt-5 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl cursor-pointer transition-all"
            style={{ background: "rgba(124,58,237,0.2)", color: "#A78BFA", border: "1px solid rgba(124,58,237,0.3)" }}
          >
            <Upload size={15} /> Enviar primeiro arquivo
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <AnimatePresence>
            {arquivos.map((arq, i) => (
              <motion.div
                key={arq.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className="group relative rounded-2xl overflow-hidden flex flex-col"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(12px)",
                }}
              >
                {/* Thumbnail / preview area */}
                <div
                  className="relative w-full aspect-square overflow-hidden"
                  style={{ background: "rgba(0,0,0,0.3)" }}
                >
                  {arq.thumbnailNome ? (
                    <img
                      src={`/uploads/thumbs/${arq.thumbnailNome}`}
                      alt={arq.nomeOriginal}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      {is3mf(arq.nomeOriginal) ? (
                        <Box size={32} style={{ color: "rgba(167,139,250,0.5)" }} />
                      ) : (
                        <FileCode2 size={32} style={{ color: "rgba(255,255,255,0.2)" }} />
                      )}
                      <span className="text-xs font-bold tracking-wider" style={{ color: "rgba(255,255,255,0.2)" }}>
                        {ext(arq.nomeOriginal)}
                      </span>
                    </div>
                  )}

                  {/* Badge de formato */}
                  <div
                    className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider"
                    style={
                      is3mf(arq.nomeOriginal)
                        ? { background: "rgba(124,58,237,0.85)", color: "#E9D5FF" }
                        : { background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.5)" }
                    }
                  >
                    {ext(arq.nomeOriginal)}
                  </div>

                  {/* Hover actions */}
                  <div
                    className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: "rgba(0,0,0,0.55)" }}
                  >
                    <a
                      href={`/uploads/${arq.nome}`}
                      download={arq.nomeOriginal}
                      className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all"
                      style={{ background: "rgba(124,58,237,0.8)", color: "white" }}
                      title="Download"
                    >
                      <Download size={15} />
                    </a>
                    <button
                      onClick={() => deletarArquivo(arq.id)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all"
                      style={{ background: "rgba(239,68,68,0.7)", color: "white" }}
                      title="Remover"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 flex flex-col gap-1">
                  <p
                    className="text-xs font-semibold text-white truncate"
                    title={arq.nomeOriginal}
                  >
                    {arq.nomeOriginal.replace(/\.[^.]+$/, "")}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {formatarTamanho(arq.tamanho)}
                    </span>
                    {arq.projeto && (
                      <div className="flex items-center gap-1">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: arq.projeto.cor }}
                        />
                        <span className="text-[10px] truncate max-w-[70px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                          {arq.projeto.nome}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                    {arq.usuario.nome} · {new Date(arq.enviadoEm).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal Upload */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModal(false)} />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="relative rounded-2xl w-full max-w-md p-6"
              style={{
                background: "rgba(10,8,20,0.97)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(24px)",
                boxShadow: "0 32px 64px rgba(0,0,0,0.7)",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.2)" }}>
                    <Upload size={15} style={{ color: "#A78BFA" }} />
                  </div>
                  <h2 className="text-base font-semibold text-white">Enviar Arquivo</h2>
                </div>
                <button
                  onClick={() => setModal(false)}
                  className="p-1.5 rounded-lg transition-all cursor-pointer"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "white"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={enviarArquivo} className="space-y-4">
                {/* Drop zone */}
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Arquivo
                  </label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
                    onDragLeave={() => setArrastando(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className="rounded-2xl p-7 text-center cursor-pointer transition-all"
                    style={{
                      border: arrastando ? "2px dashed #7C3AED" : "2px dashed rgba(255,255,255,0.1)",
                      background: arrastando ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: "rgba(124,58,237,0.15)" }}
                    >
                      <Box size={20} style={{ color: "#A78BFA" }} />
                    </div>
                    {arquivo ? (
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "#A78BFA" }}>{arquivo.name}</p>
                        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>{formatarTamanho(arquivo.size)}</p>
                        {is3mf(arquivo.name) && (
                          <p className="text-xs mt-1.5" style={{ color: "rgba(167,139,250,0.6)" }}>
                            Thumbnail será extraído automaticamente
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                          Arraste ou clique para selecionar
                        </p>
                        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                          .3mf · .gcode · .stl · .obj e outros
                        </p>
                      </div>
                    )}
                    <input
                      ref={inputRef}
                      type="file"
                      accept=".3mf,.gcode,.stl,.obj,.step,.amf"
                      onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Projeto (opcional) */}
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Projeto <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400, textTransform: "none" }}>(opcional)</span>
                  </label>
                  <select
                    value={projetoId}
                    onChange={(e) => setProjetoId(e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                  >
                    <option value="" style={{ background: "#0F0F1A" }}>Sem projeto</option>
                    {projetos.map((p) => (
                      <option key={p.id} value={p.id} style={{ background: "#0F0F1A" }}>{p.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setModal(false)}
                    className="flex-1 py-2.5 text-sm font-medium rounded-xl transition-all cursor-pointer"
                    style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={enviando || !arquivo}
                    className="flex-1 py-2.5 text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 relative overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                      boxShadow: "0 4px 16px rgba(109,40,217,0.35)",
                    }}
                  >
                    {enviando ? "Enviando..." : "Enviar"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
