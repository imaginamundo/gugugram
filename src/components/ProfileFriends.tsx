import Link from "next/link";
import Close from "pixelarticons/svg/close.svg";
import HumanHandsup from "pixelarticons/svg/human-handsup.svg";
import MoodHappy from "pixelarticons/svg/mood-happy.svg";

import type { ProfileFriendsType } from "@/actions/user";
import Button from "@/components/Button";
import cn from "@/utils/cn";

import styles from "./ProfileFriends.module.css";

export default function ProfileFriends({
  owner,
  friends,
  authenticated,
}: {
  owner: boolean;
  friends: ProfileFriendsType;
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
            <div
              key={`friend-${friend.targetUser.id}`}
              className={styles.friend}
            >
              <Link href={`/${friend.targetUser.username}`}>
                {friend.targetUser.profile.image && (
                  <img
                    src={friend.targetUser.profile.image}
                    className={cn("border-radius", styles.friendImage)}
                    alt={friend.targetUser.username}
                  />
                )}
                {!friend.targetUser.profile.image && (
                  <div
                    className={cn("border-radius", styles.friendImage)}
                    title={friend.targetUser.username}
                  >
                    <MoodHappy />
                  </div>
                )}
              </Link>
              <div className={styles.friendInformation}>
                <Link href={`/${friend.targetUser.username}`}>
                  {friend.targetUser.username}
                </Link>
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
