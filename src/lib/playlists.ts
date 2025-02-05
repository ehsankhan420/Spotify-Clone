import { supabase } from './supabase';
import type { DeezerTrack } from './deezer';

export async function createPlaylist(name: string, description: string = '', coverFile: File | null = null) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  try {
    let coverUrl = '';

    if (coverFile) {
      const fileExt = coverFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('playlist-covers')
        .upload(fileName, coverFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('playlist-covers')
        .getPublicUrl(fileName);

      coverUrl = publicUrl;
    }

    const { data: playlist, error: playlistError } = await supabase
      .from('playlists')
      .insert({
        name,
        description,
        cover_url: coverUrl,
        user_id: user.id
      })
      .select()
      .single();

    if (playlistError) throw playlistError;

    return playlist;
  } catch (error) {
    console.error('Failed to create playlist:', error);
    throw error;
  }
}

export async function updatePlaylist(playlistId: string, updates: {
  name?: string;
  description?: string;
  cover_url?: string;
}) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('playlists')
    .update(updates)
    .eq('id', playlistId)
    .eq('user_id', user.user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePlaylist(playlistId: string) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('playlists')
    .delete()
    .eq('id', playlistId)
    .eq('user_id', user.user.id);

  if (error) throw error;
}

export async function addTrackToPlaylist(playlistId: string, track: DeezerTrack) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  // Get the last position in the playlist
  const { data: lastTrack } = await supabase
    .from('playlist_tracks')
    .select('position')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: false })
    .limit(1)
    .single();

  const position = lastTrack ? lastTrack.position + 1 : 0;

  const { error } = await supabase
    .from('playlist_tracks')
    .insert({ 
      playlist_id: playlistId, 
      track_id: track.id.toString(),
      position,
      track_data: track
    });

  if (error) throw error;
}

export async function removeTrackFromPlaylist(playlistId: string, trackId: string) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('playlist_tracks')
    .delete()
    .eq('playlist_id', playlistId)
    .eq('track_id', trackId);

  if (error) throw error;
}

export async function getPlaylistTracks(playlistId: string): Promise<DeezerTrack[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('playlist_tracks')
    .select('track_data')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: true });

  if (error) throw error;
  return data?.map(item => item.track_data as DeezerTrack).filter(Boolean) || [];
}

export async function toggleFavorite(track: DeezerTrack) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  try {
    // Check if track is already favorited
    const { data: existingFavorite } = await supabase
      .from('favorite_tracks')
      .select()
      .eq('track_id', track.id.toString())
      .eq('user_id', user.user.id)
      .single();

    if (existingFavorite) {
      // Remove from favorites
      await supabase
        .from('favorite_tracks')
        .delete()
        .eq('track_id', track.id.toString())
        .eq('user_id', user.user.id);
    } else {
      // Add to favorites
      await supabase
        .from('favorite_tracks')
        .insert({ 
          track_id: track.id.toString(),
          user_id: user.user.id,
          track_data: track
        });
    }

    return !existingFavorite; // Return new favorite status
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
}

export async function getFavorites(): Promise<DeezerTrack[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  try {
    const { data, error } = await supabase
      .from('favorite_tracks')
      .select('track_data')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data?.map(item => item.track_data as DeezerTrack) || [];
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
}

export async function getRecentlyPlayed(): Promise<DeezerTrack[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('recently_played')
    .select('track_data')
    .eq('user_id', user.user.id)
    .order('played_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data?.map(item => item.track_data as DeezerTrack).filter(Boolean) || [];
}

export async function addToRecentlyPlayed(track: DeezerTrack) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');

  try {
    // Check if track already exists in recently played
    const { data: existingTrack } = await supabase
      .from('recently_played')
      .select()
      .eq('track_id', track.id.toString())
      .eq('user_id', user.user.id)
      .single();

    if (existingTrack) {
      // Update existing track
      await supabase
        .from('recently_played')
        .delete()
        .eq('track_id', track.id.toString())
        .eq('user_id', user.user.id);
    }

    // Add to recently played
    await supabase
      .from('recently_played')
      .insert({ 
        track_id: track.id.toString(),
        user_id: user.user.id,
        track_data: track,
        played_at: new Date().toISOString()
      });

  } catch (error) {
    console.error('Error adding to recently played:', error);
    throw error;
  }
}

export async function fetchRecentlyPlayed(userId: string): Promise<DeezerTrack[]> {
  try {
    const { data, error } = await supabase
      .from('recently_played')
      .select('track_data')
      .eq('user_id', userId)
      .order('played_at', { ascending: false });

    if (error) throw error;

    // Use a Set to filter out duplicate tracks based on track ID
    const uniqueTracks = new Map<string, DeezerTrack>();
    (data || []).forEach(item => {
      const track = item.track_data as DeezerTrack;
      if (track && !uniqueTracks.has(track.id.toString())) {
        uniqueTracks.set(track.id.toString(), track);
      }
    });

    return Array.from(uniqueTracks.values());
  } catch (error) {
    console.error('Error fetching recently played:', error);
    return [];
  }
}

export function generateShareLink(playlistId: string): string {
  return `${window.location.origin}/playlist/${playlistId}`;
}