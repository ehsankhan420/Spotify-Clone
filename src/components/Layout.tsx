import { Outlet } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Player } from './Player';
import { useThemeStore } from '../store/theme-store';

export function Layout() {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <div className={`h-screen flex flex-col transition-colors duration-200 ${
      isDark ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'
    }`}>
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className={`flex-1 overflow-y-auto transition-colors duration-200 ${
          isDark 
            ? 'bg-gradient-to-b from-zinc-900 to-black' 
            : 'bg-gradient-to-b from-gray-200 to-gray-100'
        }`}>
          <div className="p-4 flex justify-end">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isDark 
                  ? 'bg-zinc-800 text-white hover:bg-zinc-700' 
                  : 'bg-white text-gray-800 hover:bg-gray-200'
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          <Outlet />
        </main>
      </div>
      <Player />
    </div>
  );
}