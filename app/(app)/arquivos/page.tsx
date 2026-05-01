"use client";

import { useEffect, useState, useRef } from "react";
import { Upload, FileBox, Download, Trash2, X } from "lucide-react";

type Arquivo = {
  id: string;
  nomeOriginal: string;
  nome: string;
  tamanho: number;
  tipo: string;
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

const cardStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(12px)",
};

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
    if (!arquivo || !projetoId) return;
    setEnviando(true);
    const formData = new FormData();
    formData.append("arquivo", arquivo);
    formData.append("projetoId", projetoId);
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

  const is3mf = (nome: string) => nome.toLowerCase().endsWith(".3mf");

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200";
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Arquivos</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            Arquivos .3mf e modelos do Bambu Studio
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
          Enviar Arquivo
        </button>
      </div>

      {carregando ? (
        <div className="text-center py-16 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
          Carregando...
        </div>
      ) : arquivos.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={cardStyle}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <FileBox size={24} style={{ color: "rgba(255,255,255,0.3)" }} />
          </div>
          <p className="text-white/70 font-medium">Nenhum arquivo enviado</p>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
            Envie arquivos .3mf do Bambu Studio
          </p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                <th className="text-left text-xs font-semibold uppercase tracking-wide px-6 py-3" style={{ color: "rgba(255,255,255,0.35)" }}>Arquivo</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wide px-4 py-3" style={{ color: "rgba(255,255,255,0.35)" }}>Projeto</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wide px-4 py-3" style={{ color: "rgba(255,255,255,0.35)" }}>Enviado por</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wide px-4 py-3" style={{ color: "rgba(255,255,255,0.35)" }}>Tamanho</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wide px-4 py-3" style={{ color: "rgba(255,255,255,0.35)" }}>Data</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {arquivos.map((arq) => (
                <tr
                  key={arq.id}
                  className="transition-colors"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: is3mf(arq.nomeOriginal) ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.06)" }}
                      >
                        <FileBox size={16} style={{ color: is3mf(arq.nomeOriginal) ? "#A78BFA" : "rgba(255,255,255,0.4)" }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{arq.nomeOriginal}</p>
                        {is3mf(arq.nomeOriginal) && (
                          <span className="text-xs font-medium" style={{ color: "#A78BFA" }}>Bambu Studio</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {arq.projeto ? (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: arq.projeto.cor }} />
                        <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{arq.projeto.nome}</span>
                      </div>
                    ) : (
                      <span className="text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{arq.usuario.nome}</td>
                  <td className="px-4 py-4 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>{formatarTamanho(arq.tamanho)}</td>
                  <td className="px-4 py-4 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {new Date(arq.enviadoEm).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 justify-end">
                      <a
                        href={`/uploads/${arq.nome}`}
                        download={arq.nomeOriginal}
                        className="p-2 rounded-lg transition-all cursor-pointer"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.color = "#A78BFA";
                          (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.15)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)";
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                        }}
                        title="Download"
                      >
                        <Download size={15} />
                      </a>
                      <button
                        onClick={() => deletarArquivo(arq.id)}
                        className="p-2 rounded-lg transition-all cursor-pointer"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.color = "#F87171";
                          (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.12)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)";
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                        }}
                        title="Remover"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Upload */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div
            className="relative rounded-2xl w-full max-w-md p-6"
            style={{
              background: "rgba(10,8,20,0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 32px 64px rgba(0,0,0,0.6)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-white">Enviar Arquivo</h2>
              <button
                onClick={() => setModal(false)}
                className="p-1.5 rounded-lg transition-all cursor-pointer"
                style={{ color: "rgba(255,255,255,0.4)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "white";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)";
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={enviarArquivo} className="space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Projeto
                </label>
                <select
                  value={projetoId}
                  onChange={(e) => setProjetoId(e.target.value)}
                  required
                  className={inputClass}
                  style={inputStyle}
                >
                  <option value="" style={{ background: "#0F0F1A" }}>Selecione um projeto</option>
                  {projetos.map((p) => (
                    <option key={p.id} value={p.id} style={{ background: "#0F0F1A" }}>{p.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Arquivo
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
                  onDragLeave={() => setArrastando(false)}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className="rounded-2xl p-8 text-center cursor-pointer transition-all"
                  style={{
                    border: arrastando ? "2px dashed #7C3AED" : "2px dashed rgba(255,255,255,0.12)",
                    background: arrastando ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.03)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <Upload size={20} style={{ color: "rgba(255,255,255,0.4)" }} />
                  </div>
                  {arquivo ? (
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#A78BFA" }}>{arquivo.name}</p>
                      <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>{formatarTamanho(arquivo.size)}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>Arraste um arquivo aqui ou clique</p>
                      <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>Suporte a .3mf, .gcode, .stl e outros</p>
                    </div>
                  )}
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".3mf,.gcode,.stl,.obj,.step"
                    onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="flex-1 py-2.5 text-sm font-medium rounded-xl transition-all cursor-pointer"
                  style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviando || !arquivo}
                  className="flex-1 py-2.5 text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
                    boxShadow: "0 4px 16px rgba(109,40,217,0.35)",
                  }}
                >
                  {enviando ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
