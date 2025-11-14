import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { useSyncQueue } from '../hooks/useSyncQueue';
import { Sidebar } from './Sidebar';
import { TaskListView } from './TaskListView';
import { Wifi, Loader, Menu, X, Moon, Sun } from 'lucide-react';

export function AppLayout() {
  const fetchTaskLists = useStore(state => state.fetchTaskLists);
  const { isSyncing, isOnline, queue } = useSyncQueue();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' ||
        (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    fetchTaskLists();
  }, [fetchTaskLists]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 flex-col">
      <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X className="w-5 h-5 text-gray-700 dark:text-gray-300" /> : <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
        </button>
        <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">Tasks</h1>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-gray-300" /> : <Moon className="w-5 h-5 text-gray-700" />}
        </button>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        {isSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <div className={`lg:relative fixed inset-y-0 left-0 z-20 transform transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <Sidebar onClose={() => setIsSidebarOpen(false)} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        </div>
        <TaskListView />
      </div>

      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-gray-600 dark:text-gray-400">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {queue.length > 0 && (
          <div className="flex items-center gap-2">
            {isSyncing ? (
              <>
                <Loader className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                <span className="text-gray-600 dark:text-gray-400">Syncing...</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-gray-600 dark:text-gray-400">{queue.length} pending</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
