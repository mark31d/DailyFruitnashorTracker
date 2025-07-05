// contexts/TriedContext.js
import React, { createContext, useState } from 'react';

export const TriedContext = createContext({
  tried: {},
  setTried: () => {},
});

export function TriedProvider({ children }) {
  const [tried, setTried] = useState({});
  return (
    <TriedContext.Provider value={{ tried, setTried }}>
      {children}
    </TriedContext.Provider>
  );
}
