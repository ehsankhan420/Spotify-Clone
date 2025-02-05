-- Add cover_url column to playlists table if it doesn't exist
ALTER TABLE playlists 
ADD COLUMN IF NOT EXISTS cover_url TEXT; 