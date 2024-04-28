import Link from "next/link";
import HumanHandsup from "pixelarticons/svg/human-handsup.svg";
import Mail from "pixelarticons/svg/mail.svg";
import MoodHappy from "pixelarticons/svg/mood-happy.svg";

import type { UserInformationType } from "@/actions/user";
import Button from "@/components/Button";
import cn from "@/utils/cn";

import styles from "./ProfileHeader.module.css";

export const dynamic = "force-dynamic";
export default function ProfileHeader({
  user,
  owner,
  authenticated,
}: {
  user: UserInformationType;
  owner: boolean;
  authenticated: boolean;
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
            {user.username}
          </h2>
          {user.profile?.description && <p>{user.profile.description}</p>}
          <p className={styles.profileLinks}>
            <Link
              href={`/${user.username}#mural`}
              className={styles.profileLink}
            >
              <Mail className={styles.profileLinkIcon} />
              {user.messagesCount} recado
            </Link>
            <Link
              href={`/${user.username}/amigos#amigos`}
              className={styles.profileLink}
            >
              <MoodHappy className={styles.profileLinkIcon} />
              {user.friendsCount} amigos
            </Link>{" "}
          </p>
        </div>
        {!owner && authenticated && (
          <Button className={styles.profileButtons}>
            <HumanHandsup />
            Adicionar amigo
          </Button>
        )}
      </div>
    </div>
  );
}
