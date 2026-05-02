import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bambuGetDevices } from "@/lib/bambu";

export async function GET() {
  const config = await prisma.configuracao.findUnique({ where: { id: "global" } });

  if (!config?.bambuToken) {
    return NextResponse.json({ conectado: false, dispositivos: [] });
  }

  const expirado = config.bambuTokenExp
    ? new Date(config.bambuTokenExp) < new Date()
    : false;

  if (expirado) {
    return NextResponse.json({ conectado: false, expirado: true, dispositivos: [] });
  }

  try {
    const dispositivos = await bambuGetDevices(config.bambuToken);
    return NextResponse.json({
      conectado: true,
      email: config.bambuEmail,
      dispositivos,
    });
  } catch {
    return NextResponse.json({ conectado: false, erro: "Falha ao buscar dispositivos", dispositivos: [] });
  }
}
