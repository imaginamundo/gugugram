import styles from "./ProfileFriends.module.css";
import cn from "@utils/cn";
import type { FriendsData } from "@api/profile/[username]/friends/route";
import Link from "next/link";
import Button from "@components/Button";

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
            <div key={`friend-${friend.id}`} className={styles.friend}>
              <Link href={`/${friend.username}`}>
                <img
                  src={friend.image}
                  className={cn("border-radius", styles.friendImage)}
                />
              </Link>
              <div className={styles.friendInformation}>
                <Link href={`/${friend.username}`}>{friend.username}</Link>
                {owner && (
                  <Button variant="destructive">Remover amizade</Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
