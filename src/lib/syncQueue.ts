export type SyncAction = {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'task' | 'task_list';
  entityId: string;
  data: Record<string, unknown>;
  timestamp: number;
  retries: number;
};

const QUEUE_STORAGE_KEY = 'sync_queue';
const MAX_RETRIES = 3;

export const syncQueueUtils = {
  getQueue: (): SyncAction[] => {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveQueue: (queue: SyncAction[]): void => {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch {
      console.error('Failed to save sync queue to localStorage');
    }
  },

  addAction: (action: Omit<SyncAction, 'id' | 'timestamp' | 'retries'>): SyncAction => {
    const newAction: SyncAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
    };

    const queue = syncQueueUtils.getQueue();
    queue.push(newAction);
    syncQueueUtils.saveQueue(queue);

    return newAction;
  },

  removeAction: (actionId: string): void => {
    const queue = syncQueueUtils.getQueue();
    const filtered = queue.filter(a => a.id !== actionId);
    syncQueueUtils.saveQueue(filtered);
  },

  incrementRetry: (actionId: string): void => {
    const queue = syncQueueUtils.getQueue();
    const action = queue.find(a => a.id === actionId);
    if (action) {
      action.retries += 1;
      syncQueueUtils.saveQueue(queue);
    }
  },

  clearQueue: (): void => {
    syncQueueUtils.saveQueue([]);
  },

  getFailedActions: (): SyncAction[] => {
    const queue = syncQueueUtils.getQueue();
    return queue.filter(a => a.retries >= MAX_RETRIES);
  },

  getPendingActions: (): SyncAction[] => {
    const queue = syncQueueUtils.getQueue();
    return queue.filter(a => a.retries < MAX_RETRIES);
  },
};
