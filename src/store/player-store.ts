import { create } from 'zustand';
import type { DeezerTrack } from '../lib/deezer';
import { supabase } from '../lib/supabase';

interface PlayerState {
  currentTrack: DeezerTrack | null;
  queue: DeezerTrack[];
  isPlaying: boolean;
  volume: number;
  audio: HTMLAudioElement | null;
  setTrack: (track: DeezerTrack) => void;
  addToQueue: (track: DeezerTrack) => void;
  playNext: () => void;
  playPrevious: () => void;
  play: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
  clearQueue: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  volume: 1,
  audio: null,

  setTrack: async (track) => {
    const { audio: currentAudio } = get();
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
    }

    const audio = new Audio(track.preview);
    audio.volume = get().volume;
    
    // Add to recently played
    try {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase.from('recently_played').insert({
          track_id: track.id.toString(),
          user_id: user.user.id
        });
      }
    } catch (error) {
      console.error('Failed to add to recently played:', error);
    }

    set({ currentTrack: track, audio, isPlaying: false });
  },

  addToQueue: (track) => {
    set((state) => ({ queue: [...state.queue, track] }));
  },

  playNext: () => {
    const { queue } = get();
    if (queue.length > 0) {
      const nextTrack = queue[0];
      const newQueue = queue.slice(1);
      get().setTrack(nextTrack);
      set({ queue: newQueue });
    }
  },

  playPrevious: () => {
    // Implement previous track logic if needed
  },

  play: () => {
    const { audio } = get();
    if (audio) {
      audio.play();
      set({ isPlaying: true });
    }
  },

  pause: () => {
    const { audio } = get();
    if (audio) {
      audio.pause();
      set({ isPlaying: false });
    }
  },

  setVolume: (volume) => {
    const { audio } = get();
    if (audio) {
      audio.volume = volume;
    }
    set({ volume });
  },

  clearQueue: () => {
    set({ queue: [] });
  },
}));