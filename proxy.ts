import { NextRequest, NextResponse } from "next/server";
import { verificarToken } from "@/lib/jwt";

const rotasPublicas = ["/login"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (rotasPublicas.includes(pathname)) return NextResponse.next();

  const token = req.cookies.get("sessao")?.value;
  const sessao = token ? await verificarToken(token) : null;

  if (!sessao) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
