import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="container">
      <h1>O que é o Gugugram?</h1>
      <p>Uma rede social.</p>
      <h2>Como foi feito?</h2>
      <p>Com código.</p>
      <h2>Para que foi feito?</h2>
      <p>
        Porque{" "}
        <Link href="https://www.instagram.com/fotografolixo/" target="_blank">
          eu
        </Link>{" "}
        quis.
      </p>
      <h2>Posso ver o código?</h2>
      <p>
        Claro,{" "}
        <Link href="https://github.com/imaginamundo/gugugram" target="_blank">
          ta aqui
        </Link>
        .
      </p>
    </main>
  );
}
