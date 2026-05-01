import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessao } from "@/lib/auth";

const include = {
  criadoPor: { select: { nome: true } },
  material: { select: { nome: true, custoPorKg: true } },
  arquivoVinculado: { select: { id: true, nome: true, nomeOriginal: true, tipo: true } },
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projeto = await prisma.projeto.findUnique({ where: { id }, include });
  if (!projeto) return NextResponse.json({ erro: "Nao encontrado" }, { status: 404 });
  return NextResponse.json(projeto);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ erro: "Nao autorizado" }, { status: 401 });

  const { id } = await params;
  const b = await req.json();

  const projeto = await prisma.projeto.update({
    where: { id },
    data: {
      nome: b.nome?.trim(),
      descricao: b.descricao || null,
      cor: b.cor,
      impressaoStatus: b.impressaoStatus,
      materialId: b.materialId || null,
      pesoGramas: Number(b.pesoGramas) || 0,
      tempoHoras: Number(b.tempoHoras) || 0,
      tempoMinutos: Number(b.tempoMinutos) || 0,
      custoMaterial: Number(b.custoMaterial) || 0,
      custoOperacional: Number(b.custoOperacional) || 0,
      custoTotal: Number(b.custoTotal) || 0,
      precoVenda: Number(b.precoVenda) || 0,
      arquivoVinculadoId: b.arquivoVinculadoId || null,
    },
    include,
  });

  return NextResponse.json(projeto);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ erro: "Nao autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.projeto.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
