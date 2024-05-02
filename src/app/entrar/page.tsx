import type { Metadata } from "next";

import Login from "@/components/Login";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Faça parte de uma rede social",
};

export default function LoginPage() {
  return (
    <main className="container">
      <Login />
    </main>
  );
}
