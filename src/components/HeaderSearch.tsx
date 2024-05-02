"use client";

import { useRouter } from "next/navigation";
import Search from "pixelarticons/svg/search.svg";
import { FormEventHandler, useState } from "react";

import Button from "@/components/Button";
import Input from "@/components/Input";

export default function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/busca/${query}`);
  };

  return (
    <form onSubmit={submitForm}>
      <Input value={query} onChange={(e) => setQuery(e.target.value)} />
      <Button>
        <Search />
      </Button>
    </form>
  );
}
