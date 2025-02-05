-- Create the storage bucket for playlist covers
INSERT INTO storage.buckets (id, name, public)
VALUES ('playlist-covers', 'playlist-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Allow authenticated uploads" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
    bucket_id = 'playlist-covers' AND 
    auth.uid() = (storage.foldername(name))[1]::uuid
);

CREATE POLICY "Allow public viewing of playlist covers" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'playlist-covers'); 