/*
  # Add track data storage

  1. Changes
    - Add track_data JSONB column to playlist_tracks
    - Add track_data JSONB column to favorite_tracks
    - Add track_data JSONB column to recently_played

  2. Purpose
    - Store complete track information to avoid API calls
    - Improve performance and reliability
    - Enable offline access to track data
*/

-- Add track_data to playlist_tracks
ALTER TABLE playlist_tracks 
ADD COLUMN IF NOT EXISTS track_data JSONB;

-- Add track_data to favorite_tracks
ALTER TABLE favorite_tracks 
ADD COLUMN IF NOT EXISTS track_data JSONB;

-- Add track_data to recently_played
ALTER TABLE recently_played 
ADD COLUMN IF NOT EXISTS track_data JSONB;