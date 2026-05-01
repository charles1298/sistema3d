import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessao } from "@/lib/auth";

const include = {
  criadoPor: { select: { nome: true } },
  material: { select: { nome: true, custoPorKg: true } },
  arquivoVinculado: { select: { id: true, nome: true, nomeOriginal: true, tipo: true } },
};

export async function GET() {
  const projetos = await prisma.projeto.findMany({
    orderBy: { criadoEm: "desc" },
    include,
  });
  return NextResponse.json(projetos);
}

export async function POST(req: NextRequest) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ erro: "Nao autorizado" }, { status: 401 });

  const b = await req.json();
  if (!b.nome?.trim()) return NextResponse.json({ erro: "Nome obrigatorio" }, { status: 400 });

  const projeto = await prisma.projeto.create({
    data: {
      nome: b.nome.trim(),
      descricao: b.descricao || null,
      cor: b.cor || "#00AE68",
      impressaoStatus: b.impressaoStatus ?? "rascunho",
      materialId: b.materialId || null,
      pesoGramas: Number(b.pesoGramas) || 0,
      tempoHoras: Number(b.tempoHoras) || 0,
      tempoMinutos: Number(b.tempoMinutos) || 0,
      custoMaterial: Number(b.custoMaterial) || 0,
      custoOperacional: Number(b.custoOperacional) || 0,
      custoTotal: Number(b.custoTotal) || 0,
      precoVenda: Number(b.precoVenda) || 0,
      arquivoVinculadoId: b.arquivoVinculadoId || null,
      criadoPorId: sessao.id,
    },
    include,
  });

  return NextResponse.json(projeto, { status: 201 });
}
