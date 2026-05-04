import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessao } from "@/lib/auth";
import { bambuLogin } from "@/lib/bambu";

export async function POST(req: NextRequest) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ erro: "Nao autorizado" }, { status: 401 });

  const { email, password, verifyCode } = await req.json();
  if (!email || !password) return NextResponse.json({ erro: "Email e senha obrigatorios" }, { status: 400 });

  try {
    const result = await bambuLogin(email, password, verifyCode ?? undefined);

    if (!result.ok) {
      return NextResponse.json({ needsCode: true });
    }

    await prisma.configuracao.upsert({
      where: { id: "global" },
      update: { bambuEmail: email, bambuToken: result.token, bambuTokenExp: result.expIso },
      create: { id: "global", bambuEmail: email, bambuToken: result.token, bambuTokenExp: result.expIso },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ erro: String(err instanceof Error ? err.message : err) }, { status: 400 });
  }
}

export async function DELETE() {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ erro: "Nao autorizado" }, { status: 401 });

  await prisma.configuracao.upsert({
    where: { id: "global" },
    update: { bambuEmail: null, bambuToken: null, bambuTokenExp: null },
    create: { id: "global" },
  });
  return NextResponse.json({ ok: true });
}
