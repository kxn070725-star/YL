export type GestureType = 'OPEN' | 'FIST' | 'NONE';
export type AppPhase = 'SNOW' | 'GATHER' | 'TREE';

export interface HandData {
  rawX: number; // 0 to 1
  rawY: number; // 0 to 1
  gesture: GestureType;
  isTracking: boolean;
}

export interface ThemeResponse {
  colors: string[];
  greeting: string;
  musicMood?: string;
}

export interface AppState {
  colors: string[];
  greeting: string;
  loading: boolean;
  themeName: string;
  musicMood?: string;
  isPlayingMusic: boolean;
  phase: AppPhase;
}