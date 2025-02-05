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
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Welcome to Musicify
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