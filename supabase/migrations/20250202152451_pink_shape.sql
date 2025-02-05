/*
  # Additional Music Features Schema

  1. New Tables:
    - `favorite_tracks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `track_id` (text, stores Deezer track ID)
      - `added_at` (timestamp)
    
    - `recently_played`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `track_id` (text, stores Deezer track ID)
      - `played_at` (timestamp)

  2. Security:
    - Enable RLS on both tables
    - Add policies for CRUD operations
*/

-- Create favorite_tracks table
CREATE TABLE IF NOT EXISTS favorite_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id text NOT NULL,
  added_at timestamptz DEFAULT now(),
  UNIQUE (user_id, track_id)  -- Prevents duplicate favorite tracks per user
);

-- Create recently_played table
CREATE TABLE IF NOT EXISTS recently_played (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id text NOT NULL,
  played_at timestamptz DEFAULT now(),
  UNIQUE (user_id, track_id, played_at)  -- Prevents duplicate entries at the same time
);

-- Enable Row-Level Security (RLS)
ALTER TABLE favorite_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE recently_played ENABLE ROW LEVEL SECURITY;

-- Policies for favorite_tracks
CREATE POLICY "Users can add favorite tracks"
  ON favorite_tracks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their favorite tracks"
  ON favorite_tracks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can remove favorite tracks"
  ON favorite_tracks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for recently_played
CREATE POLICY "Users can add recently played tracks"
  ON recently_played
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their recently played tracks"
  ON recently_played
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
