import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { TaskItem } from './TaskItem';
import { Plus, Search, ChevronDown, ChevronUp } from 'lucide-react';

export function TaskListView() {
  const { taskLists, tasks, selectedListId, addTask, searchQuery, setSearchQuery, showCompleted, setShowCompleted } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const selectedList = taskLists.find(list => list.id === selectedListId);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCompleted = showCompleted || !task.completed;
      return matchesSearch && matchesCompleted;
    });
  }, [tasks, searchQuery, showCompleted]);

  const activeTasks = filteredTasks.filter(task => !task.completed);
  const completedTasks = filteredTasks.filter(task => task.completed);

  const handleAddTask = async () => {
    if (newTaskTitle.trim() && selectedListId) {
      await addTask(selectedListId, newTaskTitle.trim(), newTaskDueDate || null);
      setNewTaskTitle('');
      setNewTaskDueDate('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewTaskTitle('');
    }
  };

  if (!selectedList) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">
        <p>Select a list or create a new one</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 md:px-8 py-6">
        <h2 className="text-2xl font-medium text-gray-900 dark:text-gray-100">{selectedList.name}</h2>
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        {tasks.length === 0 && !isAdding ? (
          <div className="text-center text-gray-400 dark:text-gray-500 mt-12">
            <p>No tasks yet</p>
          </div>
        ) : (
          <>
            {activeTasks.length > 0 && (
              <div className="space-y-1 max-w-2xl">
                {activeTasks.map(task => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            )}

            {completedTasks.length > 0 && (
              <div className="mt-8 max-w-2xl">
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-3 transition-colors"
                >
                  {showCompleted ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <span>Completed ({completedTasks.length})</span>
                </button>
                {showCompleted && (
                  <div className="space-y-1">
                    {completedTasks.map(task => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {isAdding ? (
          <div className="max-w-2xl mt-2">
            <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 flex-shrink-0 mt-1" />
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Task title"
                  className="w-full px-2 py-1 text-gray-700 dark:text-gray-200 bg-transparent focus:outline-none placeholder-gray-400 dark:placeholder-gray-500"
                  autoFocus
                />
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="px-2 py-1 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded focus:outline-none focus:border-gray-400 dark:focus:border-gray-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddTask}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setNewTaskTitle('');
                      setNewTaskDueDate('');
                    }}
                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-3 mt-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Add task</span>
          </button>
        )}
      </div>
    </div>
  );
}
