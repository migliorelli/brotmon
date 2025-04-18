"use client";

import { useEffect, useState } from "react";

export function usePersistentState<T extends any>(key: string, initalValue: T) {
  const [state, setState] = useState<T>(() => {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      return JSON.parse(storedValue);
    }

    return initalValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [state]);

  return [state, setState] as const;
}
