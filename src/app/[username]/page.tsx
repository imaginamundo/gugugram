import type { MessagesData } from "@/api/profile/[username]/messages/route";
import { auth } from "@/app/auth";
import ProfileWall from "@/components/ProfileWall";

export const dynamic = "force-dynamic";
export default async function Profile({
  params,
}: {
  params: { username: string };
}) {
  const session = await auth();
  const data: MessagesData = await getMessagesData(params.username);

  let owner = false;
  if (session?.user.username === params.username) owner = true;

  return (
    <ProfileWall
      messages={data.messages}
      owner={owner}
      authenticated={!!session}
    />
  );
}

async function getMessagesData(username: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/profile/${username}/messages`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    throw new Error("Bad bad server, no donuts for you");
  }

  return res.json();
}
