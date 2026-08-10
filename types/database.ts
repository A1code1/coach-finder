export interface Coach {
  id: string;
  user_id: string;
  name: string;
  bio: string;
  years_experience: number;
  hourly_rate: number;
  age_groups: string[];
  specialties: string[];
  city: string;
  training_locations: string[];
  availability: Record<string, string[]>;
  photo_url: string | null;
  email: string | null;
  phone: string | null;
  gender: "male" | "female" | null;
  status: "pending" | "approved" | "rejected" | "unpublished";
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactReveal {
  id: string;
  coach_id: string;
  player_email: string | null;
  review_token: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  coach_id: string;
  contact_reveal_id: string | null;
  reviewer_name: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface Admin {
  user_id: string;
}
