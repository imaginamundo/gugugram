import Button from "@components/Button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gugugram · Página inicial",
  description: "Your 15x15 image repository",
};

export default function Home() {
  return (
    <main className="container">
      A sua rede social de compartilhar imagens feitas com 5px², 10px² e 15px².
      <div className="border-radius padding">
        <nav>
          <ul>
            <li>
              <Link href="/dio">/dio (autenticado)</Link>
            </li>
            <li>
              <Link href="/dio/amigos">/dio/amigos (autenticado)</Link>
            </li>
            <li>
              <Link href="/nomedeusuario">/nomedeusuario</Link>
            </li>
            <li>
              <Link href="/nomedeusuario/amigos">/nomedeusuario/amigos</Link>
            </li>
            <li>
              <Link href="/entrar">/entrar</Link>
            </li>
            <li>
              <Link href="/cadastrar">/cadastrar</Link>
            </li>
          </ul>
        </nav>
      </div>
    </main>
  );
}
