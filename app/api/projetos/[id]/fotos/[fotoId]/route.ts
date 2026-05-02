import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessao } from "@/lib/auth";
import { deleteFile } from "@/lib/storage";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; fotoId: string }> }
) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ erro: "Nao autorizado" }, { status: 401 });

  const { fotoId } = await params;
  const foto = await prisma.fotoProjeto.findUnique({ where: { id: fotoId } });
  if (!foto) return NextResponse.json({ erro: "Nao encontrado" }, { status: 404 });

  await deleteFile(foto.nome, "uploads/fotos");
  await prisma.fotoProjeto.delete({ where: { id: fotoId } });
  return NextResponse.json({ ok: true });
}
