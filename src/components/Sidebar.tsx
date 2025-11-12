import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, List, Trash2 } from 'lucide-react';

export function Sidebar() {
  const { taskLists, selectedListId, setSelectedListId, addTaskList, deleteTaskList } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newListName, setNewListName] = useState('');

  const handleAddList = async () => {
    if (newListName.trim()) {
      await addTaskList(newListName.trim());
      setNewListName('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddList();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewListName('');
    }
  };

  return (
    <div className="w-64 border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-medium text-gray-900">Task Lists</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {taskLists.map(list => (
          <div
            key={list.id}
            className={`group flex items-center justify-between px-3 py-2 rounded-lg mb-1 cursor-pointer transition-colors ${
              selectedListId === list.id
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setSelectedListId(list.id)}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <List className="w-4 h-4 flex-shrink-0" />
              <span className="truncate text-sm">{list.name}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete "${list.name}"?`)) {
                  deleteTaskList(list.id);
                }
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
            >
              <Trash2 className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-gray-200">
        {isAdding ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleAddList}
              placeholder="List name"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
              autoFocus
            />
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add List</span>
          </button>
        )}
      </div>
    </div>
  );
}
