import { redirect } from "next/navigation";

import { profileInformations } from "@/actions/profile";
import { auth } from "@/app/auth";
import EditProfile from "@/components/EditProfile";

export default async function EditProfilePage() {
  const session = await auth();
  const user = await profileInformations();

  if (!session || !user) return redirect("/entrar");

  return (
    <main className="container">
      <h1>Editar perfil</h1>
      <EditProfile user={user} />
    </main>
  );
}
