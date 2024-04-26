import type { ProfileData } from "@/api/profile/[username]/route";
import ProfileGrid from "@/components/ProfileGrid";
import ProfileHeader from "@/components/ProfileHeader";
import UploadImage from "@/components/UploadImage";

import styles from "./layout.module.css";

export const dynamic = "force-dynamic";
export default async function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { username: string };
}) {
  const data: ProfileData = await getProfileData(params.username);

  return (
    <main className={styles.layout}>
      <div className={styles.profileWrapper}>
        <ProfileHeader
          username={data.username}
          friendsCount={data.friendsCount}
          messagesCount={data.messagesCount}
          owner={data.owner}
        />
        {data.owner && <UploadImage />}
        <ProfileGrid images={data.images} owner={data.owner} />
      </div>
      {children}
    </main>
  );
}

async function getProfileData(username?: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/profile/${username}`,
    {
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}
