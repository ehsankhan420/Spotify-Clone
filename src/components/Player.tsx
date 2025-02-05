import { useState, useEffect, useRef } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart } from "lucide-react"
import { usePlayerStore } from "../store/player-store"
import { toggleFavorite, addToRecentlyPlayed } from "../lib/playlists"
import { supabase } from "../lib/supabase"
import type { DeezerTrack } from "../lib/deezer"

export function Player() {
  const { currentTrack, isPlaying, volume, play, pause, setVolume, playNext, playPrevious } = usePlayerStore()
  const [progress, setProgress] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [prevVolume, setPrevVolume] = useState(volume)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = usePlayerStore.getState().audio
    if (!audio) return

    audioRef.current = audio

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100)
    }

    audio.addEventListener("timeupdate", updateProgress)
    audio.addEventListener("ended", playNext)

    return () => {
      audio.removeEventListener("timeupdate", updateProgress)
      audio.removeEventListener("ended", playNext)
    }
  }, [currentTrack, playNext])

  useEffect(() => {
    if (currentTrack) {
      checkFavoriteStatus()
    }
  }, [currentTrack])

  async function checkFavoriteStatus() {
    if (!currentTrack) return
    try {
      const { data } = await supabase
        .from("favorite_tracks")
        .select()
        .eq("track_id", currentTrack.id.toString())
        .single()
      setIsFavorite(!!data)
    } catch (error) {
      console.error("Failed to check favorite status:", error)
    }
  }

  const handleToggleFavorite = async (track: DeezerTrack) => {
    try {
      await toggleFavorite(track)
      setIsFavorite(!isFavorite)
    } catch (error) {
      console.error("Failed to toggle favorite:", error)
    }
  }

  const handlePlayPause = async () => {
    if (currentTrack) {
      try {
        await addToRecentlyPlayed(currentTrack)
      } catch (error) {
        console.error("Failed to add to recently played:", error)
      }
    }
    if (audioRef.current) {
      isPlaying ? audioRef.current.pause() : audioRef.current.play()
    }
    isPlaying ? pause() : play()
  }

  const handleVolumeClick = () => {
    if (isMuted) {
      setVolume(prevVolume)
      setIsMuted(false)
    } else {
      setPrevVolume(volume)
      setVolume(0)
      setIsMuted(true)
    }
  }

  if (!currentTrack) return null

  return (
    <div className="fixed bottom-[68px] md:bottom-0 left-0 right-0 h-16 md:h-20 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-t border-zinc-700 px-2 md:px-6 flex items-center justify-between shadow-lg z-50 md:left-64">
      <div className="flex items-center w-1/3 min-w-[100px] md:min-w-[120px]">
        <img
          src={currentTrack.album.cover_small || "/placeholder.svg"}
          alt={currentTrack.album.title}
          className="w-10 h-10 md:w-14 md:h-14 rounded-lg shadow-md"
        />
        <div className="ml-2 md:ml-4 overflow-hidden">
          <div className="text-xs md:text-sm font-semibold text-white truncate">{currentTrack.title}</div>
          <div className="text-xs text-zinc-400 truncate">{currentTrack.artist.name}</div>
        </div>
        <button
          onClick={() => handleToggleFavorite(currentTrack)}
          className={`ml-2 md:ml-4 ${isFavorite ? "text-red-500" : "text-zinc-400"} hover:scale-110 transition-transform duration-200`}
        >
          <Heart size={16} className="md:size-5" fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex flex-col items-center w-1/3">
        <div className="flex items-center space-x-2 md:space-x-4">
          <button className="text-zinc-400 hover:text-white transition-colors duration-200" onClick={playPrevious}>
            <SkipBack size={16} className="md:size-5" />
          </button>
          <button
            className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform duration-200 shadow-md"
            onClick={handlePlayPause}
          >
            {isPlaying ? <Pause size={14} className="md:size-4" /> : <Play size={14} className="md:size-4" />}
          </button>
          <button className="text-zinc-400 hover:text-white transition-colors duration-200" onClick={playNext}>
            <SkipForward size={16} className="md:size-5" />
          </button>
        </div>
        <div className="w-full mt-1 flex items-center space-x-2">
          <div className="text-xs text-zinc-400">
            {formatTime(audioRef.current?.currentTime ?? 0)}
          </div>
          <div className="flex-1 h-1 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-xs text-zinc-400">
            {formatTime(audioRef.current?.duration ?? 0)}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end w-1/3 space-x-2">
        <button
          onClick={handleVolumeClick}
          className="text-zinc-400 hover:text-white transition-colors duration-200"
        >
          {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <div className="relative w-14 md:w-20 h-1 bg-zinc-700 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-200"
            style={{ width: `${volume * 100}%` }}
          ></div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const newVolume = parseFloat(e.target.value)
              setVolume(newVolume)
              setIsMuted(newVolume === 0)
              if (newVolume > 0) {
                setPrevVolume(newVolume)
              }
            }}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="absolute top-0 left-0 w-4 h-4 bg-white rounded-full shadow-md"
            style={{ left: `${volume * 100}%`, transform: "translateX(-50%)" }}
          ></div>
        </div>
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

