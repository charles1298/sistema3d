import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessao } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";
import path from "path";
import AdmZip from "adm-zip";

const THUMB_PATHS = [
  "Metadata/thumbnail.png",
  "Metadata/plate_1.png",
  "Metadata/plate_1_small.png",
  "thumbnail.png",
  "Thumbnail/thumbnail.png",
];

async function extrairThumbnail3mf(buffer: Buffer): Promise<string | null> {
  try {
    const zip = new AdmZip(buffer);
    for (const tentativa of THUMB_PATHS) {
      const entry = zip.getEntry(tentativa);
      if (entry) {
        const { nome } = await uploadFile(entry.getData(), "png", "uploads/thumbs");
        return nome;
      }
    }
  } catch { }
  return null;
}

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
  const projetoId = (formData.get("projetoId") as string) || null;

  if (!file) return NextResponse.json({ erro: "Arquivo obrigatorio" }, { status: 400 });

  const ext = path.extname(file.name).replace(".", "").toLowerCase() || "bin";
  const buffer = Buffer.from(await file.arrayBuffer());
  const { nome } = await uploadFile(buffer, ext, "uploads");

  let thumbnailNome: string | null = null;
  if (ext === "3mf") {
    thumbnailNome = await extrairThumbnail3mf(buffer);
  }

  const arquivo = await prisma.arquivo.create({
    data: {
      nome,
      nomeOriginal: file.name,
      tamanho: file.size,
      tipo: file.type || ext,
      thumbnailNome,
      projetoId: projetoId || undefined,
      usuarioId: sessao.id,
    },
  });

  return NextResponse.json(arquivo, { status: 201 });
}
