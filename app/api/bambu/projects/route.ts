import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export type BambuProject = {
  project_id: string;
  name: string;
  model_id: string;
  status: string;
  create_time: string;
  update_time: string;
  cover?: string;
};

async function fetchProjects(token: string): Promise<BambuProject[]> {
  const res = await fetch("https://api.bambulab.com/v1/iot-service/api/user/project", {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": "bambu_network_agent/01.09.05.01",
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  // A API retorna { projects: [...] } ou { message: [...] }
  return (data.projects ?? data.message ?? []) as BambuProject[];
}

export async function GET() {
  const config = await prisma.configuracao.findUnique({ where: { id: "global" } });

  if (!config?.bambuToken) {
    return NextResponse.json({ conectado: false, projetos: [] });
  }

  const expirado = config.bambuTokenExp
    ? new Date(config.bambuTokenExp) < new Date()
    : false;

  if (expirado) {
    return NextResponse.json({ conectado: false, expirado: true, projetos: [] });
  }

  try {
    const projetos = await fetchProjects(config.bambuToken);
    return NextResponse.json({ conectado: true, projetos });
  } catch (err) {
    return NextResponse.json({
      conectado: false,
      erro: String(err instanceof Error ? err.message : err),
      projetos: [],
    });
  }
}
