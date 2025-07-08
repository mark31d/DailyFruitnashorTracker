// Components/FavoritesContext.js
// ▸ хранит избранные смузи в одном месте
// ▸ toggle удаляет ключ, если он уже есть – не оставляет false

import React, { createContext, useContext, useState } from 'react';

const FavoritesContext = createContext();

/**
 * FavoritesProvider оборачивает всё приложение
 *   <FavoritesProvider> … </FavoritesProvider>
 *
 *  favs — объект вида { [id]: true }
 *  toggle(id) — добавляет / удаляет id из favs
 */
export const FavoritesProvider = ({ children }) => {
  const [favs, setFavs] = useState({}); // { banana:true, mango:true, … }

  const toggle = id =>
    setFavs(prev => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];   // уже был избранным → убираем
      } else {
        next[id] = true;   // не было → добавляем
      }
      return next;
    });

  return (
    <FavoritesContext.Provider value={{ favs, toggle }}>
      {children}
    </FavoritesContext.Provider>
  );
};

/** хук для доступа к избранному */
export const useFavorites = () => useContext(FavoritesContext);
