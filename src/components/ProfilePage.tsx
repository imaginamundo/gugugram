import ProfileHeader from "@components/ProfileHeader";
import ProfileGrid from "@components/ProfileGrid";
import ProfileWall from "@components/ProfileWall";
import type { ProfileData } from "@api/profile/[username]/route";
import ImagePlus from "pixelarticons/svg/image-plus.svg";
import Button from "@components/Button";

import styles from "./Profile.module.css";

export default function ProfilePage({
  data,
  owner,
}: {
  data: ProfileData;
  owner: boolean;
}) {
  return (
    <main className={styles.layout}>
      <div className={styles.profileWrapper}>
        <ProfileHeader
          username={data.username}
          friendsCount={data.friendsCount}
          messagesCount={data.messagesCount}
        />
        {owner && (
          <Button className={styles.addImageButton}>
            <ImagePlus />
            Adicionar nova foto
          </Button>
        )}
        <ProfileGrid images={data.images} />
      </div>
      <ProfileWall messages={data.messages} owner={owner} />
    </main>
  );
}
