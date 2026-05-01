import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULTS = {
  id: "global",
  valorImpressora: 2899,
  vidaUtilHoras: 5000,
  custoManutencao: 0.32,
  margemLucro: 40,
};

export async function GET() {
  const config = await prisma.configuracao.upsert({
    where: { id: "global" },
    update: {},
    create: DEFAULTS,
  });
  return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const config = await prisma.configuracao.upsert({
    where: { id: "global" },
    update: {
      valorImpressora: Number(body.valorImpressora),
      vidaUtilHoras: Number(body.vidaUtilHoras),
      custoManutencao: Number(body.custoManutencao),
      margemLucro: Number(body.margemLucro),
    },
    create: { ...DEFAULTS, ...body, id: "global" },
  });
  return NextResponse.json(config);
}
