import { useEffect, useRef, useCallback } from 'react';
import { useSocket } from './useSocket';

const SYNC_SAMPLES = 5;

export const useTimeSync = () => {
  const { socket, isConnected } = useSocket();
  const timeOffsetRef = useRef<number>(0);
  const isSyncedRef = useRef<boolean>(false);
  const syncOffsetsRef = useRef<number[]>([]);

  const getSyncedTime = useCallback(() => {
    return Date.now() + timeOffsetRef.current;
  }, []);

  useEffect(() => {
    if (!socket || !isConnected) {
      isSyncedRef.current = false;
      return;
    }

    const performSync = () => {
      const clientTime = Date.now();
      socket.emit('time:sync', { clientTime });
    };

    const handleTimeSyncAck = (data: { clientTime: number; serverTime: number }) => {
      const receiveTime = Date.now();
      const latency = (receiveTime - data.clientTime) / 2;
      const offset = data.serverTime - (data.clientTime + latency);

      syncOffsetsRef.current.push(offset);

      if (syncOffsetsRef.current.length < SYNC_SAMPLES) {
        // Send next ping
        setTimeout(performSync, 100);
      } else {
        // Calculate median offset
        syncOffsetsRef.current.sort((a, b) => a - b);
        const medianIndex = Math.floor(SYNC_SAMPLES / 2);
        timeOffsetRef.current = syncOffsetsRef.current[medianIndex];
        isSyncedRef.current = true;
        
        console.log(`[TimeSync] Complete. Median offset: ${timeOffsetRef.current}ms, latency ~${latency}ms`);
      }
    };

    socket.on('time:sync:ack', handleTimeSyncAck);

    // Start sync process
    syncOffsetsRef.current = [];
    performSync();

    return () => {
      socket.off('time:sync:ack', handleTimeSyncAck);
    };
  }, [socket, isConnected]);

  return { getSyncedTime, isSynced: isSyncedRef.current };
};
