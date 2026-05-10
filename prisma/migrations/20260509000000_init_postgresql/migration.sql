-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'membro',
    "cor" TEXT NOT NULL DEFAULT '#00AE68',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Projeto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "cor" TEXT NOT NULL DEFAULT '#00AE68',
    "impressaoStatus" TEXT NOT NULL DEFAULT 'rascunho',
    "materialId" TEXT,
    "pesoGramas" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tempoHoras" INTEGER NOT NULL DEFAULT 0,
    "tempoMinutos" INTEGER NOT NULL DEFAULT 0,
    "custoMaterial" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "custoOperacional" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "custoTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "precoVenda" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "arquivoVinculadoId" TEXT,
    "criadoPorId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Projeto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjetoMembro" (
    "id" TEXT NOT NULL,
    "projetoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "ProjetoMembro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Arquivo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "nomeOriginal" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "thumbnailNome" TEXT,
    "projetoId" TEXT,
    "usuarioId" TEXT NOT NULL,
    "enviadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Arquivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FotoProjeto" (
    "id" TEXT NOT NULL,
    "projetoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "nomeOriginal" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FotoProjeto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuracao" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "valorImpressora" DOUBLE PRECISION NOT NULL DEFAULT 2899,
    "vidaUtilHoras" DOUBLE PRECISION NOT NULL DEFAULT 5000,
    "custoManutencao" DOUBLE PRECISION NOT NULL DEFAULT 0.32,
    "margemLucro" DOUBLE PRECISION NOT NULL DEFAULT 40,
    "bambuEmail" TEXT,
    "bambuToken" TEXT,
    "bambuTokenExp" TEXT,
    "bambuSessionCookie" TEXT,
    "bambuTfaKey" TEXT,

    CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "custoPorKg" DOUBLE PRECISION NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateUniqueIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateUniqueIndex
CREATE UNIQUE INDEX "ProjetoMembro_projetoId_usuarioId_key" ON "ProjetoMembro"("projetoId", "usuarioId");

-- AddForeignKey
ALTER TABLE "Projeto" ADD CONSTRAINT "Projeto_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Projeto" ADD CONSTRAINT "Projeto_arquivoVinculadoId_fkey" FOREIGN KEY ("arquivoVinculadoId") REFERENCES "Arquivo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Projeto" ADD CONSTRAINT "Projeto_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjetoMembro" ADD CONSTRAINT "ProjetoMembro_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjetoMembro" ADD CONSTRAINT "ProjetoMembro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arquivo" ADD CONSTRAINT "Arquivo_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arquivo" ADD CONSTRAINT "Arquivo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoProjeto" ADD CONSTRAINT "FotoProjeto_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoProjeto" ADD CONSTRAINT "FotoProjeto_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
