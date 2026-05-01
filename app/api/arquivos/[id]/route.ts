import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessao } from "@/lib/auth";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ erro: "Nao autorizado" }, { status: 401 });

  const { id } = await params;
  const arquivo = await prisma.arquivo.findUnique({ where: { id } });
  if (!arquivo) return NextResponse.json({ erro: "Nao encontrado" }, { status: 404 });

  try {
    await unlink(path.join(process.cwd(), "public", "uploads", arquivo.nome));
  } catch { /* arquivo pode nao existir mais no disco */ }

  if (arquivo.thumbnailNome) {
    try {
      await unlink(path.join(process.cwd(), "public", "uploads", "thumbs", arquivo.thumbnailNome));
    } catch { /* thumbnail pode nao existir */ }
  }

  await prisma.arquivo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
