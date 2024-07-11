"use client";

import Link from "next/link";
import Heart from "pixelarticons/svg/heart.svg";

import Button from "@/components/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
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
      <DialogContent className={styles.dialog}>
        <DialogHeader>
          <DialogTitle>
            Imagem de <Link href={`/${username}`}>{username}</Link>
          </DialogTitle>
        </DialogHeader>
        <img
          src={image}
          alt={`Imagem de ${username}`}
          className={styles.image}
        />
        {/* <p className={styles.description}>Descrição</p>
        <hr /> */}
        <DialogFooter className={styles.dialogFooter}>
          {/* <span className={styles.likes}>
            <Button>
              <Heart />
            </Button>
            0 curtidas
          </span> */}
          <DialogClose asChild>
            <Button variant="destructive">Fechar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
