import { NextResponse } from "next/server";

export async function PUT() {
  return NextResponse.json({ erro: "Módulo de orçamentos removido. Use /api/projetos." }, { status: 410 });
}

export async function DELETE() {
  return NextResponse.json({ erro: "Módulo de orçamentos removido. Use /api/projetos." }, { status: 410 });
}
