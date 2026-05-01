import { PrismaClient } from "../app/generated/prisma/client.ts";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const adapter = new PrismaBetterSqlite3({ url: path.resolve(process.cwd(), "dev.db") });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("Limpando dados antigos...");

  await prisma.arquivo.deleteMany({});
  await prisma.projetoMembro.deleteMany({});
  await prisma.projeto.deleteMany({});
  await prisma.usuario.deleteMany({});

  console.log("Criando usuarios...");

  const senha = await bcrypt.hash("123456", 10);

  await Promise.all([
    prisma.usuario.create({
      data: { nome: "Charles", email: "charles@3dsistema.com", senha, role: "admin", cor: "#7C3AED" },
    }),
    prisma.usuario.create({
      data: { nome: "Valdir", email: "valdir@3dsistema.com", senha, role: "membro", cor: "#3B82F6" },
    }),
    prisma.usuario.create({
      data: { nome: "Matheus", email: "matheus@3dsistema.com", senha, role: "membro", cor: "#00AE68" },
    }),
    prisma.usuario.create({
      data: { nome: "Tom", email: "tom@3dsistema.com", senha, role: "membro", cor: "#F59E0B" },
    }),
  ]);

  console.log("\nSeed concluido!");
  console.log("\nUsuarios criados:");
  console.log("  charles@3dsistema.com | senha: 123456 (Admin)");
  console.log("  valdir@3dsistema.com  | senha: 123456 (Membro)");
  console.log("  matheus@3dsistema.com | senha: 123456 (Membro)");
  console.log("  tom@3dsistema.com     | senha: 123456 (Membro)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
