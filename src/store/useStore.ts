import { create } from 'zustand';
import { supabase, TaskList, Task } from '../lib/supabase';
import { syncQueueUtils } from '../lib/syncQueue';

type Store = {
  taskLists: TaskList[];
  tasks: Task[];
  selectedListId: string | null;
  isLoading: boolean;
  searchQuery: string;
  showCompleted: boolean;

  fetchTaskLists: () => Promise<void>;
  fetchTasks: (listId: string) => Promise<void>;
  addTaskList: (name: string) => Promise<string | null>;
  renameTaskList: (id: string, name: string) => Promise<void>;
  deleteTaskList: (id: string) => Promise<void>;
  addTask: (listId: string, title: string, dueDate?: string | null) => Promise<void>;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'list_id' | 'created_at'>>) => Promise<void>;
  toggleTask: (id: string, completed: boolean) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  reorderTasks: (orderedTaskIds: string[]) => Promise<void>;
  setSelectedListId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setShowCompleted: (show: boolean) => void;
};

export const useStore = create<Store>((set, get) => ({
  taskLists: [],
  tasks: [],
  selectedListId: null,
  isLoading: false,
  searchQuery: '',
  showCompleted: true,

  fetchTaskLists: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('task_lists')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      set({ taskLists: data, isLoading: false });
      if (data.length > 0 && !get().selectedListId) {
        set({ selectedListId: data[0].id });
        get().fetchTasks(data[0].id);
      }
    } else {
      set({ isLoading: false });
    }
  },

  fetchTasks: async (listId: string) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('list_id', listId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      set({ tasks: data, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  addTaskList: async (name: string) => {
    syncQueueUtils.addAction({
      type: 'create',
      entity: 'task_list',
      entityId: `temp-${Date.now()}`,
      data: { name },
    });

    const { data, error } = await supabase
      .from('task_lists')
      .insert([{ name }])
      .select()
      .single();

    if (!error && data) {
      set({ taskLists: [...get().taskLists, data] });
      return data.id;
    }
    return null;
  },

  renameTaskList: async (id: string, name: string) => {
    syncQueueUtils.addAction({
      type: 'update',
      entity: 'task_list',
      entityId: id,
      data: { name },
    });

    await supabase
      .from('task_lists')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id);

    set({
      taskLists: get().taskLists.map(list =>
        list.id === id ? { ...list, name } : list
      ),
    });
  },

  deleteTaskList: async (id: string) => {
    syncQueueUtils.addAction({
      type: 'delete',
      entity: 'task_list',
      entityId: id,
      data: {},
    });

    await supabase.from('task_lists').delete().eq('id', id);
    const newLists = get().taskLists.filter(list => list.id !== id);
    set({ taskLists: newLists });

    if (get().selectedListId === id) {
      const newSelectedId = newLists.length > 0 ? newLists[0].id : null;
      set({ selectedListId: newSelectedId, tasks: [] });
      if (newSelectedId) {
        get().fetchTasks(newSelectedId);
      }
    }
  },

  addTask: async (listId: string, title: string, dueDate?: string | null) => {
    const tempId = `temp-${Date.now()}`;
    syncQueueUtils.addAction({
      type: 'create',
      entity: 'task',
      entityId: tempId,
      data: { list_id: listId, title, due_date: dueDate },
    });

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ list_id: listId, title, due_date: dueDate }])
      .select()
      .single();

    if (!error && data) {
      set({ tasks: [...get().tasks, data] });
    }
  },

  updateTask: async (id: string, updates: Partial<Omit<Task, 'id' | 'list_id' | 'created_at'>>) => {
    syncQueueUtils.addAction({
      type: 'update',
      entity: 'task',
      entityId: id,
      data: updates,
    });

    await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    set({
      tasks: get().tasks.map(task =>
        task.id === id ? { ...task, ...updates } : task
      ),
    });
  },

  toggleTask: async (id: string, completed: boolean) => {
    syncQueueUtils.addAction({
      type: 'update',
      entity: 'task',
      entityId: id,
      data: { completed },
    });

    await supabase
      .from('tasks')
      .update({ completed, updated_at: new Date().toISOString() })
      .eq('id', id);

    set({
      tasks: get().tasks.map(task =>
        task.id === id ? { ...task, completed } : task
      ),
    });
  },

  deleteTask: async (id: string) => {
    syncQueueUtils.addAction({
      type: 'delete',
      entity: 'task',
      entityId: id,
      data: {},
    });

    await supabase.from('tasks').delete().eq('id', id);
    set({ tasks: get().tasks.filter(task => task.id !== id) });
  },

  reorderTasks: async (orderedTaskIds: string[]) => {
    syncQueueUtils.addAction({
      type: 'update',
      entity: 'task',
      entityId: 'batch',
      data: { orderedTaskIds },
    });

    const updates = orderedTaskIds.map((id, index) => ({
      id,
      order: index,
    }));

    for (const update of updates) {
      await supabase
        .from('tasks')
        .update({ order: update.order, updated_at: new Date().toISOString() })
        .eq('id', update.id);
    }

    const reorderedTasks = orderedTaskIds
      .map(id => get().tasks.find(task => task.id === id))
      .filter((task): task is Task => task !== undefined)
      .map((task, index) => ({ ...task, order: index }));

    set({ tasks: reorderedTasks });
  },

  setSelectedListId: (id: string | null) => {
    set({ selectedListId: id });
    if (id) {
      get().fetchTasks(id);
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setShowCompleted: (show: boolean) => {
    set({ showCompleted: show });
  },
}));
