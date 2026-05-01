import { prisma } from "@/lib/prisma";
import ProjetosClient from "@/components/projetos/ProjetosClient";

const CONFIG_DEFAULTS = {
  id: "global",
  valorImpressora: 2899,
  vidaUtilHoras: 5000,
  custoManutencao: 0.32,
  margemLucro: 40,
};

export default async function ProjetosPage() {
  const [config, materiais, arquivos, projetos] = await Promise.all([
    prisma.configuracao.upsert({ where: { id: "global" }, update: {}, create: CONFIG_DEFAULTS }),
    prisma.material.findMany({ orderBy: { criadoEm: "asc" } }),
    prisma.arquivo.findMany({
      orderBy: { enviadoEm: "desc" },
      select: { id: true, nome: true, nomeOriginal: true, tipo: true, projetoId: true },
    }),
    prisma.projeto.findMany({
      orderBy: { criadoEm: "desc" },
      include: {
        criadoPor: { select: { nome: true } },
        material: { select: { nome: true, custoPorKg: true } },
        arquivoVinculado: { select: { id: true, nome: true, nomeOriginal: true, tipo: true } },
      },
    }),
  ]);

  return (
    <ProjetosClient
      initialConfig={config}
      initialMateriais={materiais}
      initialArquivos={arquivos}
      initialProjetos={projetos as any}
    />
  );
}
