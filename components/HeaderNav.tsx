"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function HeaderNav() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
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
