import Link from "next/link";
import Close from "pixelarticons/svg/close.svg";
import HumanHandsup from "pixelarticons/svg/human-handsup.svg";

import type { FriendsData } from "@/api/profile/[username]/friends/route";
import Button from "@/components/Button";
import cn from "@/utils/cn";

import styles from "./ProfileFriends.module.css";

export default function ProfileFriends({
  owner,
  friends,
  authenticated,
}: {
  owner: boolean;
  friends: FriendsData["friends"];
  authenticated: boolean;
}) {
  return (
    <div className={cn("border-radius", styles.profileFriends)}>
      <div className={styles.profileWallHeader}>
        <h3 id="amigos">Amigos</h3>
      </div>
      <div className={styles.friends}>
        {friends.map((friend) => {
          return (
            <div key={`friend-${friend.id}`} className={styles.friend}>
              <Link href={`/${friend.username}`}>
                <img
                  src={friend.image}
                  className={cn("border-radius", styles.friendImage)}
                  alt={friend.username}
                />
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
      </div>
    </div>
  );
}
