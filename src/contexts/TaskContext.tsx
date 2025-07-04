import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLevel } from './LevelContext';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'general' | 'workout' | 'personal';
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
  userId: string;
}

export interface WorkoutSession {
  id: string;
  name: string;
  exercises: Exercise[];
  duration: number;
  date: string;
  notes?: string;
  userId: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  restTime?: number;
}

interface TaskContextType {
  tasks: Task[];
  workouts: WorkoutSession[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addWorkout: (workout: Omit<WorkoutSession, 'id'>) => void;
  getUserTasks: (userId: string) => Task[];
  getUserWorkouts: (userId: string) => WorkoutSession[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Morning Cardio',
    description: 'Run for 30 minutes',
    completed: true,
    priority: 'high',
    category: 'workout',
    dueDate: '2025-01-08',
    createdAt: '2025-01-08T06:00:00Z',
    completedAt: '2025-01-08T06:30:00Z',
    userId: '1'
  },
  {
    id: '2',
    title: 'Review Project Proposal',
    description: 'Go through the quarterly review documents',
    completed: false,
    priority: 'medium',
    category: 'general',
    dueDate: '2025-01-09',
    createdAt: '2025-01-08T08:00:00Z',
    userId: '1'
  },
  {
    id: '3',
    title: 'Strength Training',
    description: 'Upper body workout',
    completed: false,
    priority: 'high',
    category: 'workout',
    dueDate: '2025-01-08',
    createdAt: '2025-01-08T10:00:00Z',
    userId: '2'
  }
];

const mockWorkouts: WorkoutSession[] = [
  {
    id: '1',
    name: 'Upper Body Strength',
    exercises: [
      { id: '1', name: 'Bench Press', sets: 3, reps: 12, weight: 80, restTime: 120 },
      { id: '2', name: 'Pull-ups', sets: 3, reps: 8, restTime: 90 },
      { id: '3', name: 'Shoulder Press', sets: 3, reps: 10, weight: 25, restTime: 90 }
    ],
    duration: 45,
    date: '2025-01-07',
    notes: 'Great session, felt strong today!',
    userId: '1'
  },
  {
    id: '2',
    name: 'Cardio & Core',
    exercises: [
      { id: '4', name: 'Treadmill Run', sets: 1, reps: 30, restTime: 0 },
      { id: '5', name: 'Plank', sets: 3, reps: 60, restTime: 60 },
      { id: '6', name: 'Russian Twists', sets: 3, reps: 20, restTime: 45 }
    ],
    duration: 35,
    date: '2025-01-06',
    userId: '2'
  }
];

// Helper functions for localStorage
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
  }
  return defaultValue;
};

const saveToStorage = <T,>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with data from localStorage or mock data
  const [tasks, setTasks] = useState<Task[]>(() => 
    loadFromStorage('dailyflow_tasks', mockTasks)
  );
  
  const [workouts, setWorkouts] = useState<WorkoutSession[]>(() => 
    loadFromStorage('dailyflow_workouts', mockWorkouts)
  );

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    saveToStorage('dailyflow_tasks', tasks);
  }, [tasks]);

  // Save workouts to localStorage whenever workouts change
  useEffect(() => {
    saveToStorage('dailyflow_workouts', workouts);
  }, [workouts]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
    
    // Award XP for creating a task
    try {
      const { addXP } = require('./LevelContext').useLevel();
      addXP(5, 'Task Created');
    } catch (error) {
      // Level context might not be available yet
    }

    // Record streak activity
    try {
      const { recordActivity } = require('./StreakContext').useStreak();
      recordActivity('task', `Created: ${newTask.title}`);
    } catch (error) {
      // Streak context might not be available yet
    }
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const updatedTask = { ...task, ...updates };
        
        // Award XP for completing a task
        if (!task.completed && updates.completed) {
          updatedTask.completedAt = new Date().toISOString();
          
          try {
            const { addXP } = require('./LevelContext').useLevel();
            addXP(10, 'Task Completed');
          } catch (error) {
            // Level context might not be available yet
          }

          // Record streak activity for task completion
          try {
            const { recordActivity } = require('./StreakContext').useStreak();
            recordActivity('task', `Completed: ${updatedTask.title}`);
          } catch (error) {
            // Streak context might not be available yet
          }
        }
        
        return updatedTask;
      }
      return task;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const addWorkout = (workoutData: Omit<WorkoutSession, 'id'>) => {
    const newWorkout: WorkoutSession = {
      ...workoutData,
      id: Date.now().toString()
    };
    setWorkouts(prev => [...prev, newWorkout]);
    
    // Award XP for logging a workout
    try {
      const { addXP } = require('./LevelContext').useLevel();
      addXP(25, 'Workout Logged');
    } catch (error) {
      // Level context might not be available yet
    }

    // Record streak activity for workout
    try {
      const { recordActivity } = require('./StreakContext').useStreak();
      recordActivity('workout', `Logged: ${newWorkout.name}`);
    } catch (error) {
      // Streak context might not be available yet
    }
  };

  const getUserTasks = (userId: string) => {
    return tasks.filter(task => task.userId === userId);
  };

  const getUserWorkouts = (userId: string) => {
    return workouts.filter(workout => workout.userId === userId);
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      workouts,
      addTask,
      updateTask,
      deleteTask,
      addWorkout,
      getUserTasks,
      getUserWorkouts
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};