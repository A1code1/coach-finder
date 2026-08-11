"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function HeaderNav() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [isCoach, setIsCoach] = useState(false);

  useEffect(() => {
    const checkRole = async (userId: string) => {
      const { data } = await supabase.from("coaches").select("id").eq("user_id", userId).maybeSingle();
      setIsCoach(!!data);
    };

    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user);
      if (data.user) checkRole(data.user.id);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
      if (session?.user) {
        checkRole(session.user.id);
      } else {
        setIsCoach(false);
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const navLink = "text-sm font-medium text-gray-600 hover:text-primary-900 transition-colors";

  return (
    <div className="flex gap-5 sm:gap-6 items-center">
      <a href="/" className={navLink}>
        Home
      </a>
      {loggedIn && (
        <>
          {!isCoach && (
            <a href="/player/profile" className={`${navLink} hidden sm:inline`}>
              My Profile
            </a>
          )}
          <a href="/favorites" className={navLink}>
            Favorites
          </a>
          <a href="/messages" className={navLink}>
            Messages
          </a>
          <button onClick={handleLogout} className={navLink}>
            Log Out
          </button>
        </>
      )}
      <span className="hidden sm:block h-4 w-px bg-gray-200" />
      <a href="/coach/login" className={`${navLink} hidden sm:inline`}>
        Coach Login
      </a>
      <a
        href="/coach/signup"
        className="text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        List Your Coaching
      </a>
      <a href="/admin/login" className={`${navLink} hidden sm:inline`}>
        Admin
      </a>
    </div>
  );
}
