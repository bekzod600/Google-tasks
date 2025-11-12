import { create } from 'zustand';
import { supabase, TaskList, Task } from '../lib/supabase';

type Store = {
  taskLists: TaskList[];
  tasks: Task[];
  selectedListId: string | null;
  isLoading: boolean;

  fetchTaskLists: () => Promise<void>;
  fetchTasks: (listId: string) => Promise<void>;
  addTaskList: (name: string) => Promise<void>;
  deleteTaskList: (id: string) => Promise<void>;
  addTask: (listId: string, title: string) => Promise<void>;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'list_id' | 'created_at'>>) => Promise<void>;
  toggleTask: (id: string, completed: boolean) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setSelectedListId: (id: string | null) => void;
};

export const useStore = create<Store>((set, get) => ({
  taskLists: [],
  tasks: [],
  selectedListId: null,
  isLoading: false,

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
    const { data, error } = await supabase
      .from('task_lists')
      .insert([{ name }])
      .select()
      .single();

    if (!error && data) {
      set({ taskLists: [...get().taskLists, data] });
    }
  },

  deleteTaskList: async (id: string) => {
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

  addTask: async (listId: string, title: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ list_id: listId, title }])
      .select()
      .single();

    if (!error && data) {
      set({ tasks: [...get().tasks, data] });
    }
  },

  updateTask: async (id: string, updates: Partial<Omit<Task, 'id' | 'list_id' | 'created_at'>>) => {
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
    await supabase.from('tasks').delete().eq('id', id);
    set({ tasks: get().tasks.filter(task => task.id !== id) });
  },

  setSelectedListId: (id: string | null) => {
    set({ selectedListId: id });
    if (id) {
      get().fetchTasks(id);
    }
  },
}));
