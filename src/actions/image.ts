"use server";

import { and, eq } from "drizzle-orm";

import { auth } from "@/app/auth";
import { db } from "@/database/postgres";
import { images } from "@/database/schema";
import { utapi } from "@/image-upload/uploadthing";

export async function uploadImage(data: FormData) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado");

  let upload;
  try {
    const file = data.get("image") as Blob | undefined;

    if (!file) return { message: "Nenhuma imagem selecionada" };
    if (file.size > 10000) return { message: "Imagem muito grande" };

    upload = await utapi.uploadFiles(file);
  } catch (e) {
    throw e;
  }

  const authorId = session.user.id;

  if (!upload.data?.url) return { message: "Erro ao subir a imagem :(" };

  await db.insert(images).values({ authorId, image: upload.data.url });

  return { username: session.user.username };
}

export async function deleteImage({
  id,
  userId,
  imageUrl,
}: {
  id: string;
  userId: string;
  imageUrl: string;
}) {
  const session = await auth();

  if (!session) return { message: "Não permitido" };
  if (userId !== session.user.id) return { message: "Não permitido" };

  let imageId = imageUrl.split("/").pop();

  await utapi.deleteFiles(imageId!);

  await db
    .delete(images)
    .where(and(eq(images.id, id), eq(images.authorId, session.user.id)));
}
