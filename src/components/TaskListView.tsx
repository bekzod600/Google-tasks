import { useState } from 'react';
import { useStore } from '../store/useStore';
import { TaskItem } from './TaskItem';
import { Plus } from 'lucide-react';

export function TaskListView() {
  const { taskLists, tasks, selectedListId, addTask } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const selectedList = taskLists.find(list => list.id === selectedListId);

  const handleAddTask = async () => {
    if (newTaskTitle.trim() && selectedListId) {
      await addTask(selectedListId, newTaskTitle.trim());
      setNewTaskTitle('');
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
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>Select a list or create a new one</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b border-gray-200 px-8 py-6">
        <h2 className="text-2xl font-medium text-gray-900">{selectedList.name}</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {tasks.length === 0 && !isAdding ? (
          <div className="text-center text-gray-400 mt-12">
            <p>No tasks yet</p>
          </div>
        ) : (
          <div className="space-y-1 max-w-2xl">
            {tasks.map(task => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}

        {isAdding ? (
          <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mt-2 rounded-lg bg-gray-50">
            <div className="w-5 h-5 rounded border-2 border-gray-300 flex-shrink-0" />
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleAddTask}
              placeholder="Add a new task..."
              className="flex-1 px-2 py-1 text-gray-700 bg-transparent focus:outline-none placeholder-gray-400"
              autoFocus
            />
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-3 mt-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Add task</span>
          </button>
        )}
      </div>
    </div>
  );
}
