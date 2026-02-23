"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-fg-tertiary hover:text-fg hover:bg-active/50 transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        {isDark ? (
          <path d="M6.2 1.6a6.5 6.5 0 1 0 8.2 8.2A5 5 0 0 1 6.2 1.6Z" />
        ) : (
          <path d="M8 0a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0V1a1 1 0 0 1 1-1Zm0 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5 2a1 1 0 1 0 0 2h1a1 1 0 1 0 0-2h-1ZM2 7a1 1 0 1 0 0 2h1a1 1 0 0 0 0-2H2Zm10.95-3.54a1 1 0 0 0-1.41 0l-.71.71a1 1 0 0 0 1.41 1.41l.71-.71a1 1 0 0 0 0-1.41ZM4.76 11.17a1 1 0 0 0-1.41 0l-.71.71a1 1 0 1 0 1.41 1.41l.71-.71a1 1 0 0 0 0-1.41Zm7.07.71a1 1 0 1 0-1.41 1.41l.71.71a1 1 0 1 0 1.41-1.41l-.71-.71ZM4.76 4.83a1 1 0 0 0 0-1.41l-.71-.71a1 1 0 0 0-1.41 1.41l.71.71a1 1 0 0 0 1.41 0ZM8 13a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Z" />
        )}
      </svg>
      {isDark ? "Dark Mode" : "Light Mode"}
    </button>
  );
}
