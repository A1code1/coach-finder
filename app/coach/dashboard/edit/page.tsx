"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CoachProfileForm } from "@/components/CoachProfileForm";
import type { Coach } from "@/types/database";

export default function EditCoachProfilePage() {
  const router = useRouter();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        router.replace("/coach/login");
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("coaches")
        .select("*")
        .eq("user_id", userData.user.id)
        .single();

      if (fetchError) throw fetchError;
      setCoach(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load your profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error || !coach)
    return <div className="text-center py-12 text-red-600">{error || "Profile not found"}</div>;

  return <CoachProfileForm mode="edit" initialCoach={coach} />;
}
