import { PrismaClient } from "../app/generated/prisma/client.ts";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Criando usuarios...");

  const senha = await bcrypt.hash("123456", 10);

  const usuarios = await Promise.all([
    prisma.usuario.upsert({
      where: { email: "admin@3dsistema.com" },
      update: {},
      create: { nome: "Admin", email: "admin@3dsistema.com", senha, role: "admin", cor: "#00AE68" },
    }),
    prisma.usuario.upsert({
      where: { email: "membro1@3dsistema.com" },
      update: {},
      create: { nome: "Ana Silva", email: "membro1@3dsistema.com", senha, role: "membro", cor: "#3B82F6" },
    }),
    prisma.usuario.upsert({
      where: { email: "membro2@3dsistema.com" },
      update: {},
      create: { nome: "Carlos Souza", email: "membro2@3dsistema.com", senha, role: "membro", cor: "#8B5CF6" },
    }),
    prisma.usuario.upsert({
      where: { email: "membro3@3dsistema.com" },
      update: {},
      create: { nome: "Diego Lima", email: "membro3@3dsistema.com", senha, role: "membro", cor: "#F59E0B" },
    }),
    prisma.usuario.upsert({
      where: { email: "membro4@3dsistema.com" },
      update: {},
      create: { nome: "Fernanda Costa", email: "membro4@3dsistema.com", senha, role: "membro", cor: "#EF4444" },
    }),
  ]);

  console.log("Criando projetos...");

  const projeto1 = await prisma.projeto.upsert({
    where: { id: "proj-1" },
    update: {},
    create: {
      id: "proj-1",
      nome: "Pecas para Drone",
      descricao: "Impressao de pecas de reposicao e melhorias para o drone da equipe",
      status: "ativo",
      cor: "#00AE68",
      criadoPorId: usuarios[0].id,
    },
  });

  const projeto2 = await prisma.projeto.upsert({
    where: { id: "proj-2" },
    update: {},
    create: {
      id: "proj-2",
      nome: "Suportes de Bancada",
      descricao: "Suportes e organizadores para a bancada de trabalho",
      status: "ativo",
      cor: "#3B82F6",
      criadoPorId: usuarios[1].id,
    },
  });

  const projeto3 = await prisma.projeto.upsert({
    where: { id: "proj-3" },
    update: {},
    create: {
      id: "proj-3",
      nome: "Prototipo Robotica",
      descricao: "Pecas para o prototipo de braco robotico",
      status: "ativo",
      cor: "#8B5CF6",
      criadoPorId: usuarios[2].id,
    },
  });

  console.log("Criando ordens de producao...");

  await prisma.ordemProducao.createMany({
    data: [
      {
        titulo: "Helice frontal esquerda",
        descricao: "Reimprimir helice danificada - espessura 2mm",
        status: "concluido",
        prioridade: "alta",
        estimativa: 45,
        material: "PLA Branco",
        projetoId: projeto1.id,
        usuarioId: usuarios[0].id,
      },
      {
        titulo: "Suporte de bateria",
        descricao: "Suporte para bateria LiPo 3S",
        status: "imprimindo",
        prioridade: "alta",
        estimativa: 90,
        material: "PETG Preto",
        projetoId: projeto1.id,
        usuarioId: usuarios[3].id,
      },
      {
        titulo: "Organizador de ferramentas",
        descricao: "Grid modular para ferramentas pequenas",
        status: "pendente",
        prioridade: "media",
        estimativa: 180,
        material: "PLA Cinza",
        projetoId: projeto2.id,
        usuarioId: usuarios[1].id,
      },
      {
        titulo: "Suporte para osciloscópio",
        status: "pendente",
        prioridade: "baixa",
        estimativa: 60,
        material: "PLA Preto",
        projetoId: projeto2.id,
        usuarioId: usuarios[1].id,
      },
      {
        titulo: "Junta do cotovelo - v2",
        descricao: "Nova versao com folga reduzida para menos folga",
        status: "pendente",
        prioridade: "alta",
        estimativa: 240,
        material: "PETG Natural",
        projetoId: projeto3.id,
        usuarioId: usuarios[2].id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("\nSeed concluido!");
  console.log("\nUsuarios criados:");
  console.log("  admin@3dsistema.com  | senha: 123456  (Admin)");
  console.log("  membro1@3dsistema.com | senha: 123456 (Ana Silva)");
  console.log("  membro2@3dsistema.com | senha: 123456 (Carlos Souza)");
  console.log("  membro3@3dsistema.com | senha: 123456 (Diego Lima)");
  console.log("  membro4@3dsistema.com | senha: 123456 (Fernanda Costa)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
