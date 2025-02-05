import { useState, useEffect } from "react"
import { Plus, Heart, Loader2, Play, Share2, Pencil, Trash2, X, Music } from "lucide-react"
import {
  createPlaylist,
  getPlaylistTracks,
  getFavorites,
  updatePlaylist,
  deletePlaylist,
  removeTrackFromPlaylist,
  generateShareLink,
} from "../lib/playlists"
import { usePlayerStore } from "../store/player-store"
import { useThemeStore } from "../store/theme-store"
import type { DeezerTrack } from "../lib/deezer"
import { supabase } from "../lib/supabase"

interface Playlist {
  id: string
  name: string
  description: string
  cover_url?: string
}

export function Library() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [favorites, setFavorites] = useState<DeezerTrack[]>([])
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [playlistTracks, setPlaylistTracks] = useState<DeezerTrack[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("")
  const [newPlaylistCover, setNewPlaylistCover] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { setTrack, currentTrack, isPlaying } = usePlayerStore()
  const { isDark } = useThemeStore()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedPlaylist) {
      loadPlaylistTracks(selectedPlaylist.id)
    }
  }, [selectedPlaylist])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)

      const [playlistsData, favoritesData] = await Promise.all([loadPlaylists(), loadFavorites()])

      setPlaylists(playlistsData || [])
      setFavorites(favoritesData || [])
    } catch (error) {
      console.error("Failed to load library data:", error)
      setError("Failed to load library data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function loadPlaylists() {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error("Not authenticated")

    const { data, error: playlistError } = await supabase
      .from("playlists")
      .select()
      .eq("user_id", user.user.id)
      .order("created_at", { ascending: false })

    if (playlistError) throw playlistError
    return data
  }

  async function loadFavorites() {
    try {
      const tracks = await getFavorites()
      return tracks
    } catch (error) {
      console.error("Failed to load favorites:", error)
      return []
    }
  }

  async function loadPlaylistTracks(playlistId: string) {
    try {
      const tracks = await getPlaylistTracks(playlistId)
      setPlaylistTracks(tracks)
    } catch (error) {
      console.error("Failed to load playlist tracks:", error)
      setError("Failed to load playlist tracks")
    }
  }

  async function handleCreatePlaylist() {
    if (!newPlaylistName.trim()) return

    try {
      setError(null)
      let coverUrl = ""

      if (newPlaylistCover) {
        const { data: user } = await supabase.auth.getUser()
        if (!user.user) throw new Error("Not authenticated")

        const fileExt = newPlaylistCover.name.split(".").pop()
        const filePath = `${user.user.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage.from("playlist-covers").upload(filePath, newPlaylistCover)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("playlist-covers").getPublicUrl(filePath)

        coverUrl = publicUrl
      }

      await createPlaylist(newPlaylistName, newPlaylistDescription, newPlaylistCover)
      setNewPlaylistName("")
      setNewPlaylistDescription("")
      setNewPlaylistCover(null)
      setShowCreateModal(false)
      await loadData()
    } catch (error) {
      console.error("Failed to create playlist:", error)
      setError("Failed to create playlist. Please try again.")
    }
  }

  async function handleUpdatePlaylist() {
    if (!selectedPlaylist) return

    try {
      setError(null)
      let coverUrl = selectedPlaylist.cover_url

      if (newPlaylistCover) {
        const { data: user } = await supabase.auth.getUser()
        if (!user.user) throw new Error("Not authenticated")

        const fileExt = newPlaylistCover.name.split(".").pop()
        const filePath = `${user.user.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage.from("playlist-covers").upload(filePath, newPlaylistCover)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("playlist-covers").getPublicUrl(filePath)

        coverUrl = publicUrl
      }

      await updatePlaylist(selectedPlaylist.id, {
        name: newPlaylistName || selectedPlaylist.name,
        description: newPlaylistDescription || selectedPlaylist.description,
        cover_url: coverUrl,
      })
      setShowEditModal(false)
      await loadData()
    } catch (error) {
      console.error("Failed to update playlist:", error)
      setError("Failed to update playlist. Please try again.")
    }
  }

  async function handleDeletePlaylist(playlistId: string) {
    if (!confirm("Are you sure you want to delete this playlist?")) return

    try {
      setError(null)
      await deletePlaylist(playlistId)
      setSelectedPlaylist(null)
      await loadData()
    } catch (error) {
      console.error("Failed to delete playlist:", error)
      setError("Failed to delete playlist. Please try again.")
    }
  }

  async function handleRemoveTrackFromPlaylist(playlistId: string, trackId: string) {
    try {
      await removeTrackFromPlaylist(playlistId, trackId)
      if (selectedPlaylist?.id === playlistId) {
        await loadPlaylistTracks(playlistId)
      }
    } catch (error) {
      console.error("Failed to remove track from playlist:", error)
      setError("Failed to remove track from playlist")
    }
  }

  function handleSharePlaylist(playlistId: string) {
    const shareLink = generateShareLink(playlistId)
    navigator.clipboard.writeText(shareLink)
    alert("Share link copied to clipboard!")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    )
  }

  return (
    <div className="p-6 pb-36">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Your Library</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <Plus size={20} />
          <span>Create Playlist</span>
        </button>
      </div>

      {error && (
        <div className={`p-4 mb-6 rounded-lg ${isDark ? "bg-red-900/20 text-red-400" : "bg-red-100 text-red-600"}`}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Heart className="mr-2 text-red-500" /> Favorite Tracks
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
              {favorites
                .filter((track) => track && track.id)
                .map((track) => (
                  <div
                    key={`favorite-${track.id}-${track.title}`}
                    className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                      isDark ? "bg-zinc-800/50 hover:bg-zinc-700/50" : "bg-white hover:bg-gray-50 shadow-sm"
                    }`}
                  >
                    <img
                      src={track.album?.cover_medium || "/placeholder.svg"}
                      alt={track.album?.title || "Album cover"}
                      className="w-16 h-16 rounded-md object-cover shadow-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{track.title}</h3>
                      <p className={`text-sm truncate ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
                        {track.artist?.name || "Unknown Artist"}
                      </p>
                    </div>
                    <button
                      onClick={() => setTrack(track)}
                      className={`p-3 rounded-full transition-colors duration-200 ${
                        currentTrack?.id === track.id && isPlaying
                          ? "bg-green-500 text-white"
                          : isDark
                            ? "bg-zinc-700 text-white hover:bg-zinc-600"
                            : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      }`}
                    >
                      <Play size={20} />
                    </button>
                  </div>
                ))}
              {favorites.length === 0 && (
                <div className={`text-center py-8 ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
                  No favorite tracks yet
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Your Playlists</h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
              {playlists.map((playlist) => (
                <div
                  key={`playlist-${playlist.id}`}
                  className={`flex items-center space-x-4 p-4 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                    selectedPlaylist?.id === playlist.id
                      ? isDark
                        ? "bg-zinc-700/50"
                        : "bg-gray-100"
                      : isDark
                        ? "bg-zinc-800/50 hover:bg-zinc-700/50"
                        : "bg-white hover:bg-gray-50 shadow-sm"
                  }`}
                  onClick={() => setSelectedPlaylist(playlist)}
                >
                  <div
                    className={`w-16 h-16 rounded-md flex items-center justify-center shadow-md ${
                      playlist.cover_url ? "" : isDark ? "bg-zinc-700" : "bg-gray-200"
                    }`}
                  >
                    {playlist.cover_url ? (
                      <img
                        src={playlist.cover_url || "/placeholder.svg"}
                        alt={playlist.name}
                        className="w-full h-full rounded-md object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                    ) : (
                      <Music size={24} className={isDark ? "text-zinc-500" : "text-gray-400"} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{playlist.name}</h3>
                    <p className={`text-sm truncate ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
                      {playlist.description || "No description"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSharePlaylist(playlist.id)
                      }}
                      className={`p-2 rounded-full transition-colors duration-200 ${
                        isDark
                          ? "hover:bg-zinc-600 text-zinc-400 hover:text-white"
                          : "hover:bg-gray-200 text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      <Share2 size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedPlaylist(playlist)
                        setNewPlaylistName(playlist.name)
                        setNewPlaylistDescription(playlist.description)
                        setNewPlaylistCover(null)
                        setShowEditModal(true)
                      }}
                      className={`p-2 rounded-full transition-colors duration-200 ${
                        isDark
                          ? "hover:bg-zinc-600 text-zinc-400 hover:text-white"
                          : "hover:bg-gray-200 text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeletePlaylist(playlist.id)
                      }}
                      className={`p-2 rounded-full transition-colors duration-200 ${
                        isDark
                          ? "hover:bg-zinc-600 text-zinc-400 hover:text-white"
                          : "hover:bg-gray-200 text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {playlists.length === 0 && (
                <div className={`text-center py-8 ${isDark ? "text-zinc-400" : "text-gray-500"}`}>No playlists yet</div>
              )}
            </div>
          </div>
        </div>

        {selectedPlaylist && (
          <div className={`p-6 rounded-lg ${isDark ? "bg-zinc-800/50" : "bg-white shadow-lg"}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">{selectedPlaylist.name}</h2>
              <div>
                <button
                  onClick={() => handleSharePlaylist(selectedPlaylist.id)}
                  className="mr-2 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200"
                >
                  <Share2 size={20} />
                </button>
                <button
                  onClick={() => handleDeletePlaylist(selectedPlaylist.id)}
                  className="hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
              {playlistTracks.map((track) => (
                <div
                  key={`playlist-track-${track.id}`}
                  className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                    isDark ? "bg-zinc-700/50 hover:bg-zinc-600/50" : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <img
                    src={track.album?.cover_medium || "/placeholder.svg"}
                    alt={track.album?.title || "Album cover"}
                    className="w-16 h-16 rounded-md object-cover shadow-md"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{track.title}</h3>
                    <p className={`text-sm truncate ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
                      {track.artist?.name || "Unknown Artist"}
                    </p>
                  </div>
                  <button
                    onClick={() => setTrack(track)}
                    className={`p-3 rounded-full transition-colors duration-200 ${
                      currentTrack?.id === track.id && isPlaying
                        ? "bg-green-500 text-white"
                        : isDark
                          ? "bg-zinc-600 text-white hover:bg-zinc-500"
                          : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                    }`}
                  >
                    <Play size={20} />
                  </button>
                  <button
                    onClick={() => handleRemoveTrackFromPlaylist(selectedPlaylist.id, track.id.toString())}
                    className={`p-3 rounded-full transition-colors duration-200 ${
                      isDark
                        ? "bg-zinc-600 text-white hover:bg-zinc-500"
                        : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                    }`}
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              {playlistTracks.length === 0 && (
                <div className={`text-center py-8 ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
                  No tracks in this playlist yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`p-6 rounded-lg w-full max-w-md ${isDark ? "bg-zinc-900" : "bg-white"}`}>
            <h2 className="text-2xl font-bold mb-4">Create Playlist</h2>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Playlist name"
              className={`w-full p-2 rounded mb-4 transition-colors duration-200 ${
                isDark
                  ? "bg-zinc-800 text-white placeholder-zinc-400 focus:bg-zinc-700"
                  : "bg-gray-100 text-gray-900 placeholder-gray-500 focus:bg-gray-50"
              }`}
            />
            <textarea
              value={newPlaylistDescription}
              onChange={(e) => setNewPlaylistDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={3}
              className={`w-full p-2 rounded mb-4 transition-colors duration-200 ${
                isDark
                  ? "bg-zinc-800 text-white placeholder-zinc-400 focus:bg-zinc-700"
                  : "bg-gray-100 text-gray-900 placeholder-gray-500 focus:bg-gray-50"
              }`}
            />
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-zinc-400" : "text-gray-700"}`}>
                Cover Image (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewPlaylistCover(e.target.files?.[0] || null)}
                className={`w-full p-2 rounded border ${
                  isDark ? "border-zinc-700 text-zinc-400" : "border-gray-300 text-gray-700"
                }`}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className={`px-4 py-2 rounded transition-colors duration-200 ${
                  isDark ? "bg-zinc-800 hover:bg-zinc-700" : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlaylist}
                className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 transition-colors duration-200"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Playlist Modal */}
      {showEditModal && selectedPlaylist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`p-6 rounded-lg w-full max-w-md ${isDark ? "bg-zinc-900" : "bg-white"}`}>
            <h2 className="text-2xl font-bold mb-4">Edit Playlist</h2>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Playlist name"
              className={`w-full p-2 rounded mb-4 transition-colors duration-200 ${
                isDark
                  ? "bg-zinc-800 text-white placeholder-zinc-400 focus:bg-zinc-700"
                  : "bg-gray-100 text-gray-900 placeholder-gray-500 focus:bg-gray-50"
              }`}
            />
            <textarea
              value={newPlaylistDescription}
              onChange={(e) => setNewPlaylistDescription(e.target.value)}
              placeholder="Description"
              rows={3}
              className={`w-full p-2 rounded mb-4 transition-colors duration-200 ${
                isDark
                  ? "bg-zinc-800 text-white placeholder-zinc-400 focus:bg-zinc-700"
                  : "bg-gray-100 text-gray-900 placeholder-gray-500 focus:bg-gray-50"
              }`}
            />
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-zinc-400" : "text-gray-700"}`}>
                Cover Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewPlaylistCover(e.target.files?.[0] || null)}
                className={`w-full p-2 rounded border ${
                  isDark ? "border-zinc-700 text-zinc-400" : "border-gray-300 text-gray-700"
                }`}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowEditModal(false)}
                className={`px-4 py-2 rounded transition-colors duration-200 ${
                  isDark ? "bg-zinc-800 hover:bg-zinc-700" : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePlaylist}
                className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 transition-colors duration-200"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

