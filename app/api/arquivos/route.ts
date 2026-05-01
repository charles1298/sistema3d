import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessao } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function GET() {
  const arquivos = await prisma.arquivo.findMany({
    orderBy: { enviadoEm: "desc" },
    include: {
      projeto: { select: { nome: true, cor: true } },
      usuario: { select: { nome: true } },
    },
  });
  return NextResponse.json(arquivos);
}

export async function POST(req: NextRequest) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ erro: "Nao autorizado" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("arquivo") as File;
  const projetoId = formData.get("projetoId") as string;

  if (!file || !projetoId) {
    return NextResponse.json({ erro: "Arquivo e projeto sao obrigatorios" }, { status: 400 });
  }

  const ext = path.extname(file.name);
  const nomeUnico = `${randomUUID()}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, nomeUnico), buffer);

  const arquivo = await prisma.arquivo.create({
    data: {
      nome: nomeUnico,
      nomeOriginal: file.name,
      tamanho: file.size,
      tipo: file.type || ext.replace(".", ""),
      projetoId,
      usuarioId: sessao.id,
    },
  });

  return NextResponse.json(arquivo, { status: 201 });
}
