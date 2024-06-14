import type { Metadata } from "next";

import { newPasswordInformation } from "@/actions/authentication";
import NewPassword from "@/components/NewPassword";

export const metadata: Metadata = {
  title: "Nova senha",
  description: "Faça parte de uma rede social",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const token = searchParams.token || "";
  const tokenInformation = await newPasswordInformation(token);

  if (tokenInformation?.message) {
    return (
      <main className="container text-center">
        <p>{tokenInformation.message}</p>
      </main>
    );
  }

  return (
    <main className="container">
      <NewPassword token={token} />
    </main>
  );
}
