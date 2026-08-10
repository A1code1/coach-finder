-- Create coaches table
CREATE TABLE coaches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name text NOT NULL,
  bio text,
  years_experience integer,
  hourly_rate numeric NOT NULL,
  age_groups text[] DEFAULT '{}',
  specialties text[] DEFAULT '{}',
  city text NOT NULL,
  training_locations text[] DEFAULT '{}',
  availability jsonb DEFAULT '{}',
  photo_url text,
  status text CHECK (status IN ('pending', 'approved', 'rejected', 'unpublished')) DEFAULT 'pending',
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_coaches_status ON coaches(status);
CREATE INDEX idx_coaches_city ON coaches(city);
CREATE INDEX idx_coaches_user_id ON coaches(user_id);

-- Create contact_reveals table
CREATE TABLE contact_reveals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  player_email text,
  review_token text UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_contact_reveals_coach_id ON contact_reveals(coach_id);
CREATE INDEX idx_contact_reveals_review_token ON contact_reveals(review_token);

-- Create reviews table
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  contact_reveal_id uuid REFERENCES contact_reveals(id) ON DELETE SET NULL,
  reviewer_name text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment text,
  status text CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_reviews_coach_id ON reviews(coach_id);
CREATE INDEX idx_reviews_status ON reviews(status);

-- Create admins table
CREATE TABLE admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_reveals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coaches table
-- Anyone can view approved coaches
CREATE POLICY "Approved coaches are publicly viewable" ON coaches
  FOR SELECT USING (status = 'approved');

-- Coaches can view their own profile
CREATE POLICY "Coaches can view their own profile" ON coaches
  FOR SELECT USING (auth.uid() = user_id);

-- Coaches can update their own profile
CREATE POLICY "Coaches can update their own profile" ON coaches
  FOR UPDATE USING (auth.uid() = user_id);

-- Coaches can insert their own profile
CREATE POLICY "Coaches can insert their own profile" ON coaches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all coaches
CREATE POLICY "Admins can view all coaches" ON coaches
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

-- Admins can update coaches
CREATE POLICY "Admins can update coaches" ON coaches
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

-- RLS Policies for contact_reveals
CREATE POLICY "Contact reveals are insertable by anyone" ON contact_reveals
  FOR INSERT WITH CHECK (true);

-- RLS Policies for reviews
CREATE POLICY "Reviews can be inserted by anyone" ON reviews
  FOR INSERT WITH CHECK (true);

-- Coaches can view reviews for their profile
CREATE POLICY "Coaches can view reviews for their profile" ON reviews
  FOR SELECT USING (
    coach_id IN (
      SELECT id FROM coaches WHERE user_id = auth.uid()
    )
  );

-- Admins can view all reviews
CREATE POLICY "Admins can view all reviews" ON reviews
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

-- Admins can update reviews (for moderation)
CREATE POLICY "Admins can update reviews" ON reviews
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

-- Approved reviews are publicly viewable
CREATE POLICY "Approved reviews are publicly viewable" ON reviews
  FOR SELECT USING (status = 'approved');
