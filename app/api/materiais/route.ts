import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const materiais = await prisma.material.findMany({
    orderBy: { criadoEm: "asc" },
  });
  return NextResponse.json(materiais);
}

export async function POST(req: NextRequest) {
  const { nome, custoPorKg } = await req.json();
  if (!nome?.trim() || !custoPorKg || Number(custoPorKg) <= 0) {
    return NextResponse.json({ erro: "Nome e custo são obrigatórios" }, { status: 400 });
  }
  const material = await prisma.material.create({
    data: { nome: nome.trim(), custoPorKg: Number(custoPorKg) },
  });
  return NextResponse.json(material);
}
