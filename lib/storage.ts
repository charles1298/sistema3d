import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export type StorageFolder = "uploads" | "uploads/thumbs" | "uploads/fotos";

export type UploadResult = {
  nome: string;
};

const isR2 = !!(
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET_NAME
);

function mimeForExt(ext: string): string {
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  return "application/octet-stream";
}

async function uploadLocal(buffer: Buffer, ext: string, folder: StorageFolder): Promise<UploadResult> {
  const nome = `${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, nome), buffer);
  return { nome };
}

async function deleteLocal(nome: string, folder: StorageFolder): Promise<void> {
  try {
    await unlink(path.join(process.cwd(), "public", folder, nome));
  } catch { }
}

async function uploadR2(buffer: Buffer, ext: string, folder: StorageFolder): Promise<UploadResult> {
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const nome = `${randomUUID()}.${ext}`;
  const key = `${folder}/${nome}`;
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
  await client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: mimeForExt(ext),
  }));
  return { nome };
}

async function deleteR2(nome: string, folder: StorageFolder): Promise<void> {
  const { S3Client, DeleteObjectCommand } = await import("@aws-sdk/client-s3");
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
  try {
    await client.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: `${folder}/${nome}`,
    }));
  } catch { }
}

export async function uploadFile(buffer: Buffer, ext: string, folder: StorageFolder): Promise<UploadResult> {
  if (isR2) return uploadR2(buffer, ext, folder);
  return uploadLocal(buffer, ext, folder);
}

export async function deleteFile(nome: string, folder: StorageFolder): Promise<void> {
  if (isR2) return deleteR2(nome, folder);
  return deleteLocal(nome, folder);
}

export function getFileUrl(nome: string, folder: StorageFolder): string {
  const base = process.env.NEXT_PUBLIC_STORAGE_URL ?? "";
  return base ? `${base}/${folder}/${nome}` : `/${folder}/${nome}`;
}
