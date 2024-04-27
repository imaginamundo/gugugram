import { FriendsData } from "@/api/profile/[username]/friends/route";
import { auth } from "@/app/auth";
import ProfileFriends from "@/components/ProfileFriends";

export const dynamic = "force-dynamic";
export default async function Friends({
  params,
}: {
  params: { username: string };
}) {
  const session = await auth();
  const data: FriendsData = await getFriendsData(params.username);

  let owner = false;
  if (session?.user.username === params.username) owner = true;

  return (
    <ProfileFriends
      friends={data.friends}
      owner={owner}
      authenticated={!!session}
    />
  );
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
