import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { fetchRecentlyPlayed } from "../lib/playlists"
import { usePlayerStore } from "../store/player-store"
import { useThemeStore } from "../store/theme-store"
import type { DeezerTrack } from "../lib/deezer"
import { Loader2, Play, Clock } from "lucide-react"

export function Home() {
  const [recentTracks, setRecentTracks] = useState<DeezerTrack[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const setTrack = usePlayerStore((state) => state.setTrack)
  const { isDark } = useThemeStore()

  useEffect(() => {
    loadRecentlyPlayed()
  }, [])

  async function loadRecentlyPlayed() {
    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id

      if (!userId) throw new Error("User not authenticated")

      const tracks = await fetchRecentlyPlayed(userId)
      setRecentTracks(tracks)
    } catch (error) {
      console.error("Failed to load recently played tracks:", error)
      setError("Failed to load recently played tracks")
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? "bg-zinc-900" : "bg-gray-100"}`}>
        <div
          className={`text-center p-8 rounded-lg ${isDark ? "bg-red-900/20 text-red-400" : "bg-red-100 text-red-600"}`}
        >
          {error}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`p-6 transition-colors duration-200 min-h-screen pb-36 ${
        isDark
          ? "bg-gradient-to-b from-zinc-900 to-black text-white"
          : "bg-gradient-to-b from-gray-100 to-white text-gray-900"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Welcome Back</h1>
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center justify-center">
            <Clock className="mr-2" /> Recently Played
          </h2>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-12 h-12 animate-spin text-green-500" />
            </div>
          ) : recentTracks && recentTracks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {recentTracks
                .filter((track) => track && track.album)
                .map((track) => (
                  <div
                    key={track.id}
                    className={`group rounded-lg p-4 transition cursor-pointer shadow-md hover:shadow-xl ${
                      isDark ? "bg-zinc-800/50 hover:bg-zinc-700/50" : "bg-white hover:bg-gray-50"
                    } transform hover:scale-105 duration-300 backdrop-blur-sm`}
                    onClick={() => setTrack(track)}
                  >
                    <div className="relative aspect-square mb-4 rounded-md overflow-hidden">
                      <img
                        src={track.album.cover_medium || "/placeholder.svg"}
                        alt={track.album.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 flex items-center justify-center transition-all duration-300">
                        <Play
                          className="text-white opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300"
                          size={48}
                        />
                      </div>
                    </div>
                    <h3
                      className={`font-medium truncate ${isDark ? "text-white" : "text-gray-900"} group-hover:text-green-400 transition-colors duration-300`}
                    >
                      {track.title}
                    </h3>
                    <p className={`text-sm truncate ${isDark ? "text-zinc-400" : "text-gray-600"}`}>
                      {track.artist.name}
                    </p>
                  </div>
                ))}
            </div>
          ) : (
            <div className={`text-center py-12 ${isDark ? "text-zinc-400" : "text-gray-600"}`}>
              No recently played tracks
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

