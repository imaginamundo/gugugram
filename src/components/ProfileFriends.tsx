import styles from "./ProfileFriends.module.css";
import cn from "@utils/cn";
import type { FriendsData } from "@api/profile/[username]/friends/route";
import Link from "next/link";

export default function ProfileFriends({
  owner,
  friends,
}: {
  owner: boolean;
  friends: FriendsData["friends"];
}) {
  return (
    <div className={cn("border-radius", styles.profileFriends)}>
      <div className={styles.profileWallHeader}>
        <h3 id="amigos">Amigos</h3>
      </div>
      <div className={styles.friends}>
        {friends.map((friend) => {
          return (
            <Link
              href={`/${friend.username}`}
              key={`friend-${friend.id}`}
              className={styles.friend}
            >
              <img
                src={friend.image}
                className={cn("border-radius", styles.friendImage)}
              />
              {friend.username}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
