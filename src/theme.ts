export interface Theme {
  name: 'black' | 'white';
  bg: string;
  card: string;
  key: string;
  text: string;
  subText: string;
  accent: string;
  accentText: string;
  border: string;
  danger: string;
  statusBar: 'light' | 'dark';
}

export const themes: Record<'black' | 'white', Theme> = {
  black: {
    name: 'black',
    bg: '#000000',
    card: '#0B0B0B',
    key: '#121212',
    text: '#FFFFFF',
    subText: '#9E9E9E',
    accent: '#4FC3F7',
    accentText: '#000000',
    border: '#1E1E1E',
    danger: '#FF6B6B',
    statusBar: 'light',
  },
  white: {
    name: 'white',
    bg: '#FFFFFF',
    card: '#F7F7F7',
    key: '#F2F2F2',
    text: '#000000',
    subText: '#616161',
    accent: '#0288D1',
    accentText: '#FFFFFF',
    border: '#E0E0E0',
    danger: '#D32F2F',
    statusBar: 'dark',
  },
};
