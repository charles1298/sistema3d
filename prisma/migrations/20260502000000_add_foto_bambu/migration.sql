-- CreateTable: FotoProjeto
CREATE TABLE "FotoProjeto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projetoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "nomeOriginal" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FotoProjeto_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FotoProjeto_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- AlterTable: add Bambu fields to Configuracao
ALTER TABLE "Configuracao" ADD COLUMN "bambuEmail" TEXT;
ALTER TABLE "Configuracao" ADD COLUMN "bambuToken" TEXT;
ALTER TABLE "Configuracao" ADD COLUMN "bambuTokenExp" TEXT;
