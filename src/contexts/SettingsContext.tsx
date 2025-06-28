import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface NotificationSettings {
  taskReminders: boolean;
  workoutReminders: boolean;
  achievements: boolean;
  dailyStreak: boolean;
  weeklyReport: boolean;
  sound: boolean;
}

export interface PrivacySettings {
  shareProgress: boolean;
  publicProfile: boolean;
  dataCollection: boolean;
  analytics: boolean;
}

export interface PerformanceSettings {
  animations: boolean;
  particles: boolean;
  autoSave: boolean;
  syncFrequency: 'realtime' | '5min' | '15min' | 'manual';
}

export interface AppSettings {
  theme: 'dark' | 'light';
  language: 'en' | 'ar';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  performance: PerformanceSettings;
}

interface SettingsContextType {
  settings: AppSettings;
  updateSetting: (category: keyof AppSettings, key: string, value: any) => void;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  language: 'en',
  notifications: {
    taskReminders: true,
    workoutReminders: true,
    achievements: true,
    dailyStreak: true,
    weeklyReport: true,
    sound: true
  },
  privacy: {
    shareProgress: true,
    publicProfile: false,
    dataCollection: true,
    analytics: true
  },
  performance: {
    animations: true,
    particles: true,
    autoSave: true,
    syncFrequency: 'realtime'
  }
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Load settings on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      loadSettings();
    }
  }, [user?.id]);

  // Apply theme changes immediately
  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  // Apply performance settings
  useEffect(() => {
    applyPerformanceSettings();
  }, [settings.performance]);

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem(`settings_${user?.id}`);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } else {
        // Load legacy settings if they exist
        const legacySettings = loadLegacySettings();
        if (legacySettings) {
          setSettings(legacySettings);
          saveSettings(legacySettings);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettings(DEFAULT_SETTINGS);
    }
  };

  const loadLegacySettings = (): AppSettings | null => {
    try {
      const theme = localStorage.getItem('theme') || 'dark';
      const language = localStorage.getItem('language') || 'en';
      
      const notifications = {
        taskReminders: JSON.parse(localStorage.getItem('notifications_taskReminders') || 'true'),
        workoutReminders: JSON.parse(localStorage.getItem('notifications_workoutReminders') || 'true'),
        achievements: JSON.parse(localStorage.getItem('notifications_achievements') || 'true'),
        dailyStreak: JSON.parse(localStorage.getItem('notifications_dailyStreak') || 'true'),
        weeklyReport: JSON.parse(localStorage.getItem('notifications_weeklyReport') || 'true'),
        sound: JSON.parse(localStorage.getItem('notifications_sound') || 'true')
      };

      const privacy = {
        shareProgress: JSON.parse(localStorage.getItem('privacy_shareProgress') || 'true'),
        publicProfile: JSON.parse(localStorage.getItem('privacy_publicProfile') || 'false'),
        dataCollection: JSON.parse(localStorage.getItem('privacy_dataCollection') || 'true'),
        analytics: JSON.parse(localStorage.getItem('privacy_analytics') || 'true')
      };

      const performance = {
        animations: JSON.parse(localStorage.getItem('performance_animations') || 'true'),
        particles: JSON.parse(localStorage.getItem('performance_particles') || 'true'),
        autoSave: JSON.parse(localStorage.getItem('performance_autoSave') || 'true'),
        syncFrequency: localStorage.getItem('performance_syncFrequency') as any || 'realtime'
      };

      return {
        theme: theme as 'dark' | 'light',
        language: language as 'en' | 'ar',
        notifications,
        privacy,
        performance
      };
    } catch (error) {
      return null;
    }
  };

  const saveSettings = (newSettings: AppSettings) => {
    try {
      localStorage.setItem(`settings_${user?.id}`, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const applyTheme = (theme: 'dark' | 'light') => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  };

  const applyPerformanceSettings = () => {
    const root = document.documentElement;
    
    // Apply animation settings
    if (!settings.performance.animations) {
      root.style.setProperty('--animation-duration', '0s');
      root.style.setProperty('--transition-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }

    // Apply particle settings
    const particles = document.querySelectorAll('.particles');
    particles.forEach(particle => {
      if (settings.performance.particles) {
        (particle as HTMLElement).style.display = 'block';
      } else {
        (particle as HTMLElement).style.display = 'none';
      }
    });
  };

  const updateSetting = (category: keyof AppSettings, key: string, value: any) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value
      }
    };

    setSettings(newSettings);
    saveSettings(newSettings);

    // Show notification for certain settings
    if (category === 'notifications' && key === 'sound' && value) {
      playNotificationSound();
    }

    // Trigger auto-save if enabled
    if (settings.performance.autoSave && category !== 'performance') {
      triggerAutoSave();
    }
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
    
    // Clear legacy settings
    const legacyKeys = [
      'theme', 'language',
      'notifications_taskReminders', 'notifications_workoutReminders', 'notifications_achievements',
      'notifications_dailyStreak', 'notifications_weeklyReport', 'notifications_sound',
      'privacy_shareProgress', 'privacy_publicProfile', 'privacy_dataCollection', 'privacy_analytics',
      'performance_animations', 'performance_particles', 'performance_autoSave', 'performance_syncFrequency'
    ];
    
    legacyKeys.forEach(key => localStorage.removeItem(key));
  };

  const exportSettings = (): string => {
    return JSON.stringify({
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  };

  const importSettings = (settingsJson: string): boolean => {
    try {
      const imported = JSON.parse(settingsJson);
      if (imported.settings && imported.version) {
        const newSettings = { ...DEFAULT_SETTINGS, ...imported.settings };
        setSettings(newSettings);
        saveSettings(newSettings);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing settings:', error);
      return false;
    }
  };

  const playNotificationSound = () => {
    if (settings.notifications.sound) {
      // Create a simple beep sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  };

  const triggerAutoSave = () => {
    // Trigger auto-save for app data
    const event = new CustomEvent('autoSave');
    window.dispatchEvent(event);
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSetting,
      resetSettings,
      exportSettings,
      importSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};