import { SignJWT, jwtVerify } from "jose";

export type SessionPayload = {
  id: string;
  nome: string;
  email: string;
  role: string;
};

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "sistema3d-secret-key-change-in-production"
);

export async function criarToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verificarToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
