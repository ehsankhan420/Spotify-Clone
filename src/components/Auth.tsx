import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Moon, Sun } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useThemeStore } from '../store/theme-store';

export function Auth() {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-200 ${isDark ? 'bg-black' : 'bg-gray-100'}`}>
      <button
        onClick={toggleTheme}
        className={`fixed top-4 right-4 p-2 rounded-full ${
          isDark ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-white text-gray-800 hover:bg-gray-200'
        } transition-colors duration-200 shadow-md`}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className={`max-w-md w-full p-8 rounded-lg transition-colors duration-200 shadow-lg ${
        isDark ? 'bg-zinc-900' : 'bg-white'
      }`}>
        <div className="mb-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-white text-center flex items-center justify-center gap-2">
        <svg viewBox="0 0 16 16" className="w-8 h-8" fill="currentColor">
          <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.669 11.538a.498.498 0 0 1-.686.165c-1.879-1.147-4.243-1.407-7.028-.77a.499.499 0 0 1-.222-.973c3.048-.696 5.662-.397 7.77.892a.5.5 0 0 1 .166.686zm.979-2.178a.624.624 0 0 1-.858.205c-2.15-1.321-5.428-1.704-7.972-.932a.625.625 0 0 1-.362-1.194c2.905-.881 6.517-.454 8.986 1.063a.624.624 0 0 1 .206.858zm.084-2.268C10.154 5.56 5.9 5.419 3.438 6.166a.748.748 0 1 1-.434-1.432c2.825-.857 7.523-.692 10.492 1.07a.747.747 0 1 1-.764 1.288z" />
        </svg>
        Spotify
      </h1>
          <p className={isDark ? 'text-zinc-400' : 'text-gray-600'}>
            Sign in to continue
          </p>
        </div>
        
        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#1DB954',
                  brandAccent: '#1ed760',
                  inputBackground: isDark ? '#27272a' : '#f9fafb',
                  inputText: isDark ? 'white' : 'black',
                },
              },
            },
            className: {
              container: 'auth-container',
              button: `w-full px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                isDark ? 'text-white bg-zinc-800 hover:bg-zinc-700' : 'text-gray-900 bg-gray-200 hover:bg-gray-300'
              } shadow-md`,
              input: `w-full px-4 py-2 rounded-md border ${
                isDark ? 'border-zinc-700 bg-zinc-800 text-white' : 'border-gray-300 bg-gray-50 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-green-500`,
            },
          }}
          providers={['google', 'facebook']}
        />
      </div>
    </div>
  );
}