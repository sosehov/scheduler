import { useState } from "react";
export default function useVisualMode(initial) {
  const [history, setHistory] = useState([initial]); 

  function transition(newMode, replace = false) {
    setHistory(prev => {
      if (replace) {
        return [...prev.slice(0, prev.length - 1), newMode];
      } else {
        return [...prev, newMode];
      }
    });
  }

  function back() {
    setHistory(prev => {
      if (prev.length > 1) {
        return [...prev.slice(0, prev.length - 1)];
      }
      return prev; // Don't change history if there's only one mode
    });
  }

  return { mode: history[history.length -1], transition, back };
}