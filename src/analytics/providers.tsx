"use client";

import { useSession } from "next-auth/react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: "/ingest",
    ui_host: "https://us.i.posthog.com",
  });
}
export default function CSPostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PostHogProvider client={posthog}>
      <PostHogAuth>{children}</PostHogAuth>
    </PostHogProvider>
  );
}

function PostHogAuth({ children }: { children: React.ReactNode }) {
  const { data, status } = useSession();

  useEffect(() => {
    if (data?.user) {
      posthog.identify(data.user.id, { username: data.user.username });
    } else if (status !== "authenticated") {
      posthog.reset();
    }
  }, [data, status]);

  return children;
}
