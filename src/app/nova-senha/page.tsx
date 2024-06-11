import type { Metadata } from "next";

import NewPassword from "@/components/NewPassword";

export const metadata: Metadata = {
  title: "Nova senha",
  description: "Faça parte de uma rede social",
};

export default function RegisterPage() {
  return (
    <main className="container">
      <NewPassword />
    </main>
  );
}
