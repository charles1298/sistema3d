import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ erro: "Módulo de orçamentos removido. Use /api/projetos." }, { status: 410 });
}

export async function POST() {
  return NextResponse.json({ erro: "Módulo de orçamentos removido. Use /api/projetos." }, { status: 410 });
}
