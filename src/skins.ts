// src/skins.ts
// Defines available UI skins (themes) for the app

export interface AppSkin {
  name: string;
  palette: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    border: string;
    [key: string]: string;
  };
  fontFamily?: string;
  customStyles?: Record<string, any>;
}

export const SKINS: AppSkin[] = [
  {
    name: 'Neon Dark',
    palette: {
      background: '#181825',
      surface: '#23233a',
      primary: '#8A2BE2',
      secondary: '#00ffe7',
      accent: '#ff00cc',
      text: '#f8f8ff',
      border: '#39397c',
    },
    fontFamily: 'Orbitron, sans-serif',
  },
  {
    name: 'Winamp Classic',
    palette: {
      background: '#2f2f2f',
      surface: '#4d4d4d',
      primary: '#ffcc00',
      secondary: '#00baff',
      accent: '#ff3300',
      text: '#ffffff',
      border: '#808080',
    },
    fontFamily: 'Tahoma, Geneva, Verdana, sans-serif',
  },
];
