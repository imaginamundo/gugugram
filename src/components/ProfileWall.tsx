"use client";

import Link from "next/link";
import Close from "pixelarticons/svg/close.svg";
import MoodHappy from "pixelarticons/svg/mood-happy.svg";

import Button from "@/components/Button";
import ProfileWallForm from "@/components/ProfileWallForm";
import { MessageType } from "@/database/schema";
import cn from "@/utils/cn";
import { parseDate } from "@/utils/date";

import styles from "./ProfileWall.module.css";

export default function ProfileWall({
  messages,
  owner,
  authenticated,
}: {
  messages: MessageType[];
  owner: boolean;
  authenticated: boolean;
}) {
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
                    <Link href={`/${message.from}`}>
                      <b>{message.from}</b>
                    </Link>
                  </span>
                  <br />
                  <span>{parseDate(message.date)}</span>
                </p>
              </div>
              <div className={styles.messageWrapper}>
                <p className={cn("border-radius", styles.message)}>
                  {message.message}
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
      </div>
      {!owner && authenticated && <ProfileWallForm />}
    </div>
  );
}
