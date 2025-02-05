/*
  # Music Database Schema

  1. New Tables
    - `playlists`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `playlist_tracks`
      - `id` (uuid, primary key)
      - `playlist_id` (uuid, references playlists)
      - `track_id` (text, stores Deezer track ID)
      - `added_at` (timestamp)
      - `position` (integer)

  2. Security
    - Enable RLS on both tables
    - Add policies for CRUD operations
*/

-- Create playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create playlist_tracks table
CREATE TABLE IF NOT EXISTS playlist_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid REFERENCES playlists(id) ON DELETE CASCADE NOT NULL,
  track_id text NOT NULL,
  added_at timestamptz DEFAULT now(),
  position integer NOT NULL,
  UNIQUE (playlist_id, track_id)
);

-- Enable RLS
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;

-- Policies for playlists
DROP POLICY IF EXISTS "Users can create their own playlists" ON playlists;
CREATE POLICY "Users can create their own playlists"
  ON playlists
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own playlists" ON playlists;
CREATE POLICY "Users can view their own playlists"
  ON playlists
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own playlists" ON playlists;
CREATE POLICY "Users can update their own playlists"
  ON playlists
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own playlists" ON playlists;
CREATE POLICY "Users can delete their own playlists"
  ON playlists
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for playlist_tracks
DROP POLICY IF EXISTS "Users can add tracks to their playlists" ON playlist_tracks;
CREATE POLICY "Users can add tracks to their playlists"
  ON playlist_tracks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_id
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view tracks in their playlists" ON playlist_tracks;
CREATE POLICY "Users can view tracks in their playlists"
  ON playlist_tracks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_id
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update tracks in their playlists" ON playlist_tracks;
CREATE POLICY "Users can update tracks in their playlists"
  ON playlist_tracks
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_id
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can remove tracks from their playlists" ON playlist_tracks;
CREATE POLICY "Users can remove tracks from their playlists"
  ON playlist_tracks
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_id
      AND user_id = auth.uid()
    )
  );

/*
  # Additional Music Features Schema

  1. New Tables
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

  2. Security
    - Enable RLS on both tables
    - Add policies for CRUD operations
*/

-- Create favorite_tracks table
CREATE TABLE IF NOT EXISTS favorite_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  track_id text NOT NULL,
  added_at timestamptz DEFAULT now(),
  UNIQUE (user_id, track_id)
);

-- Create recently_played table
CREATE TABLE IF NOT EXISTS recently_played (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  track_id text NOT NULL,
  played_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE favorite_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE recently_played ENABLE ROW LEVEL SECURITY;

-- Policies for favorite_tracks
DROP POLICY IF EXISTS "Users can add favorite tracks" ON favorite_tracks;
CREATE POLICY "Users can add favorite tracks"
  ON favorite_tracks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their favorite tracks" ON favorite_tracks;
CREATE POLICY "Users can view their favorite tracks"
  ON favorite_tracks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove favorite tracks" ON favorite_tracks;
CREATE POLICY "Users can remove favorite tracks"
  ON favorite_tracks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for recently_played
DROP POLICY IF EXISTS "Users can add recently played tracks" ON recently_played;
CREATE POLICY "Users can add recently played tracks"
  ON recently_played
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their recently played tracks" ON recently_played;
CREATE POLICY "Users can view their recently played tracks"
  ON recently_played
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);


ALTER TABLE playlists 
ADD COLUMN cover_url TEXT;


CREATE POLICY "Allow authenticated uploads" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'playlist-covers');

CREATE POLICY "Allow public viewing of playlist covers" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'playlist-covers');