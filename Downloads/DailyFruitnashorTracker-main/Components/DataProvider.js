/* DataProvider.js */
import React, { createContext, useContext, useState } from 'react';

function emptyDay() {                     // ← теперь с log-полями
  return { fruitLog: [], water: [], fruit: {} };
}

export const DataCtx = createContext();

export default function DataProvider({ children }) {
  const [days, setDays]           = useState({});
  const [currentDate, setDateRaw] = useState(null);        // YYYY-MM-DD

  /* гарантируем строку-дату ------------------------------- */
  const setCurrentDate = v => {
    const s = v instanceof Date ? v.toISOString().slice(0,10)
                                : String(v).slice(0,10);
    setDateRaw(p => (p === s ? p : s));
  };

  /* + / – фрукт (diff > 0 — добавляем запись в fruitLog) --- */
  const addFruit = (dateStr, fruitId, diff) =>
    setDays(prev => {
      const d   = prev[dateStr] ?? emptyDay();
      const qty = Math.max(0, (d.fruit[fruitId] ?? 0) + diff);

      const log = diff > 0
        ? [...d.fruitLog, { id: fruitId, ts: Date.now() }]
        : d.fruitLog;                    // уменьшение — лог не трогаем

      return { ...prev,
        [dateStr]: { ...d,
          fruitLog: log,
          fruit: { ...d.fruit, [fruitId]: qty },
        },
      };
    });

  /* напиток ------------------------------------------------- */
  const addDrink = (dateStr, drink, ml, ts) =>
    setDays(prev => {
      const d = prev[dateStr] ?? emptyDay();
      return { ...prev,
        [dateStr]: { ...d,
          water: [...d.water, { drink, ml, ts }],
        },
      };
    });

  return (
    <DataCtx.Provider
      value={{ days, currentDate, setCurrentDate, addFruit, addDrink }}
    >
      {children}
    </DataCtx.Provider>
  );
}

export const useTracker = () => useContext(DataCtx);
