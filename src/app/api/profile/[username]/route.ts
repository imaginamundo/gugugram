export const dynamic = "force-dynamic";
export async function GET(
  _: Request,
  { params }: { params: { username: string } },
) {
  const data = getData();
  data.username = params.username;
  if (params.username === "dio") data.owner = true;

  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
  });

  const options = {
    status: 200,
    headers,
  };

  return new Response(JSON.stringify(data), options);
}

const data = {
  owner: false,
  username: "dio",
  friendsCount: 5,
  messagesCount: 2,
  images: [
    {
      id: 0,
      url: "https://art.pixilart.com/50d9ba576541e17.png",
      description: "Lorem ipsum",
    },
    {
      id: 1,
      url: "https://art.pixilart.com/50d9ba576541e17.png",
      description: "Lorem ipsum",
    },
    {
      id: 2,
      url: "https://art.pixilart.com/50d9ba576541e17.png",
      description: "Lorem ipsum",
    },
    {
      id: 3,
      url: "https://art.pixilart.com/50d9ba576541e17.png",
      description: "Lorem ipsum",
    },
    {
      id: 4,
      url: "https://art.pixilart.com/50d9ba576541e17.png",
      description: "Lorem ipsum",
    },
  ],
};

function getData() {
  return { ...data };
}

export type ProfileData = typeof data;
