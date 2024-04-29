"use client";

import Link from "next/link";
import Clock from "pixelarticons/svg/clock.svg";
import Close from "pixelarticons/svg/close.svg";
import Edit from "pixelarticons/svg/edit.svg";
import HumanHandsup from "pixelarticons/svg/human-handsup.svg";
import Mail from "pixelarticons/svg/mail.svg";
import MoodHappy from "pixelarticons/svg/mood-happy.svg";

import { acceptFriend, addFriend, removeFriend } from "@/actions/friendship";
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
  const addNewFriend = async () => {
    if (!user.friendship.status) {
      await addFriend(user.id);
      location.reload();
    }
  };

  const acceptNewFriend = async () => {
    if (user.friendship.status === "pending") {
      await acceptFriend(user.id);
      location.reload();
    }
  };

  const removeNewFriend = async () => {
    if (user.friendship.status === "accepted") {
      await removeFriend(user.id);
      location.reload();
    }
  };

  let friendButton: {
    text: string;
    Icon: React.FC;
    buttonProps: {
      disabled?: boolean;
      onClick?: () => void;
      variant?: "destructive" | "disabled";
    };
  } = {
    text: "Iniciar amizade",
    Icon: HumanHandsup,
    buttonProps: {
      onClick() {
        addNewFriend();
      },
    },
  };

  if (user.friendship.status) {
    friendButton = {
      pending: {
        text: "Esperando resposta…",
        Icon: Clock,
        buttonProps: { disabled: true, variant: "disabled" },
      },
      accepted: {
        text: "Remover amizade",
        Icon: Close,
        buttonProps: {
          onClick() {
            removeNewFriend();
          },
          variant: "destructive",
        },
      },
    }[user.friendship.status];

    if (
      user.friendship.status === "pending" &&
      user.friendship.type === "target"
    ) {
      friendButton = {
        text: "Aceitar amizade",
        Icon: HumanHandsup,
        buttonProps: {
          onClick() {
            acceptNewFriend();
          },
        },
      };
    }
  }

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
          {user.profile?.description && (
            <p className={styles.profileDescription}>
              {user.profile.description}
            </p>
          )}
          {owner && (
            <Link href="/editar-perfil">
              <Button variant="outline">
                <Edit />
                Editar perfil
              </Button>
            </Link>
          )}
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
          <Button
            className={styles.profileButtons}
            {...friendButton.buttonProps}
          >
            <friendButton.Icon />
            {friendButton.text}
          </Button>
        )}
      </div>
    </div>
  );
}
