import ProfileWall from "@components/ProfileWall";
import type { MessagesData } from "@api/profile/[username]/messages/route";

export const dynamic = "force-dynamic";
export default async function Profile({
  params,
}: {
  params: { username: string };
}) {
  const data: MessagesData = await getMessagesData(params.username);
  return <ProfileWall messages={data.messages} owner={data.owner} />;
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
