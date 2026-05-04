import { NextRequest, NextResponse } from "next/server";
import { getSessao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";

export async function POST(req: NextRequest) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const { senhaAtual, novaSenha } = await req.json();

  if (!senhaAtual || !novaSenha)
    return NextResponse.json({ erro: "Preencha todos os campos" }, { status: 400 });

  if (novaSenha.length < 6)
    return NextResponse.json({ erro: "A nova senha deve ter pelo menos 6 caracteres" }, { status: 400 });

  try {
    const usuario = await prisma.usuario.findUnique({ where: { id: sessao.id } });
    if (!usuario) return NextResponse.json({ erro: "Usuário não encontrado" }, { status: 404 });

    const senhaCorreta = await compare(senhaAtual, usuario.senha);
    if (!senhaCorreta)
      return NextResponse.json({ erro: "Senha atual incorreta" }, { status: 400 });

    const novoHash = await hash(novaSenha, 10);
    await prisma.usuario.update({ where: { id: sessao.id }, data: { senha: novoHash } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("change-senha:", err);
    return NextResponse.json({ erro: "Erro interno ao alterar senha" }, { status: 500 });
  }
}
