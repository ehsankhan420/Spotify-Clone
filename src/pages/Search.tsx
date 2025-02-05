import { useState, useCallback } from "react"
import { SearchIcon, Loader2, Play, Plus, X } from "lucide-react"
import { searchTracks } from "../lib/deezer"
import { usePlayerStore } from "../store/player-store"
import { addTrackToPlaylist } from "../lib/playlists"
import type { DeezerTrack } from "../lib/deezer"
import { supabase } from "../lib/supabase"
import { useThemeStore } from "../store/theme-store"

interface Playlist {
  id: string
  name: string
}

export function Search() {
  const [query, setQuery] = useState("")
  const [tracks, setTracks] = useState<DeezerTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState<DeezerTrack | null>(null)
  const setTrack = usePlayerStore((state) => state.setTrack)
  const { isDark } = useThemeStore()

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    try {
      const result = await searchTracks(query)
      setTracks(result.data)
    } catch (error) {
      console.error("Failed to search tracks:", error)
      setError("Failed to search tracks. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [query])

  const loadPlaylists = async () => {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return

    const { data } = await supabase.from("playlists").select("id, name").eq("user_id", user.user.id)

    if (data) {
      setPlaylists(data)
    }
  }

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!selectedTrack) return

    try {
      await addTrackToPlaylist(playlistId, selectedTrack)
      setShowAddToPlaylistModal(false)
      setSelectedTrack(null)
    } catch (error) {
      console.error("Failed to add track to playlist:", error)
      setError("Failed to add track to playlist")
    }
  }

  return (
    <div className="p-6 pb-36 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-6 text-center">Discover New Music</h2>
          <div className="relative group max-w-2xl mx-auto">
            <SearchIcon
              size={24}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-green-500"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="What do you want to listen to?"
              className={`w-full h-16 pl-14 pr-4 rounded-full ${
                isDark
                  ? "bg-zinc-800 text-white placeholder-zinc-400 focus:bg-zinc-700"
                  : "bg-white text-black placeholder-gray-400 focus:bg-gray-100"
              } focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 text-lg`}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className={`text-red-400 text-center p-4 mb-6 ${isDark ? "bg-red-900/20" : "bg-red-100"} rounded-lg`}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={48} className="animate-spin text-green-500" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {tracks.map((track) => (
              <div
                key={track.id}
                className={`group ${
                  isDark ? "bg-zinc-800/50" : "bg-white"
                } rounded-lg p-4 hover:bg-opacity-100 transition-all duration-300 backdrop-blur-sm hover:scale-105 relative shadow-lg hover:shadow-xl`}
              >
                <div className="relative aspect-square mb-4 rounded-md overflow-hidden">
                  <img
                    src={track.album.cover_medium || "/placeholder.svg"}
                    alt={track.album.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button
                      onClick={() => setTrack(track)}
                      className="w-12 h-12 flex items-center justify-center rounded-full bg-green-500 text-white transform scale-0 group-hover:scale-100 transition-transform duration-300 hover:bg-green-400"
                    >
                      <Play size={24} />
                    </button>
                    <button
                      onClick={() => {
                        loadPlaylists()
                        setSelectedTrack(track)
                        setShowAddToPlaylistModal(true)
                      }}
                      className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-black transform scale-0 group-hover:scale-100 transition-transform duration-300 hover:bg-gray-200"
                    >
                      <Plus size={24} />
                    </button>
                  </div>
                </div>
                <h3
                  className={`font-medium truncate ${isDark ? "text-white" : "text-black"} group-hover:text-green-400 transition-colors duration-300`}
                >
                  {track.title}
                </h3>
                <p className={`text-sm ${isDark ? "text-zinc-400" : "text-gray-600"} truncate`}>{track.artist.name}</p>
              </div>
            ))}
          </div>
        )}

        {!loading && tracks.length === 0 && query && (
          <div className={`text-center py-12 ${isDark ? "text-zinc-400" : "text-gray-600"}`}>
            No results found for "{query}"
          </div>
        )}
      </div>

      {/* Add to Playlist Modal */}
      {showAddToPlaylistModal && selectedTrack && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${isDark ? "bg-zinc-900" : "bg-white"} rounded-lg w-full max-w-md p-6 shadow-2xl`}>
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={selectedTrack?.album.cover_medium || "/placeholder.svg"}
                alt={selectedTrack?.album.title}
                className="w-20 h-20 rounded-md shadow-md"
              />
              <div>
                <h3 className={`font-medium ${isDark ? "text-white" : "text-black"}`}>{selectedTrack?.title}</h3>
                <p className={`text-sm ${isDark ? "text-zinc-400" : "text-gray-600"}`}>{selectedTrack?.artist.name}</p>
              </div>
            </div>

            <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-black"}`}>Add to Playlist</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4 custom-scrollbar">
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist.id)}
                  className={`w-full text-left p-3 rounded-lg ${
                    isDark ? "bg-zinc-800 hover:bg-zinc-700 text-white" : "bg-gray-100 hover:bg-gray-200 text-black"
                  } transition-colors duration-200`}
                >
                  {playlist.name}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddToPlaylistModal(false)}
                className={`px-4 py-2 rounded ${
                  isDark ? "bg-zinc-800 text-white hover:bg-zinc-700" : "bg-gray-200 text-black hover:bg-gray-300"
                } transition-colors duration-200`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

