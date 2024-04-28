import Link from "next/link";
import Close from "pixelarticons/svg/close.svg";
import HumanHandsup from "pixelarticons/svg/human-handsup.svg";
import MoodHappy from "pixelarticons/svg/mood-happy.svg";
import MoodSad from "pixelarticons/svg/mood-sad.svg";

import type { FriendType } from "@/actions/user";
import Button from "@/components/Button";
import cn from "@/utils/cn";

import styles from "./ProfileFriends.module.css";

export default function ProfileFriends({
  owner,
  friends,
  authenticated,
}: {
  owner: boolean;
  friends: FriendType[];
  authenticated: boolean;
}) {
  const noFriends = friends.length === 0;

  return (
    <div className={cn("border-radius", styles.profileFriends)}>
      <div className={styles.profileFriendsHeader}>
        <h3 id="amigos">Amigos</h3>
      </div>
      <div className={styles.friends}>
        {friends.map((friend) => {
          return (
            <div key={`friend-${friend.id}`} className={styles.friend}>
              <Link href={`/${friend.username}`}>
                {friend.profile.image && (
                  <img
                    src={friend.profile.image}
                    className={cn("border-radius", styles.friendImage)}
                    alt={friend.username}
                  />
                )}
                {!friend.profile.image && (
                  <div
                    className={cn("border-radius", styles.friendImage)}
                    title={friend.username}
                  >
                    <MoodHappy />
                  </div>
                )}
              </Link>
              <div className={styles.friendInformation}>
                <Link href={`/${friend.username}`}>{friend.username}</Link>
                {owner && authenticated && (
                  <Button variant="destructive">
                    <Close />
                    Remover amizade
                  </Button>
                )}
                {!owner && authenticated && (
                  <Button className={styles.profileButtons}>
                    <HumanHandsup />
                    Adicionar amigo
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        {noFriends && (
          <p>
            Nenhuma amizade <MoodSad />
          </p>
        )}
      </div>
    </div>
  );
}
