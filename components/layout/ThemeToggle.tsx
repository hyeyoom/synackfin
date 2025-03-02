'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-500"
    >
      {theme === 'dark' ? '🌞' : '🌙'}
    </button>
  );
} 