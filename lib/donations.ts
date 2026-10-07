import { supabase } from "@/lib/supabase";

export const DONATION_PER_SESSION_EUR = 1;

// Total donated so far, or null if it can't be loaded.
export async function getDonationTotal(): Promise<number | null> {
  const { data, error } = await supabase.rpc("donation_total");
  if (error) {
    console.error(error);
    return null;
  }
  return Number(data);
}

export function formatDonation(amount: number) {
  return `€${amount.toLocaleString("nl-NL", { maximumFractionDigits: 0 })}`;
}
