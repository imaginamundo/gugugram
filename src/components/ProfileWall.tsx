"use client";

import Link from "next/link";
import Close from "pixelarticons/svg/close.svg";
import MoodHappy from "pixelarticons/svg/mood-happy.svg";
import MoodSad from "pixelarticons/svg/mood-sad.svg";
import { usePostHog } from "posthog-js/react";

import { removeMessage } from "@/actions/message";
import type { ProfileMessagesType } from "@/actions/user";
import Button from "@/components/Button";
import ProfileWallForm from "@/components/ProfileWallForm";
import { useToast } from "@/hooks/useToast";
import cn from "@/utils/cn";
import { parseDate } from "@/utils/date";

import styles from "./ProfileWall.module.css";

export default function ProfileWall({
  userId,
  messages,
  owner,
  authenticated,
}: {
  userId: string;
  messages: ProfileMessagesType;
  owner: boolean;
  authenticated: boolean;
}) {
  const posthog = usePostHog();
  const { toast } = useToast();
  const noMessages = messages.length === 0;

  const removeCurrentMessage = async (messageId: string) => {
    posthog.capture("remove_message");
    const response = await removeMessage(messageId);
    if (response?.message) {
      return toast({
        title: "Ops",
        description: response.message,
        variant: "destructive",
      });
    }
    location.reload();
  };

  return (
    <div className={cn("border-radius", styles.profileWall)}>
      <div className={styles.profileWallHeader}>
        <h3 id="mural">Mural</h3>
      </div>
      <div className={styles.messages}>
        {messages.map((message) => {
          return (
            <div
              key={`message-${message.id}`}
              className={styles.completeMessage}
            >
              <div className={styles.profile}>
                <span className="border-radius profile-picture">
                  <MoodHappy />
                </span>
                <p>
                  <span>
                    <Link href={`/${message.author.username}`} scroll>
                      <b>{message.author.username}</b>
                    </Link>
                  </span>
                  <br />
                  <span>{parseDate(message.createdAt)}</span>
                </p>
              </div>
              <div className={styles.messageWrapper}>
                <p className={cn("border-radius", styles.message)}>
                  {message.body}
                </p>
                {owner && (
                  <Button
                    variant="destructive"
                    onClick={() => removeCurrentMessage(message.id)}
                  >
                    <Close />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        {noMessages && (
          <p>
            Nenhuma mensagem <MoodSad />
          </p>
        )}
      </div>
      {!owner && authenticated && <ProfileWallForm userId={userId} />}
    </div>
  );
}
