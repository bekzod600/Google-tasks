import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Sidebar } from './Sidebar';
import { TaskListView } from './TaskListView';

export function AppLayout() {
  const fetchTaskLists = useStore(state => state.fetchTaskLists);

  useEffect(() => {
    fetchTaskLists();
  }, [fetchTaskLists]);

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <TaskListView />
    </div>
  );
}
