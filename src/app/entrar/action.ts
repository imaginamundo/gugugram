"use server";

import { signIn } from "@/app/auth";

export default async function loginAction(formData: FormData) {
  await signIn("credentials", formData);
}
