'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label="Toggle theme"
      data-theme={isDark ? 'dark' : 'light'}
    >
      <div className="theme-card">
        <div className="theme-face theme-face-front">
          <span className="theme-icon">☀️</span>
          <span>Day</span>
          <div className="theme-clouds">
            <div className="theme-cloud"></div>
            <div className="theme-cloud"></div>
          </div>
        </div>
        <div className="theme-face theme-face-back">
          <span className="theme-icon">🌙</span>
          <span>Night</span>
          <div className="theme-stars">
            <div className="theme-star"></div>
            <div className="theme-star"></div>
            <div className="theme-star"></div>
            <div className="theme-star"></div>
          </div>
        </div>
      </div>
    </button>
  );
}
