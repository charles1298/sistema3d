import { NextResponse } from "next/server";

export async function PATCH() {
  return NextResponse.json({ erro: "Módulo de ordens removido. Use /api/projetos." }, { status: 410 });
}

export async function DELETE() {
  return NextResponse.json({ erro: "Módulo de ordens removido. Use /api/projetos." }, { status: 410 });
}
