import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessao } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";
import path from "path";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const fotos = await prisma.fotoProjeto.findMany({
    where: { projetoId: id },
    orderBy: { criadoEm: "asc" },
    include: { usuario: { select: { nome: true } } },
  });
  return NextResponse.json(fotos);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ erro: "Nao autorizado" }, { status: 401 });

  const { id } = await params;
  const projeto = await prisma.projeto.findUnique({ where: { id } });
  if (!projeto) return NextResponse.json({ erro: "Projeto nao encontrado" }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("foto") as File;
  if (!file) return NextResponse.json({ erro: "Foto obrigatoria" }, { status: 400 });

  const ext = path.extname(file.name).replace(".", "").toLowerCase() || "jpg";
  const buffer = Buffer.from(await file.arrayBuffer());
  const { nome } = await uploadFile(buffer, ext, "uploads/fotos");

  const foto = await prisma.fotoProjeto.create({
    data: {
      projetoId: id,
      nome,
      nomeOriginal: file.name,
      tamanho: file.size,
      usuarioId: sessao.id,
    },
    include: { usuario: { select: { nome: true } } },
  });

  return NextResponse.json(foto, { status: 201 });
}
