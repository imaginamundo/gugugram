import ProfileFriends from "@components/ProfileFriends";
import { FriendsData } from "@api/profile/[username]/friends/route";

export const dynamic = "force-dynamic";
export default async function Friends({
  params,
}: {
  params: { username: string };
}) {
  const data: FriendsData = await getFriendsData(params.username);
  return <ProfileFriends friends={data.friends} owner={data.owner} />;
}

async function getFriendsData(username: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/profile/${username}/friends`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    throw new Error("Bad bad server, no donuts for you");
  }

  return res.json();
}
