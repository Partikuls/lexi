"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "lexi-dyslexia-mode";

export function useDyslexiaMode() {
  const [enabled, setEnabled] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Read from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") {
      setEnabled(true);
    }
    setHydrated(true);
  }, []);

  // Sync to localStorage and DOM
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, String(enabled));

    if (enabled) {
      document.documentElement.classList.add("dyslexia");
    } else {
      document.documentElement.classList.remove("dyslexia");
    }
  }, [enabled, hydrated]);

  const toggle = useCallback(() => setEnabled((prev) => !prev), []);

  return { enabled, toggle, hydrated };
}
