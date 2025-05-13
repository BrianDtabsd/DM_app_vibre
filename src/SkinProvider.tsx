// src/SkinProvider.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SKINS, AppSkin } from './skins';

interface SkinContextProps {
  skin: AppSkin;
  setSkinByName: (name: string) => void;
  availableSkins: AppSkin[];
}

const SkinContext = createContext<SkinContextProps | undefined>(undefined);

export const SkinProvider = ({ children }: { children: ReactNode }) => {
  const [skinName, setSkinName] = useState(SKINS[0].name);
  const skin = SKINS.find(s => s.name === skinName) || SKINS[0];

  const setSkinByName = (name: string) => {
    if (SKINS.some(s => s.name === name)) setSkinName(name);
  };

  return (
    <SkinContext.Provider value={{ skin, setSkinByName, availableSkins: SKINS }}>
      <div style={{
        background: skin.palette.background,
        color: skin.palette.text,
        fontFamily: skin.fontFamily,
        minHeight: '100vh',
        transition: 'background 0.4s, color 0.4s',
      }}>
        {children}
      </div>
    </SkinContext.Provider>
  );
};

export const useSkin = () => {
  const ctx = useContext(SkinContext);
  if (!ctx) throw new Error('useSkin must be used within SkinProvider');
  return ctx;
};
