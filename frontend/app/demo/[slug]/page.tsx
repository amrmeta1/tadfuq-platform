"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function DemoSlugPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params?.slug === "string" ? params.slug : "";

  useEffect(() => {
    if (slug) router.replace(`/demo/${slug}/dashboard`);
  }, [slug, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading demo…</div>
    </div>
  );
}
