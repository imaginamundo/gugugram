import type { Metadata } from "next";

import { profileFriends, userInformations } from "@/actions/user";
import { auth } from "@/app/auth";
import ProfileFriends from "@/components/ProfileFriends";

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  return {
    title: `Amigos de ${params.username}`,
    description: "Bla bla bla, é o perfil desse usuário.",
  };
}

export const dynamic = "force-dynamic";
export default async function Friends({
  params,
}: {
  params: { username: string };
}) {
  const session = await auth();
  const user = await userInformations(params.username);
  const { friends } = await profileFriends(params.username, user.id);

  let owner = false;
  if (session?.user.username === params.username) owner = true;

  return (
    <ProfileFriends friends={friends} owner={owner} authenticated={!!session} />
  );
}
