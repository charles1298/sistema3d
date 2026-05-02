import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessao } from "@/lib/auth";
import { deleteFile } from "@/lib/storage";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ erro: "Nao autorizado" }, { status: 401 });

  const { id } = await params;
  const arquivo = await prisma.arquivo.findUnique({ where: { id } });
  if (!arquivo) return NextResponse.json({ erro: "Nao encontrado" }, { status: 404 });

  await deleteFile(arquivo.nome, "uploads");
  if (arquivo.thumbnailNome) {
    await deleteFile(arquivo.thumbnailNome, "uploads/thumbs");
  }

  await prisma.arquivo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
