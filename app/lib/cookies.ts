// lib/cookies.ts
'use client';

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue || null;
  }
  return null;
}

interface CookieOptions {
  days?: number;
  path?: string;
  secure?: boolean;
}

export function setCookie(
  name: string, 
  value: string, 
  options: CookieOptions = {}
): void {
  if (typeof document === 'undefined') return;

  let cookie = `${name}=${value}`;

  if (options.days) {
    const date = new Date();
    date.setTime(date.getTime() + (options.days * 24 * 60 * 60 * 1000));
    cookie += `; expires=${date.toUTCString()}`;
  }

  cookie += `; path=${options.path || '/'}`;

  if (options.secure) {
    cookie += '; secure';
  }

  document.cookie = cookie;
}

export function deleteCookie(name: string, path: string = '/'): void {
  setCookie(name, '', { days: -1, path });
}