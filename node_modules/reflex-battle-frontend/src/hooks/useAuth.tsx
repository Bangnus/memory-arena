'use client';

import * as React from 'react';

export interface PlayerProfile {
  id: string;
  lineId: string;
  displayName: string;
  pictureUrl: string | null;
}

interface AuthContextType {
  token: string | null;
  player: PlayerProfile | null;
  login: (token: string, player: PlayerProfile) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = React.useState<string | null>(null);
  const [player, setPlayer] = React.useState<PlayerProfile | null>(null);

  React.useEffect(() => {
    // Initialize from local storage on mount, fallback to Mock Dev user for easy UI testing
    const storedToken = localStorage.getItem('token');
    const storedPlayer = localStorage.getItem('player');
    
    if (storedToken && storedPlayer) {
      setToken(storedToken);
      try {
        setPlayer(JSON.parse(storedPlayer));
      } catch (e) {
        console.error('Failed to parse stored player', e);
      }
    } else {
      // Default Mock User for Dev UI previewing
      const mockPlayer: PlayerProfile = {
        id: 'dev-player-1',
        lineId: 'line-dev-123',
        displayName: 'Dev Champion',
        pictureUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=DevChampion',
      };
      setToken('mock-dev-token');
      setPlayer(mockPlayer);
    }
  }, []);

  const login = (newToken: string, newPlayer: PlayerProfile) => {
    setToken(newToken);
    setPlayer(newPlayer);
    localStorage.setItem('token', newToken);
    localStorage.setItem('player', JSON.stringify(newPlayer));
  };

  const logout = () => {
    setToken(null);
    setPlayer(null);
    localStorage.removeItem('token');
    localStorage.removeItem('player');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        player,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
