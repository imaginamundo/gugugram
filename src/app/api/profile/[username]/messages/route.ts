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
  messages: [
    {
      id: 2,
      from: "Nome da pessoa",
      date: new Date().toISOString(),
      message: "Olá, pessoa!",
    },
    {
      id: 3,
      from: "Nome de outra pessoa",
      date: new Date().toISOString(),
      message: "Olá, pessoa 2!",
    },
  ],
};

function getData() {
  return { ...data };
}

export type MessagesData = typeof data;
