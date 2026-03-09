"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "lexi-font-size";
const MIN = 0.8;
const MAX = 1.4;
const STEP = 0.1;
const DEFAULT = 1;

export function useFontSize() {
  const [size, setSize] = useState(DEFAULT);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = parseFloat(stored);
      if (!isNaN(parsed) && parsed >= MIN && parsed <= MAX) {
        setSize(parsed);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(size));
  }, [size]);

  const increase = useCallback(() => {
    setSize((s) => Math.min(MAX, Math.round((s + STEP) * 10) / 10));
  }, []);

  const decrease = useCallback(() => {
    setSize((s) => Math.max(MIN, Math.round((s - STEP) * 10) / 10));
  }, []);

  return { size, increase, decrease };
}
