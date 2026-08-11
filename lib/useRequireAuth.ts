"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export function useRequireAuth(redirectTo: string) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;

      if (!data.user) {
        router.replace(`/player/login?next=${encodeURIComponent(redirectTo)}`);
        return;
      }

      setUser(data.user);
      setChecking(false);
    });

    return () => {
      active = false;
    };
  }, [redirectTo]);

  return { user, checking };
}
