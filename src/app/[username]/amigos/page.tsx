import { profileFriends } from "@/actions/user";
import { auth } from "@/app/auth";
import ProfileFriends from "@/components/ProfileFriends";

export const dynamic = "force-dynamic";
export default async function Friends({
  params,
}: {
  params: { username: string };
}) {
  const session = await auth();
  const friends = await profileFriends(params.username);

  let owner = false;
  if (session?.user.username === params.username) owner = true;

  return (
    <ProfileFriends friends={friends} owner={owner} authenticated={!!session} />
  );
}
