import { cookies } from "next/headers";
import { criarToken, verificarToken, type SessionPayload } from "@/lib/jwt";

export type { SessionPayload };

export async function criarSessao(payload: SessionPayload) {
  return criarToken(payload);
}

export async function verificarSessao(token: string) {
  return verificarToken(token);
}

export async function getSessao(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("sessao")?.value;
  if (!token) return null;
  return verificarToken(token);
}
