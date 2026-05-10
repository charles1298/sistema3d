import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export type BambuFile = {
  id: string;
  name: string;
  type: string;
  size: number;
  create_time: string;
  url?: string;
};

async function fetchProjectFiles(token: string, projectId: string): Promise<BambuFile[]> {
  const res = await fetch(
    `https://api.bambulab.com/v1/iot-service/api/user/project/${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "bambu_network_agent/01.09.05.01",
      },
      next: { revalidate: 0 },
    }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data.files ?? data.message ?? []) as BambuFile[];
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;

  const config = await prisma.configuracao.findUnique({ where: { id: "global" } });

  if (!config?.bambuToken) {
    return NextResponse.json({ erro: "Não conectado à Bambu Lab" }, { status: 401 });
  }

  const expirado = config.bambuTokenExp
    ? new Date(config.bambuTokenExp) < new Date()
    : false;

  if (expirado) {
    return NextResponse.json({ erro: "Token expirado — reconecte" }, { status: 401 });
  }

  try {
    const files = await fetchProjectFiles(config.bambuToken, projectId);
    return NextResponse.json({ files });
  } catch (err) {
    return NextResponse.json(
      { erro: String(err instanceof Error ? err.message : err) },
      { status: 500 }
    );
  }
}
