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

  return (
    <div className="flex gap-6 items-center">
      <a href="/" className="text-dark-textSecondary hover:text-primary-500 transition font-medium">Home</a>
      {loggedIn && (
        <>
          {!isCoach && (
            <a href="/player/profile" className="text-dark-textSecondary hover:text-primary-500 transition font-medium">My Profile</a>
          )}
          <a href="/favorites" className="text-dark-textSecondary hover:text-primary-500 transition font-medium">Favorites</a>
          <a href="/messages" className="text-dark-textSecondary hover:text-primary-500 transition font-medium">Messages</a>
          <button
            onClick={handleLogout}
            className="text-dark-textSecondary hover:text-primary-500 transition font-medium"
          >
            Log Out
          </button>
        </>
      )}
      <a href="/coach/login" className="text-primary-500 font-medium hover:text-primary-600 transition">Coach Login</a>
      <a href="/admin/login" className="text-dark-textSecondary hover:text-primary-500 transition font-medium">Admin</a>
    </div>
  );
}
