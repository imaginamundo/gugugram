import { userInformations } from "@/actions/user";
import { auth } from "@/app/auth";
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
  const session = await auth();
  const user = await userInformations(params.username);

  let owner = false;
  if (session?.user.username === params.username) owner = true;

  return (
    <main className={styles.layout}>
      <div className={styles.profileWrapper}>
        <ProfileHeader user={user} owner={owner} authenticated={!!session} />
        {owner && <UploadImage />}
        <ProfileGrid user={user} images={user.images} owner={owner} />
      </div>
      {children}
    </main>
  );
}
