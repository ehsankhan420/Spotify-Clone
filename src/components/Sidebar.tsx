import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Library, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/auth-store';

export function Sidebar() {
  const location = useLocation();
  const signOut = useAuthStore((state) => state.signOut);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 md:relative w-full md:w-64 bg-black p-3 md:p-6 min-h-[64px] md:min-h-screen flex flex-row md:flex-col justify-between md:justify-start items-center md:items-stretch z-50">
      <div className="hidden md:block mb-0 md:mb-8">
      <h1 className="text-2xl md:text-3xl font-bold text-white text-center flex items-center justify-center gap-2">
        <svg viewBox="0 0 16 16" className="w-8 h-8" fill="currentColor">
          <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.669 11.538a.498.498 0 0 1-.686.165c-1.879-1.147-4.243-1.407-7.028-.77a.499.499 0 0 1-.222-.973c3.048-.696 5.662-.397 7.77.892a.5.5 0 0 1 .166.686zm.979-2.178a.624.624 0 0 1-.858.205c-2.15-1.321-5.428-1.704-7.972-.932a.625.625 0 0 1-.362-1.194c2.905-.881 6.517-.454 8.986 1.063a.624.624 0 0 1 .206.858zm.084-2.268C10.154 5.56 5.9 5.419 3.438 6.166a.748.748 0 1 1-.434-1.432c2.825-.857 7.523-.692 10.492 1.07a.747.747 0 1 1-.764 1.288z" />
        </svg>
        Spotify
      </h1>
      </div>

      <nav className="flex flex-row md:flex-col items-center md:items-stretch justify-center w-full md:w-auto space-x-8 md:space-x-0 md:space-y-4">
        <Link
          to="/"
          className={`flex flex-col md:flex-row items-center md:space-x-3 text-sm font-medium transition-colors duration-200 ${
            isActive('/') ? 'text-white' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Home size={24} className="mb-1 md:mb-0" />
          <span className="text-xs md:text-sm">Home</span>
        </Link>

        <Link
          to="/search"
          className={`flex flex-col md:flex-row items-center md:space-x-3 text-sm font-medium transition-colors duration-200 ${
            isActive('/search') ? 'text-white' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Search size={24} className="mb-1 md:mb-0" />
          <span className="text-xs md:text-sm">Search</span>
        </Link>

        <Link
          to="/library"
          className={`flex flex-col md:flex-row items-center md:space-x-3 text-sm font-medium transition-colors duration-200 ${
            isActive('/library') ? 'text-white' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Library size={24} className="mb-1 md:mb-0" />
          <span className="text-xs md:text-sm">Library</span>
        </Link>

        <button
          onClick={() => signOut()}
          className="flex flex-col md:flex-row items-center md:space-x-3 text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200 md:hidden"
        >
          <LogOut size={24} className="mb-1 md:mb-0" />
          <span className="text-xs md:text-sm">Logout</span>
        </button>
      </nav>

      <button
        onClick={() => signOut()}
        className="hidden md:flex items-center space-x-3 text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200 mt-auto pt-8"
      >
        <LogOut size={20} />
        <span>Log out</span>
      </button>
    </div>
  );
}