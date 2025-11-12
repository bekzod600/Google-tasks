import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Task } from '../lib/supabase';
import { Check, Trash2, Calendar } from 'lucide-react';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { toggleTask, deleteTask, updateTask } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const handleSaveEdit = async () => {
    if (editTitle.trim() && editTitle !== task.title) {
      await updateTask(task.id, { title: editTitle.trim() });
    } else {
      setEditTitle(task.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditTitle(task.title);
      setIsEditing(false);
    }
  };

  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed;
  const dueDateDisplay = formatDueDate(task.due_date);

  return (
    <div className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 animate-fadeIn">
      <button
        onClick={() => toggleTask(task.id, !task.completed)}
        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
          task.completed
            ? 'bg-blue-500 border-blue-500'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {task.completed && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </button>

      {isEditing ? (
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSaveEdit}
          className="flex-1 px-2 py-1 text-gray-700 border border-blue-400 rounded focus:outline-none"
          autoFocus
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className={`flex-1 cursor-text transition-all duration-200 ${
            task.completed ? 'text-gray-400 line-through' : 'text-gray-700'
          }`}
        >
          {task.title}
        </span>
      )}

      {dueDateDisplay && (
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-all duration-200 ${
            isOverdue
              ? 'bg-red-50 text-red-600'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          <Calendar className="w-3 h-3" />
          <span>{dueDateDisplay}</span>
        </div>
      )}

      <button
        onClick={() => {
          if (confirm('Delete this task?')) {
            deleteTask(task.id);
          }
        }}
        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-100 rounded transition-all duration-200"
      >
        <Trash2 className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );
}
