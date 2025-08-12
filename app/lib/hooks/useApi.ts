'use client';

export default function useApi() {
  const fetchAuthed = async (url: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include', // 👈 esto envía las cookies httpOnly automáticamente
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en fetchAuthed:', {
        url,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      throw error;
    }
  };

  return { fetchAuthed };
}
