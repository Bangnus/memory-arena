export interface PlayerAuthData {
  lineUserId: string;
  displayName: string;
  pictureUrl: string | null;
  timestamp: number;
}

// In-memory store for session-based auth handshakes
// Key format: `${sessionId}_${role}`
const authStore = new Map<string, PlayerAuthData>();

// TTL: 10 minutes
const TTL_MS = 10 * 60 * 1000;

export const AuthSessionManager = {
  setPlayer: (sessionId: string, role: string | number, data: Omit<PlayerAuthData, 'timestamp'>) => {
    const key = `${sessionId}_${role}`;
    authStore.set(key, {
      ...data,
      timestamp: Date.now(),
    });
    // Auto cleanup old keys
    for (const [k, v] of authStore.entries()) {
      if (Date.now() - v.timestamp > TTL_MS) {
        authStore.delete(k);
      }
    }
  },

  getPlayer: (sessionId: string, role: string | number): PlayerAuthData | null => {
    const key = `${sessionId}_${role}`;
    const data = authStore.get(key);
    if (!data) return null;
    if (Date.now() - data.timestamp > TTL_MS) {
      authStore.delete(key);
      return null;
    }
    return data;
  },

  consumePlayer: (sessionId: string, role: string | number): PlayerAuthData | null => {
    const key = `${sessionId}_${role}`;
    const data = authStore.get(key);
    if (!data) return null;
    authStore.delete(key);
    return data;
  },
};
