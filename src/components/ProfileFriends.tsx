"use client";

import Link from "next/link";
import Close from "pixelarticons/svg/close.svg";
import HumanHandsup from "pixelarticons/svg/human-handsup.svg";
import MoodHappy from "pixelarticons/svg/mood-happy.svg";
import MoodSad from "pixelarticons/svg/mood-sad.svg";

import { acceptFriend } from "@/actions/friendship";
import type { FriendType } from "@/actions/user";
import Button from "@/components/Button";
import { useToast } from "@/hooks/useToast";
import cn from "@/utils/cn";

import styles from "./ProfileFriends.module.css";

export default function ProfileFriends({
  owner,
  friends,
  friendRequests,
  authenticated,
}: {
  owner: boolean;
  friendRequests: FriendType[];
  friends: FriendType[];
  authenticated: boolean;
}) {
  const { toast } = useToast();

  const noFriends = friends.length === 0;

  const acceptFriendship = async (id: string) => {
    const response = await acceptFriend(id);
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
    <div className={cn("border-radius", styles.profileFriends)}>
      {!!friendRequests.length && (
        <>
          <div className={styles.profileFriendsHeader}>
            <h3 id="amigos">Solicitações de amizade</h3>
          </div>
          <div className={styles.friends}>
            {friendRequests.map((friend) => {
              return (
                <div
                  key={`friend-request-${friend.id}`}
                  className={styles.friend}
                >
                  <Link href={`/${friend.username}`} scroll>
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
                    <Link href={`/${friend.username}`} scroll>
                      {friend.username}
                    </Link>
                    <Button
                      className={styles.profileButtons}
                      onClick={() => acceptFriendship(friend.id)}
                    >
                      <HumanHandsup />
                      Aceitar
                    </Button>
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
        </>
      )}
      <div className={styles.profileFriendsHeader}>
        <h3 id="amigos">Amigos</h3>
      </div>
      <div className={styles.friends}>
        {friends.map((friend) => {
          return (
            <div key={`friend-${friend.id}`} className={styles.friend}>
              <Link href={`/${friend.username}`} scroll>
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
                <Link href={`/${friend.username}`} scroll>
                  {friend.username}
                </Link>
                {/* TODO: Show remove button added, and add button when not added */}
                {/* {owner && authenticated && (
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
                )} */}
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
