import { useEffect, useState } from 'react';
import uuid from 'react-native-uuid';

import { STORAGE_KEYS, getItem, setItem } from '@/lib/storage';
import type { Task } from '@/lib/types';

type CreateTaskInput = {
  title: string;
  category: string;
  dueDate?: string;
};

// Store compartido a nivel de módulo: misma fuente de verdad para la pantalla y los modales.
let tasksState: Task[] = [];
let tasksInitialized = false;
const tasksListeners = new Set<() => void>();

function notifyTasks() {
  for (const l of tasksListeners) l();
}

async function initTasksIfNeeded() {
  if (tasksInitialized) return;
  tasksState = await getItem<Task[]>(STORAGE_KEYS.tasks, []);
  tasksInitialized = true;
  notifyTasks();
}

function persistTasks() {
  setItem(STORAGE_KEYS.tasks, tasksState);
}

export function addTask({ title, category, dueDate }: CreateTaskInput): Task | null {
  const trimmed = title.trim();
  if (!trimmed) return null;
  const task: Task = {
    id: uuid.v4() as string,
    title: trimmed,
    category,
    completed: false,
    createdAt: new Date().toISOString(),
    dueDate,
  };
  tasksState = [task, ...tasksState];
  persistTasks();
  notifyTasks();
  return task;
}

export function toggleTask(id: string) {
  tasksState = tasksState.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
  persistTasks();
  notifyTasks();
}

export function editTask(id: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>) {
  tasksState = tasksState.map((t) => (t.id === id ? { ...t, ...patch } : t));
  persistTasks();
  notifyTasks();
}

export function removeTask(id: string) {
  tasksState = tasksState.filter((t) => t.id !== id);
  persistTasks();
  notifyTasks();
}

export function getTaskById(id: string): Task | undefined {
  return tasksState.find((t) => t.id === id);
}

/**
 * Hook CRUD de tareas con persistencia en AsyncStorage. Comparte un único store entre
 * todos los consumidores para que un cambio hecho en el modal se refleje al volver a Tasks.
 */
export function useTasks() {
  const [, setVersion] = useState(0);
  const [loading, setLoading] = useState(!tasksInitialized);

  useEffect(() => {
    const listener = () => {
      setVersion((v) => v + 1);
      if (tasksInitialized) setLoading(false);
    };
    tasksListeners.add(listener);
    if (!tasksInitialized) {
      initTasksIfNeeded();
    } else {
      setLoading(false);
    }
    return () => {
      tasksListeners.delete(listener);
    };
  }, []);

  return { tasks: tasksState, loading, addTask, toggleTask, editTask, removeTask, getTaskById };
}
