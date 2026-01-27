import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(false);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const offline = state.isConnected === false;
      // isInternetReachable can be null initially, we treat null as 'maybe online' to avoid flashing
      const reachable = state.isInternetReachable;
      
      setIsOffline(offline);
      setIsInternetReachable(reachable);
    });

    return () => unsubscribe();
  }, []);

  return { isOffline, isInternetReachable };
}
