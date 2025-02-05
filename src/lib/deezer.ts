const CORS_PROXY = 'https://corsproxy.io/?';
const DEEZER_API = 'https://api.deezer.com';

export interface DeezerTrack {
  id: number;
  title: string;
  duration: number;
  preview: string;
  artist: {
    id: number;
    name: string;
    picture_small: string;
    picture_medium: string;
  };
  album: {
    id: number;
    title: string;
    cover_small: string;
    cover_medium: string;
  };
}

export interface DeezerSearchResult {
  data: DeezerTrack[];
  total: number;
  next?: string;
}

export async function searchTracks(query: string): Promise<DeezerSearchResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const url = `${CORS_PROXY}${encodeURIComponent(
      `${DEEZER_API}/search?q=${encodeURIComponent(query)}`
    )}`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Search tracks error:', error);
    throw new Error('Failed to search tracks');
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getTrack(id: string): Promise<DeezerTrack> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const url = `${CORS_PROXY}${encodeURIComponent(`${DEEZER_API}/track/${id}`)}`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get track error:', error);
    throw new Error('Failed to get track');
  } finally {
    clearTimeout(timeoutId);
  }
}