import Link from "next/link";

import Button from "@/components/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
  DialogTrigger,
} from "@/components/Dialog";

import styles from "./ImageZoom.module.css";

export default function ImageZoom({
  children,
  username,
  image,
}: {
  children: React.ReactNode;
  username: string;
  image: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className={styles.triggerWrapper}>{children}</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Imagem de{" "}
            <Link href={`/${username}`} scroll>
              {username}
            </Link>
          </DialogTitle>
        </DialogHeader>
        <img
          src={image}
          alt={`Imagem de ${username}`}
          className={styles.image}
        />
        <DialogFooter>
          <Button variant="destructive">Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
