import Button from "@components/Button";
import Input from "@components/Input";
import MailArrowRight from "pixelarticons/svg/mail-arrow-right.svg";
import MoodHappy from "pixelarticons/svg/mood-happy.svg";
import styles from "./ProfileWall.module.css";
import { parseDate } from "@utils/date";
import cn from "@utils/cn";
import type { MessagesData } from "@api/profile/[username]/messages/route";
import Close from "pixelarticons/svg/close.svg";

export default function ProfileWall({
  messages,
  owner,
}: {
  messages: MessagesData["messages"];
  owner?: boolean;
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
                    <b>{message.from}</b>
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
      {!owner && (
        <form className={styles.form}>
          <Input
            className={styles.form}
            type="text"
            placeholder="Escreva aqui seu recado…"
          />

          <Button className={styles.noWrap}>
            <MailArrowRight />
            Enviar recado
          </Button>
        </form>
      )}
    </div>
  );
}
