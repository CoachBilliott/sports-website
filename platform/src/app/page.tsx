"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Static-export friendly home → staff app. */
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/app");
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--cc-navy,#0b1f3a)] text-white">
      <p className="font-[family-name:var(--font-body)] text-sm opacity-80">
        Opening Team OS Platform…
      </p>
    </main>
  );
}
