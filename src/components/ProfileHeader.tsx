import Link from "next/link";
import HumanHandsup from "pixelarticons/svg/human-handsup.svg";
import Mail from "pixelarticons/svg/mail.svg";
import MoodHappy from "pixelarticons/svg/mood-happy.svg";

import Button from "@/components/Button";
import cn from "@/utils/cn";

import styles from "./ProfileHeader.module.css";

export const dynamic = "force-dynamic";
export default function ProfileHeader({
  owner,
  username,
  friendsCount,
  messagesCount,
}: {
  owner: boolean;
  username: string;
  friendsCount: number;
  messagesCount: number;
}) {
  return (
    <div className={cn("border-radius", styles.profileHeader)}>
      <div>
        <div>
          <h2 className={styles.profileUser}>
            <span
              className={cn(
                "border-radius profile-picture",
                styles.profilePicture,
              )}
            >
              <MoodHappy />
            </span>
            {username}
          </h2>
          <p>Descrição do perfil</p>
          <p className={styles.profileLinks}>
            <Link href={`/${username}#mural`} className={styles.profileLink}>
              <Mail className={styles.profileLinkIcon} />
              {messagesCount} recado
            </Link>
            <Link
              href={`/${username}/amigos#amigos`}
              className={styles.profileLink}
            >
              <MoodHappy className={styles.profileLinkIcon} />
              {friendsCount} amigos
            </Link>{" "}
          </p>
        </div>
        {!owner && (
          <Button className={styles.profileButtons}>
            <HumanHandsup />
            Adicionar amigo
          </Button>
        )}
      </div>
    </div>
  );
}
