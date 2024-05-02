"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container">
      <h2>Deu um leve ruim</h2>
      <p>Vamos ter que tentar ver o que está dando</p>
    </div>
  );
}
