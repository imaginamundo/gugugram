import Link from "next/link";
import Chess from "pixelarticons/svg/chess.svg";

export default function NotFound() {
  return (
    <div>
      <Chess width={24 * 5} height={24 * 5} />
      <h2>Ops</h2>
      <p>Página nem existe</p>
      <Link href="/">Ir para tela inicial</Link>
    </div>
  );
}
