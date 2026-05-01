import { prisma } from "@/lib/prisma";
import PrecificacaoClient from "@/components/precificacao/PrecificacaoClient";

const DEFAULTS = {
  id: "global",
  valorImpressora: 2899,
  vidaUtilHoras: 5000,
  custoManutencao: 0.32,
  margemLucro: 40,
};

export default async function PrecificacaoPage() {
  const [config, materiais] = await Promise.all([
    prisma.configuracao.upsert({ where: { id: "global" }, update: {}, create: DEFAULTS }),
    prisma.material.findMany({ orderBy: { criadoEm: "asc" } }),
  ]);

  return <PrecificacaoClient initialConfig={config} initialMateriais={materiais} />;
}
