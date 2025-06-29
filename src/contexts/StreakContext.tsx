import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakHistory: { date: string; activities: string[] }[];
  totalActiveDays: number;
}

interface StreakContextType {
  streakData: StreakData;
  recordActivity: (activityType: 'task' | 'workout' | 'journal', description?: string) => void;
  getStreakForDate: (date: string) => { date: string; activities: string[] } | null;
  getActivityCalendar: () => { [date: string]: string[] };
  resetStreak: () => void;
}

const StreakContext = createContext<StreakContextType | undefined>(undefined);

const DEFAULT_STREAK_DATA: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: null,
  streakHistory: [],
  totalActiveDays: 0
};

export const StreakProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData>(DEFAULT_STREAK_DATA);

  // Load streak data on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      loadStreakData();
    } else {
      setStreakData(DEFAULT_STREAK_DATA);
    }
  }, [user?.id]);

  // Save streak data whenever it changes
  useEffect(() => {
    if (user?.id && streakData !== DEFAULT_STREAK_DATA) {
      saveStreakData();
    }
  }, [streakData, user?.id]);

  const loadStreakData = () => {
    try {
      const saved = localStorage.getItem(`streakData_${user?.id}`);
      if (saved) {
        const data = JSON.parse(saved);
        // Recalculate streak in case days have passed
        const recalculatedData = recalculateStreak(data);
        setStreakData(recalculatedData);
      } else {
        // Initialize with existing activity data if available
        initializeFromExistingData();
      }
    } catch (error) {
      console.error('Error loading streak data:', error);
      setStreakData(DEFAULT_STREAK_DATA);
    }
  };

  const saveStreakData = () => {
    try {
      localStorage.setItem(`streakData_${user?.id}`, JSON.stringify(streakData));
    } catch (error) {
      console.error('Error saving streak data:', error);
    }
  };

  const initializeFromExistingData = () => {
    try {
      // Check existing tasks, workouts, and journal entries to build initial streak
      const tasks = JSON.parse(localStorage.getItem('dailyflow_tasks') || '[]');
      const workouts = JSON.parse(localStorage.getItem('dailyflow_workouts') || '[]');
      const journalEntries = JSON.parse(localStorage.getItem(`journalEntries_${user?.id}`) || '[]');

      const activityMap: { [date: string]: string[] } = {};

      // Process completed tasks
      tasks
        .filter((task: any) => task.userId === user?.id && task.completed)
        .forEach((task: any) => {
          const date = task.createdAt ? task.createdAt.split('T')[0] : new Date().toISOString().split('T')[0];
          if (!activityMap[date]) activityMap[date] = [];
          if (!activityMap[date].includes('task')) {
            activityMap[date].push('task');
          }
        });

      // Process workouts
      workouts
        .filter((workout: any) => workout.userId === user?.id)
        .forEach((workout: any) => {
          const date = workout.date;
          if (!activityMap[date]) activityMap[date] = [];
          if (!activityMap[date].includes('workout')) {
            activityMap[date].push('workout');
          }
        });

      // Process journal entries
      journalEntries.forEach((entry: any) => {
        const date = entry.date;
        if (!activityMap[date]) activityMap[date] = [];
        if (!activityMap[date].includes('journal')) {
          activityMap[date].push('journal');
        }
      });

      // Convert to streak history
      const streakHistory = Object.entries(activityMap)
        .map(([date, activities]) => ({ date, activities }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Calculate streak from history
      const calculatedData = calculateStreakFromHistory(streakHistory);
      setStreakData(calculatedData);
    } catch (error) {
      console.error('Error initializing from existing data:', error);
      setStreakData(DEFAULT_STREAK_DATA);
    }
  };

  const calculateStreakFromHistory = (history: { date: string; activities: string[] }[]): StreakData => {
    if (history.length === 0) {
      return DEFAULT_STREAK_DATA;
    }

    const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastActivityDate = sortedHistory[0]?.date || null;

    // Calculate current streak (from today backwards)
    const mostRecentActivity = sortedHistory[0]?.date;
    if (mostRecentActivity === today || mostRecentActivity === yesterday) {
      let checkDate = mostRecentActivity === today ? today : yesterday;
      let streakIndex = mostRecentActivity === today ? 0 : (sortedHistory[0]?.date === yesterday ? 0 : -1);

      if (streakIndex >= 0) {
        while (streakIndex < sortedHistory.length) {
          const activityDate = sortedHistory[streakIndex].date;
          if (activityDate === checkDate) {
            currentStreak++;
            streakIndex++;
            // Move to previous day
            const prevDate = new Date(new Date(checkDate).getTime() - 24 * 60 * 60 * 1000);
            checkDate = prevDate.toISOString().split('T')[0];
          } else {
            // Check if there's a gap
            const expectedDate = new Date(new Date(checkDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            if (activityDate < expectedDate) {
              break; // Gap found, streak ends
            }
            // Move to next activity
            streakIndex++;
          }
        }
      }
    }

    // Calculate longest streak
    const allDates = sortedHistory.map(h => h.date).sort();
    tempStreak = 1;
    longestStreak = 1;

    for (let i = 1; i < allDates.length; i++) {
      const currentDate = new Date(allDates[i]);
      const prevDate = new Date(allDates[i - 1]);
      const dayDiff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      if (dayDiff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    return {
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      lastActivityDate,
      streakHistory: history,
      totalActiveDays: history.length
    };
  };

  const recalculateStreak = (data: StreakData): StreakData => {
    // Recalculate streak based on current date
    return calculateStreakFromHistory(data.streakHistory);
  };

  const recordActivity = (activityType: 'task' | 'workout' | 'journal', description?: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    setStreakData(prevData => {
      const newHistory = [...prevData.streakHistory];
      
      // Find or create today's entry
      let todayEntry = newHistory.find(entry => entry.date === today);
      
      if (todayEntry) {
        // Add activity if not already recorded today
        if (!todayEntry.activities.includes(activityType)) {
          todayEntry.activities.push(activityType);
        }
      } else {
        // Create new entry for today
        todayEntry = { date: today, activities: [activityType] };
        newHistory.push(todayEntry);
      }

      // Sort history by date
      newHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Recalculate streak
      return calculateStreakFromHistory(newHistory);
    });
  };

  const getStreakForDate = (date: string) => {
    return streakData.streakHistory.find(entry => entry.date === date) || null;
  };

  const getActivityCalendar = () => {
    const calendar: { [date: string]: string[] } = {};
    streakData.streakHistory.forEach(entry => {
      calendar[entry.date] = entry.activities;
    });
    return calendar;
  };

  const resetStreak = () => {
    setStreakData(DEFAULT_STREAK_DATA);
  };

  return (
    <StreakContext.Provider value={{
      streakData,
      recordActivity,
      getStreakForDate,
      getActivityCalendar,
      resetStreak
    }}>
      {children}
    </StreakContext.Provider>
  );
};

export const useStreak = () => {
  const context = useContext(StreakContext);
  if (context === undefined) {
    throw new Error('useStreak must be used within a StreakProvider');
  }
  return context;
};