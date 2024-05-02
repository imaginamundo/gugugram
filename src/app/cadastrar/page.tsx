import type { Metadata } from "next";

import Register from "@/components/Register";

export const metadata: Metadata = {
  title: "Cadastrar",
  description: "Faça parte de uma rede social",
};

export default function RegisterPage() {
  return (
    <main className="container">
      <Register />
    </main>
  );
}
