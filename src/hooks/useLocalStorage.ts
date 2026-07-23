// hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

export default function useLocalStorage(key:any, initialValue:any) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch (error) {
      console.error("useLocalStorage error:", error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("localStorage set error:", error);
    }
  }, [key, value]);

  return [value, setValue];
}
