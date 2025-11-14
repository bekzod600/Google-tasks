import { useEffect, useState, useCallback } from 'react';
import { syncQueueUtils, SyncAction } from '../lib/syncQueue';

export function useSyncQueue() {
  const [queue, setQueue] = useState<SyncAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const updatedQueue = syncQueueUtils.getQueue();
    setQueue(updatedQueue);
  }, []);

  const simulateSync = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    const pendingActions = syncQueueUtils.getPendingActions();
    if (pendingActions.length === 0) return;

    setIsSyncing(true);

    console.log('🔄 Starting sync...');
    console.log('📋 Pending actions:', pendingActions);

    for (const action of pendingActions) {
      try {
        console.log(`✨ Syncing ${action.type} action for ${action.entity}:`, {
          entityId: action.entityId,
          data: action.data,
          retries: action.retries,
        });

        await new Promise(resolve => setTimeout(resolve, 500));

        syncQueueUtils.removeAction(action.id);
        console.log(`✅ Successfully synced action ${action.id}`);
      } catch (error) {
        console.error(`❌ Failed to sync action ${action.id}:`, error);
        syncQueueUtils.incrementRetry(action.id);
      }
    }

    const remainingQueue = syncQueueUtils.getQueue();
    setQueue(remainingQueue);
    setIsSyncing(false);

    if (remainingQueue.length === 0) {
      console.log('✨ All actions synced successfully!');
    } else {
      console.log(`⚠️ ${remainingQueue.length} actions still pending`);
    }
  }, [isOnline, isSyncing]);

  useEffect(() => {
    if (!isOnline || queue.length === 0) return;

    const syncInterval = setInterval(() => {
      simulateSync();
    }, 5000);

    simulateSync();

    return () => clearInterval(syncInterval);
  }, [isOnline, queue.length, simulateSync]);

  const addToQueue = useCallback(
    (action: Omit<SyncAction, 'id' | 'timestamp' | 'retries'>) => {
      const newAction = syncQueueUtils.addAction(action);
      const updatedQueue = syncQueueUtils.getQueue();
      setQueue(updatedQueue);
      return newAction;
    },
    []
  );

  return {
    queue,
    isSyncing,
    isOnline,
    addToQueue,
    simulateSync,
  };
}
