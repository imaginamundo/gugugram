import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { profileInformations } from "@/actions/profile";
import { auth } from "@/app/auth";
import EditProfile from "@/components/EditProfile";

export const metadata: Metadata = {
  title: "Editar perfil",
  description:
    "Ta muito redundante essas descrições, o título diz o que tem na página.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditProfilePage() {
  const session = await auth();
  if (!session) redirect("/entrar");

  const user = await profileInformations();
  if (!user) redirect("/entrar");

  return (
    <main className="container">
      <h1>Editar perfil</h1>
      <EditProfile user={user} />
    </main>
  );
}
