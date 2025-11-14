import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useSyncQueue } from '../hooks/useSyncQueue';
import { Sidebar } from './Sidebar';
import { TaskListView } from './TaskListView';
import { Wifi, Loader } from 'lucide-react';

export function AppLayout() {
  const fetchTaskLists = useStore(state => state.fetchTaskLists);
  const { isSyncing, isOnline, queue } = useSyncQueue();

  useEffect(() => {
    fetchTaskLists();
  }, [fetchTaskLists]);

  return (
    <div className="flex h-screen bg-white flex-col">
      <div className="flex flex-1">
        <Sidebar />
        <TaskListView />
      </div>

      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50 text-xs">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-gray-600">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {queue.length > 0 && (
          <div className="flex items-center gap-2">
            {isSyncing ? (
              <>
                <Loader className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                <span className="text-gray-600">Syncing...</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-gray-600">{queue.length} pending</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
