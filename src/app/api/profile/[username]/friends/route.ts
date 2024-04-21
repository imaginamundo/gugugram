const data = {
  owner: false,
  username: "dio",
  friendsCount: 54,
  messagesCount: 1,
  friends: [
    {
      id: 0,
      username: "Nome da pessoa",
      image: "https://art.pixilart.com/50d9ba576541e17.png",
    },
    {
      id: 1,
      username: "Nome de outra pessoa",
      image: "https://art.pixilart.com/50d9ba576541e17.png",
    },
  ],
};

export type FriendsData = typeof data;

export const dynamic = "force-dynamic";
export async function GET(
  _: Request,
  { params }: { params: { username: string } },
) {
  data.username = params.username;

  if (params.username === "dio") data.owner = true;

  const headers = new Headers({
    "Content-Type": "application/json",
  });

  const options = {
    status: 200,
    headers,
  };

  return new Response(JSON.stringify(data), options);
}
