import React, { createContext, useState } from 'react';

export type Config = {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
};

// The default value is null, but we tell createContext what the shape will be when it has a value.
export const ConfigContext = createContext<Config | null>(null);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // We can get the user's system preference for the initial state
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [theme, setTheme] = useState<'light' | 'dark'>(prefersDark ? 'dark' : 'light');

  return (
    <ConfigContext.Provider value={{ theme, setTheme }}>
      {children}
    </ConfigContext.Provider>
  );
};