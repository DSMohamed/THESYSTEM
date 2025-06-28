import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useTask } from './TaskContext';

export interface Achievement {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: Date;
  category: 'tasks' | 'workouts' | 'journal' | 'streak' | 'special';
}

export interface UserLevel {
  level: number;
  currentXP: number;
  totalXP: number;
  xpToNextLevel: number;
  title: string;
  titleAr: string;
}

interface LevelContextType {
  userLevel: UserLevel;
  achievements: Achievement[];
  addXP: (amount: number, reason: string) => void;
  checkAchievements: () => void;
  getRecentActivity: () => string[];
  getLevelProgress: () => number;
}

const LevelContext = createContext<LevelContextType | undefined>(undefined);

// XP rewards for different actions
const XP_REWARDS = {
  TASK_COMPLETE: 10,
  TASK_CREATE: 5,
  WORKOUT_COMPLETE: 25,
  WORKOUT_CREATE: 15,
  JOURNAL_ENTRY: 20,
  DAILY_STREAK: 50,
  WEEKLY_STREAK: 100,
  CHAT_INTERACTION: 2,
  GOAL_ACHIEVEMENT: 100
};

// Level titles
const LEVEL_TITLES = [
  { en: 'Novice', ar: 'مبتدئ' },
  { en: 'Apprentice', ar: 'متدرب' },
  { en: 'Adept', ar: 'ماهر' },
  { en: 'Expert', ar: 'خبير' },
  { en: 'Master', ar: 'أستاذ' },
  { en: 'Grandmaster', ar: 'أستاذ كبير' },
  { en: 'Legend', ar: 'أسطورة' },
  { en: 'Mythic', ar: 'أسطوري' },
  { en: 'Transcendent', ar: 'متسامي' },
  { en: 'Nexus Guardian', ar: 'حارس النكسوس' }
];

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'first_task',
    name: 'First Steps',
    nameAr: 'الخطوات الأولى',
    description: 'Complete your first task',
    descriptionAr: 'أكمل مهمتك الأولى',
    icon: '🎯',
    xpReward: 50,
    category: 'tasks'
  },
  {
    id: 'task_master',
    name: 'Task Master',
    nameAr: 'سيد المهام',
    description: 'Complete 50 tasks',
    descriptionAr: 'أكمل 50 مهمة',
    icon: '👑',
    xpReward: 200,
    category: 'tasks'
  },
  {
    id: 'fitness_warrior',
    name: 'Fitness Warrior',
    nameAr: 'محارب اللياقة',
    description: 'Complete 10 workouts',
    descriptionAr: 'أكمل 10 تمارين',
    icon: '💪',
    xpReward: 150,
    category: 'workouts'
  },
  {
    id: 'journal_keeper',
    name: 'Journal Keeper',
    nameAr: 'حافظ المذكرات',
    description: 'Write 20 journal entries',
    descriptionAr: 'اكتب 20 مذكرة',
    icon: '📖',
    xpReward: 100,
    category: 'journal'
  },
  {
    id: 'streak_champion',
    name: 'Streak Champion',
    nameAr: 'بطل الإنجاز المتتالي',
    description: 'Maintain a 7-day activity streak',
    descriptionAr: 'حافظ على إنجاز متتالي لـ 7 أيام',
    icon: '🔥',
    xpReward: 300,
    category: 'streak'
  },
  {
    id: 'ai_companion',
    name: 'AI Companion',
    nameAr: 'رفيق الذكي الاصطناعي',
    description: 'Have 100 conversations with AI',
    descriptionAr: 'أجر 100 محادثة مع الذكي الاصطناعي',
    icon: '🤖',
    xpReward: 75,
    category: 'special'
  },
  {
    id: 'level_10',
    name: 'Rising Star',
    nameAr: 'نجم صاعد',
    description: 'Reach level 10',
    descriptionAr: 'اوصل للمستوى 10',
    icon: '⭐',
    xpReward: 500,
    category: 'special'
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    nameAr: 'الكمالي',
    description: 'Complete all daily tasks for 5 days',
    descriptionAr: 'أكمل جميع المهام اليومية لـ 5 أيام',
    icon: '✨',
    xpReward: 250,
    category: 'tasks'
  }
];

// Calculate XP needed for next level (exponential growth)
const calculateXPForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Calculate level from total XP
const calculateLevelFromXP = (totalXP: number): { level: number; currentXP: number; xpToNextLevel: number } => {
  let level = 1;
  let xpUsed = 0;
  
  while (true) {
    const xpNeeded = calculateXPForLevel(level);
    if (xpUsed + xpNeeded > totalXP) {
      break;
    }
    xpUsed += xpNeeded;
    level++;
  }
  
  const currentXP = totalXP - xpUsed;
  const xpToNextLevel = calculateXPForLevel(level) - currentXP;
  
  return { level, currentXP, xpToNextLevel };
};

export const LevelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { getUserTasks, getUserWorkouts } = useTask();
  
  const [userLevel, setUserLevel] = useState<UserLevel>({
    level: 1,
    currentXP: 0,
    totalXP: 0,
    xpToNextLevel: 100,
    title: 'Novice',
    titleAr: 'مبتدئ'
  });
  
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);

  // Load user data on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      loadUserLevelData();
      loadAchievements();
    }
  }, [user?.id]);

  // Save data whenever it changes
  useEffect(() => {
    if (user?.id) {
      saveUserLevelData();
    }
  }, [userLevel, user?.id]);

  useEffect(() => {
    if (user?.id) {
      saveAchievements();
    }
  }, [achievements, user?.id]);

  const loadUserLevelData = () => {
    try {
      const saved = localStorage.getItem(`userLevel_${user?.id}`);
      if (saved) {
        const data = JSON.parse(saved);
        setUserLevel(data);
      } else {
        // Initialize new user
        const initialLevel = {
          level: 1,
          currentXP: 0,
          totalXP: 0,
          xpToNextLevel: 100,
          title: LEVEL_TITLES[0].en,
          titleAr: LEVEL_TITLES[0].ar
        };
        setUserLevel(initialLevel);
      }
    } catch (error) {
      console.error('Error loading user level data:', error);
    }
  };

  const saveUserLevelData = () => {
    try {
      localStorage.setItem(`userLevel_${user?.id}`, JSON.stringify(userLevel));
    } catch (error) {
      console.error('Error saving user level data:', error);
    }
  };

  const loadAchievements = () => {
    try {
      const saved = localStorage.getItem(`achievements_${user?.id}`);
      if (saved) {
        setAchievements(JSON.parse(saved));
      } else {
        // Initialize achievements
        const initialAchievements = ACHIEVEMENT_DEFINITIONS.map(def => ({
          ...def,
          unlocked: false
        }));
        setAchievements(initialAchievements);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const saveAchievements = () => {
    try {
      localStorage.setItem(`achievements_${user?.id}`, JSON.stringify(achievements));
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  };

  const addXP = (amount: number, reason: string) => {
    const newTotalXP = userLevel.totalXP + amount;
    const levelData = calculateLevelFromXP(newTotalXP);
    
    const titleIndex = Math.min(levelData.level - 1, LEVEL_TITLES.length - 1);
    const newTitle = LEVEL_TITLES[titleIndex];
    
    setUserLevel({
      level: levelData.level,
      currentXP: levelData.currentXP,
      totalXP: newTotalXP,
      xpToNextLevel: levelData.xpToNextLevel,
      title: newTitle.en,
      titleAr: newTitle.ar
    });

    // Add to recent activity
    setRecentActivity(prev => [
      `+${amount} XP: ${reason}`,
      ...prev.slice(0, 9) // Keep last 10 activities
    ]);

    // Check for level-based achievements
    checkAchievements();
  };

  const checkAchievements = () => {
    if (!user?.id) return;

    const userTasks = getUserTasks(user.id);
    const userWorkouts = getUserWorkouts(user.id);
    const completedTasks = userTasks.filter(t => t.completed);

    const updatedAchievements = achievements.map(achievement => {
      if (achievement.unlocked) return achievement;

      let shouldUnlock = false;

      switch (achievement.id) {
        case 'first_task':
          shouldUnlock = completedTasks.length >= 1;
          break;
        case 'task_master':
          shouldUnlock = completedTasks.length >= 50;
          break;
        case 'fitness_warrior':
          shouldUnlock = userWorkouts.length >= 10;
          break;
        case 'journal_keeper':
          // This would need journal entries count
          shouldUnlock = false; // Placeholder
          break;
        case 'streak_champion':
          // This would need streak calculation
          shouldUnlock = false; // Placeholder
          break;
        case 'level_10':
          shouldUnlock = userLevel.level >= 10;
          break;
        case 'perfectionist':
          // This would need daily completion tracking
          shouldUnlock = false; // Placeholder
          break;
        default:
          break;
      }

      if (shouldUnlock) {
        // Award XP for achievement
        setTimeout(() => {
          addXP(achievement.xpReward, `Achievement: ${achievement.name}`);
        }, 100);

        return {
          ...achievement,
          unlocked: true,
          unlockedAt: new Date()
        };
      }

      return achievement;
    });

    setAchievements(updatedAchievements);
  };

  const getRecentActivity = () => {
    return recentActivity;
  };

  const getLevelProgress = () => {
    const totalXPForCurrentLevel = calculateXPForLevel(userLevel.level);
    return (userLevel.currentXP / totalXPForCurrentLevel) * 100;
  };

  return (
    <LevelContext.Provider value={{
      userLevel,
      achievements,
      addXP,
      checkAchievements,
      getRecentActivity,
      getLevelProgress
    }}>
      {children}
    </LevelContext.Provider>
  );
};

export const useLevel = () => {
  const context = useContext(LevelContext);
  if (context === undefined) {
    throw new Error('useLevel must be used within a LevelProvider');
  }
  return context;
};