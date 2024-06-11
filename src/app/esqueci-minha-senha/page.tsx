import type { Metadata } from "next";

import ForgotPassword from "@/components/ForgotPassword";

export const metadata: Metadata = {
  title: "Esqueci minha senha",
  description: "Recuperar conta via e-mail",
};

export default function LoginPage() {
  return (
    <main className="container">
      <ForgotPassword />
    </main>
  );
}
