"use server";

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

    if (!file) throw new Error("No image selected");
    if (file.size > 10000) throw new Error("Image too big");

    upload = await utapi.uploadFiles(file);
  } catch (e) {
    throw e;
  }

  const authorId = session.user.id;

  if (!upload.data?.url) throw new Error("Unexpected error");

  await db.insert(images).values({ authorId, image: upload.data.url });

  return;
}
