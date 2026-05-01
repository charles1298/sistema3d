import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessao } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import AdmZip from "adm-zip";

const THUMB_PATHS = [
  "Metadata/thumbnail.png",
  "Metadata/plate_1.png",
  "Metadata/plate_1_small.png",
  "thumbnail.png",
  "Thumbnail/thumbnail.png",
];

async function extrairThumbnail3mf(buffer: Buffer, thumbDir: string): Promise<string | null> {
  try {
    const zip = new AdmZip(buffer);
    for (const tentativa of THUMB_PATHS) {
      const entry = zip.getEntry(tentativa);
      if (entry) {
        const thumbNome = `${randomUUID()}.png`;
        await writeFile(path.join(thumbDir, thumbNome), entry.getData());
        return thumbNome;
      }
    }
  } catch {
    // not a valid zip or no thumbnail found
  }
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

  if (!file) {
    return NextResponse.json({ erro: "Arquivo obrigatorio" }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase();
  const nomeUnico = `${randomUUID()}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const thumbDir = path.join(process.cwd(), "public", "uploads", "thumbs");

  await mkdir(uploadDir, { recursive: true });
  await mkdir(thumbDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, nomeUnico), buffer);

  let thumbnailNome: string | null = null;
  if (ext === ".3mf") {
    thumbnailNome = await extrairThumbnail3mf(buffer, thumbDir);
  }

  const arquivo = await prisma.arquivo.create({
    data: {
      nome: nomeUnico,
      nomeOriginal: file.name,
      tamanho: file.size,
      tipo: file.type || ext.replace(".", ""),
      thumbnailNome,
      projetoId: projetoId || undefined,
      usuarioId: sessao.id,
    },
  });

  return NextResponse.json(arquivo, { status: 201 });
}
