import { profileMessages } from "@/actions/user";
import { auth } from "@/app/auth";
import ProfileWall from "@/components/ProfileWall";

export const dynamic = "force-dynamic";
export default async function Profile({
  params,
}: {
  params: { username: string };
}) {
  const session = await auth();
  const messages = await profileMessages(params.username);

  let owner = false;
  if (session?.user.username === params.username) owner = true;

  return (
    <ProfileWall messages={messages} owner={owner} authenticated={!!session} />
  );
}
