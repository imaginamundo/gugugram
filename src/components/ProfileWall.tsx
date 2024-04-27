"use client";

import Link from "next/link";
import Close from "pixelarticons/svg/close.svg";
import MoodHappy from "pixelarticons/svg/mood-happy.svg";
import MoodSad from "pixelarticons/svg/mood-sad.svg";

import Button from "@/components/Button";
import ProfileWallForm from "@/components/ProfileWallForm";
import { MessageType, UserType } from "@/database/schema";
import cn from "@/utils/cn";
import { parseDate } from "@/utils/date";

import styles from "./ProfileWall.module.css";

type MessagesWithAuthor = (MessageType & {
  author: UserType;
})[];

export default function ProfileWall({
  messages,
  owner,
  authenticated,
}: {
  messages: MessagesWithAuthor;
  owner: boolean;
  authenticated: boolean;
}) {
  const noMessages = messages.length === 0;

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
                    <Link href={`/${message.author.username}`}>
                      <b>{message.author.username}</b>
                    </Link>
                  </span>
                  <br />
                  <span>{parseDate(message.createdAt)}</span>
                </p>
              </div>
              <div className={styles.messageWrapper}>
                <p className={cn("border-radius", styles.message)}>
                  {message.content}
                </p>
                {owner && (
                  <Button variant="destructive">
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
      {!owner && authenticated && <ProfileWallForm />}
    </div>
  );
}
