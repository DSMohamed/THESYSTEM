import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Bell, 
  Globe, 
  Palette, 
  Shield, 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  Save, 
  Eye, 
  EyeOff,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Zap,
  Settings as SettingsIcon,
  Key,
  Mail,
  Camera,
  Edit3
} from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  
  // Profile settings
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // App settings
  const [settings, setSettings] = useState({
    theme: localStorage.getItem('theme') || 'dark',
    language: localStorage.getItem('language') || 'en',
    notifications: {
      taskReminders: JSON.parse(localStorage.getItem('notifications_taskReminders') || 'true'),
      workoutReminders: JSON.parse(localStorage.getItem('notifications_workoutReminders') || 'true'),
      achievements: JSON.parse(localStorage.getItem('notifications_achievements') || 'true'),
      dailyStreak: JSON.parse(localStorage.getItem('notifications_dailyStreak') || 'true'),
      weeklyReport: JSON.parse(localStorage.getItem('notifications_weeklyReport') || 'true'),
      sound: JSON.parse(localStorage.getItem('notifications_sound') || 'true')
    },
    privacy: {
      shareProgress: JSON.parse(localStorage.getItem('privacy_shareProgress') || 'true'),
      publicProfile: JSON.parse(localStorage.getItem('privacy_publicProfile') || 'false'),
      dataCollection: JSON.parse(localStorage.getItem('privacy_dataCollection') || 'true'),
      analytics: JSON.parse(localStorage.getItem('privacy_analytics') || 'true')
    },
    performance: {
      animations: JSON.parse(localStorage.getItem('performance_animations') || 'true'),
      particles: JSON.parse(localStorage.getItem('performance_particles') || 'true'),
      autoSave: JSON.parse(localStorage.getItem('performance_autoSave') || 'true'),
      syncFrequency: localStorage.getItem('performance_syncFrequency') || 'realtime'
    }
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileLoading(true);
    try {
      await authService.updateProfile(name, avatar);
      setProfileMsg('Profile updated successfully!');
    } catch (err: any) {
      setProfileMsg(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    
    if (newPassword !== confirmPassword) {
      setPasswordMsg('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordMsg('Password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setPasswordMsg('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const updateSetting = (category: string, key: string, value: any) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category as keyof typeof settings],
        [key]: value
      }
    };
    setSettings(newSettings);
    
    // Save to localStorage
    if (category === 'notifications' || category === 'privacy' || category === 'performance') {
      localStorage.setItem(`${category}_${key}`, JSON.stringify(value));
    } else {
      localStorage.setItem(key, value);
    }

    // Apply theme changes immediately
    if (key === 'theme') {
      if (value === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const exportData = () => {
    const data = {
      profile: { name: user?.name, email: user?.email },
      tasks: localStorage.getItem('dailyflow_tasks'),
      workouts: localStorage.getItem('dailyflow_workouts'),
      level: localStorage.getItem(`userLevel_${user?.id}`),
      achievements: localStorage.getItem(`achievements_${user?.id}`),
      settings: settings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      // Clear all app data
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.startsWith('dailyflow_') || 
        key.startsWith('userLevel_') || 
        key.startsWith('achievements_') ||
        key.startsWith('notifications_') ||
        key.startsWith('privacy_') ||
        key.startsWith('performance_')
      );
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Reset settings to defaults
      setSettings({
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
      });
      
      alert('All data has been cleared. Please refresh the page.');
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="cyber-card rounded-xl lg:rounded-2xl p-4 lg:p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/50 to-purple-900/50"></div>
        <div className="absolute inset-0 holographic opacity-20"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between relative z-10">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl lg:text-4xl font-orbitron font-bold mb-2 lg:mb-4 glitch cyber-text-glow" data-text="SYSTEM CONFIGURATION">
              SYSTEM CONFIGURATION
            </h1>
            <p className="text-cyan-400 text-base lg:text-lg font-rajdhani mb-1 lg:mb-2">
              CONTROL PANEL • STATUS: ACCESSIBLE
            </p>
            <p className="text-purple-400 font-rajdhani text-sm lg:text-base">
              USER: {user?.name?.toUpperCase()} • ROLE: {user?.role?.toUpperCase()}
            </p>
            <div className="mt-3 lg:mt-6" dir="rtl">
              <h2 className="text-lg lg:text-xl font-rajdhani font-semibold text-cyan-400">إعدادات النظام</h2>
              <p className="text-purple-400 font-rajdhani text-sm lg:text-base">لوحة التحكم الرئيسية</p>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-20 lg:w-24 h-20 lg:h-24 cyber-card rounded-full flex items-center justify-center neon-glow">
              <SettingsIcon className="w-10 lg:w-12 h-10 lg:h-12 text-cyan-400 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Profile Settings */}
        <div className="cyber-card rounded-xl p-4 lg:p-6 relative">
          <div className="absolute inset-0 animated-border rounded-xl"></div>
          
          <div className="flex items-center space-x-3 mb-4 lg:mb-6 relative z-10">
            <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center neon-glow">
              <User className="w-4 lg:w-5 h-4 lg:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-orbitron font-semibold text-cyan-400 neon-text">PROFILE MATRIX</h3>
              <p className="text-xs text-purple-400 font-rajdhani" dir="rtl">مصفوفة الملف الشخصي</p>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4 relative z-10">
            <div>
              <label className="block text-sm font-rajdhani font-medium text-purple-400 mb-2 uppercase tracking-wide">
                User Identifier
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="cyber-input w-full pl-10 pr-4 py-3 rounded-lg font-rajdhani"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-rajdhani font-medium text-purple-400 mb-2 uppercase tracking-wide">
                Avatar Protocol
              </label>
              <div className="relative">
                <Camera className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-400" />
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="cyber-input w-full pl-10 pr-4 py-3 rounded-lg font-rajdhani"
                  placeholder="Avatar URL"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-rajdhani font-medium text-purple-400 mb-2 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-400" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="cyber-input w-full pl-10 pr-4 py-3 rounded-lg font-rajdhani opacity-50 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-purple-400 mt-1 font-rajdhani">Email cannot be modified</p>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full cyber-btn bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 px-4 rounded-lg font-rajdhani font-medium hover:neon-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {profileLoading ? 'UPDATING...' : 'UPDATE PROFILE'}
            </button>

            {profileMsg && (
              <div className={`p-3 cyber-card border rounded-lg ${
                profileMsg.includes('success') ? 'border-green-500/50' : 'border-red-500/50'
              }`}>
                <p className={`text-sm font-rajdhani ${
                  profileMsg.includes('success') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {profileMsg}
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Security Settings */}
        <div className="cyber-card rounded-xl p-4 lg:p-6 relative">
          <div className="absolute inset-0 animated-border rounded-xl"></div>
          
          <div className="flex items-center space-x-3 mb-4 lg:mb-6 relative z-10">
            <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center neon-glow">
              <Lock className="w-4 lg:w-5 h-4 lg:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-orbitron font-semibold text-cyan-400 neon-text">SECURITY PROTOCOL</h3>
              <p className="text-xs text-purple-400 font-rajdhani" dir="rtl">بروتوكول الأمان</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 relative z-10">
            <div>
              <label className="block text-sm font-rajdhani font-medium text-purple-400 mb-2 uppercase tracking-wide">
                Current Access Code
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-400" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="cyber-input w-full pl-10 pr-12 py-3 rounded-lg font-rajdhani"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-cyan-400 transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-rajdhani font-medium text-purple-400 mb-2 uppercase tracking-wide">
                New Access Code
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="cyber-input w-full pl-10 pr-12 py-3 rounded-lg font-rajdhani"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-cyan-400 transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-rajdhani font-medium text-purple-400 mb-2 uppercase tracking-wide">
                Confirm Access Code
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="cyber-input w-full pl-10 pr-4 py-3 rounded-lg font-rajdhani"
                  minLength={6}
                  required
                />
              </div>
              <p className="text-xs text-purple-400 mt-1 font-rajdhani">
                Minimum 6 characters required
              </p>
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full cyber-btn bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 px-4 rounded-lg font-rajdhani font-medium hover:neon-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {passwordLoading ? 'UPDATING...' : 'UPDATE PASSWORD'}
            </button>

            {passwordMsg && (
              <div className={`p-3 cyber-card border rounded-lg ${
                passwordMsg.includes('success') ? 'border-green-500/50' : 'border-red-500/50'
              }`}>
                <p className={`text-sm font-rajdhani ${
                  passwordMsg.includes('success') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {passwordMsg}
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Notification Settings */}
        <div className="cyber-card rounded-xl p-4 lg:p-6 relative">
          <div className="absolute inset-0 animated-border rounded-xl"></div>
          
          <div className="flex items-center space-x-3 mb-4 lg:mb-6 relative z-10">
            <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center neon-glow">
              <Bell className="w-4 lg:w-5 h-4 lg:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-orbitron font-semibold text-cyan-400 neon-text">ALERT SYSTEM</h3>
              <p className="text-xs text-purple-400 font-rajdhani" dir="rtl">نظام التنبيهات</p>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            {[
              { key: 'taskReminders', label: 'Task Reminders', labelAr: 'تذكير المهام' },
              { key: 'workoutReminders', label: 'Workout Reminders', labelAr: 'تذكير التمارين' },
              { key: 'achievements', label: 'Achievement Alerts', labelAr: 'تنبيهات الإنجازات' },
              { key: 'dailyStreak', label: 'Daily Streak', labelAr: 'الإنجاز اليومي' },
              { key: 'weeklyReport', label: 'Weekly Reports', labelAr: 'التقارير الأسبوعية' },
              { key: 'sound', label: 'Sound Effects', labelAr: 'المؤثرات الصوتية' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 cyber-card rounded-lg border border-purple-500/30">
                <div>
                  <p className="text-sm font-rajdhani font-medium text-cyan-400">{item.label.toUpperCase()}</p>
                  <p className="text-xs text-purple-400 font-rajdhani" dir="rtl">{item.labelAr}</p>
                </div>
                <button
                  onClick={() => updateSetting('notifications', item.key, !settings.notifications[item.key as keyof typeof settings.notifications])}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                    settings.notifications[item.key as keyof typeof settings.notifications] 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 neon-glow' 
                      : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform duration-300 ${
                    settings.notifications[item.key as keyof typeof settings.notifications] 
                      ? 'transform translate-x-7' 
                      : 'transform translate-x-1'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="cyber-card rounded-xl p-4 lg:p-6 relative">
          <div className="absolute inset-0 animated-border rounded-xl"></div>
          
          <div className="flex items-center space-x-3 mb-4 lg:mb-6 relative z-10">
            <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center neon-glow">
              <Shield className="w-4 lg:w-5 h-4 lg:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-orbitron font-semibold text-cyan-400 neon-text">PRIVACY MATRIX</h3>
              <p className="text-xs text-purple-400 font-rajdhani" dir="rtl">مصفوفة الخصوصية</p>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            {[
              { key: 'shareProgress', label: 'Share Progress', labelAr: 'مشاركة التقدم' },
              { key: 'publicProfile', label: 'Public Profile', labelAr: 'الملف العام' },
              { key: 'dataCollection', label: 'Data Collection', labelAr: 'جمع البيانات' },
              { key: 'analytics', label: 'Usage Analytics', labelAr: 'تحليلات الاستخدام' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 cyber-card rounded-lg border border-purple-500/30">
                <div>
                  <p className="text-sm font-rajdhani font-medium text-cyan-400">{item.label.toUpperCase()}</p>
                  <p className="text-xs text-purple-400 font-rajdhani" dir="rtl">{item.labelAr}</p>
                </div>
                <button
                  onClick={() => updateSetting('privacy', item.key, !settings.privacy[item.key as keyof typeof settings.privacy])}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                    settings.privacy[item.key as keyof typeof settings.privacy] 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 neon-glow' 
                      : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform duration-300 ${
                    settings.privacy[item.key as keyof typeof settings.privacy] 
                      ? 'transform translate-x-7' 
                      : 'transform translate-x-1'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="cyber-card rounded-xl p-4 lg:p-6 relative">
          <div className="absolute inset-0 animated-border rounded-xl"></div>
          
          <div className="flex items-center space-x-3 mb-4 lg:mb-6 relative z-10">
            <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center neon-glow">
              <Palette className="w-4 lg:w-5 h-4 lg:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-orbitron font-semibold text-cyan-400 neon-text">VISUAL INTERFACE</h3>
              <p className="text-xs text-purple-400 font-rajdhani" dir="rtl">الواجهة المرئية</p>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <div>
              <label className="block text-sm font-rajdhani font-medium text-purple-400 mb-2 uppercase tracking-wide">
                Theme Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateSetting('', 'theme', 'dark')}
                  className={`cyber-btn flex items-center justify-center space-x-2 p-3 rounded-lg transition-all duration-300 ${
                    settings.theme === 'dark' ? 'bg-gradient-to-r from-purple-500 to-pink-600 neon-glow' : 'border border-purple-500/50'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span className="font-rajdhani font-medium">DARK</span>
                </button>
                <button
                  onClick={() => updateSetting('', 'theme', 'light')}
                  className={`cyber-btn flex items-center justify-center space-x-2 p-3 rounded-lg transition-all duration-300 ${
                    settings.theme === 'light' ? 'bg-gradient-to-r from-yellow-500 to-orange-600 neon-glow' : 'border border-purple-500/50'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span className="font-rajdhani font-medium">LIGHT</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-rajdhani font-medium text-purple-400 mb-2 uppercase tracking-wide">
                Language Protocol
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateSetting('', 'language', 'en')}
                  className={`cyber-btn flex items-center justify-center space-x-2 p-3 rounded-lg transition-all duration-300 ${
                    settings.language === 'en' ? 'bg-gradient-to-r from-blue-500 to-cyan-600 neon-glow' : 'border border-purple-500/50'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span className="font-rajdhani font-medium">ENGLISH</span>
                </button>
                <button
                  onClick={() => updateSetting('', 'language', 'ar')}
                  className={`cyber-btn flex items-center justify-center space-x-2 p-3 rounded-lg transition-all duration-300 ${
                    settings.language === 'ar' ? 'bg-gradient-to-r from-green-500 to-emerald-600 neon-glow' : 'border border-purple-500/50'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span className="font-rajdhani font-medium">العربية</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Settings */}
        <div className="cyber-card rounded-xl p-4 lg:p-6 relative">
          <div className="absolute inset-0 animated-border rounded-xl"></div>
          
          <div className="flex items-center space-x-3 mb-4 lg:mb-6 relative z-10">
            <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center neon-glow">
              <Zap className="w-4 lg:w-5 h-4 lg:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-orbitron font-semibold text-cyan-400 neon-text">PERFORMANCE CORE</h3>
              <p className="text-xs text-purple-400 font-rajdhani" dir="rtl">نواة الأداء</p>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            {[
              { key: 'animations', label: 'Animations', labelAr: 'الحركات' },
              { key: 'particles', label: 'Particle Effects', labelAr: 'تأثيرات الجسيمات' },
              { key: 'autoSave', label: 'Auto Save', labelAr: 'الحفظ التلقائي' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 cyber-card rounded-lg border border-purple-500/30">
                <div>
                  <p className="text-sm font-rajdhani font-medium text-cyan-400">{item.label.toUpperCase()}</p>
                  <p className="text-xs text-purple-400 font-rajdhani" dir="rtl">{item.labelAr}</p>
                </div>
                <button
                  onClick={() => updateSetting('performance', item.key, !settings.performance[item.key as keyof typeof settings.performance])}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                    settings.performance[item.key as keyof typeof settings.performance] 
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 neon-glow' 
                      : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform duration-300 ${
                    settings.performance[item.key as keyof typeof settings.performance] 
                      ? 'transform translate-x-7' 
                      : 'transform translate-x-1'
                  }`} />
                </button>
              </div>
            ))}

            <div>
              <label className="block text-sm font-rajdhani font-medium text-purple-400 mb-2 uppercase tracking-wide">
                Sync Frequency
              </label>
              <select
                value={settings.performance.syncFrequency}
                onChange={(e) => updateSetting('performance', 'syncFrequency', e.target.value)}
                className="cyber-input w-full px-4 py-3 rounded-lg font-rajdhani"
              >
                <option value="realtime">REAL-TIME</option>
                <option value="5min">EVERY 5 MINUTES</option>
                <option value="15min">EVERY 15 MINUTES</option>
                <option value="manual">MANUAL ONLY</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="cyber-card rounded-xl p-4 lg:p-6 relative">
        <div className="absolute inset-0 animated-border rounded-xl"></div>
        
        <div className="flex items-center space-x-3 mb-4 lg:mb-6 relative z-10">
          <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center neon-glow">
            <Database className="w-4 lg:w-5 h-4 lg:h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-orbitron font-semibold text-cyan-400 neon-text">DATA MANAGEMENT</h3>
            <p className="text-xs text-purple-400 font-rajdhani" dir="rtl">إدارة البيانات</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          <button
            onClick={exportData}
            className="cyber-btn flex items-center justify-center space-x-2 p-4 rounded-lg border border-blue-500/50 hover:bg-blue-900/20 transition-all duration-300"
          >
            <Download className="w-5 h-5 text-blue-400" />
            <span className="font-rajdhani font-medium text-blue-400">EXPORT DATA</span>
          </button>

          <button
            className="cyber-btn flex items-center justify-center space-x-2 p-4 rounded-lg border border-green-500/50 hover:bg-green-900/20 transition-all duration-300"
          >
            <Upload className="w-5 h-5 text-green-400" />
            <span className="font-rajdhani font-medium text-green-400">IMPORT DATA</span>
          </button>

          <button
            onClick={clearAllData}
            className="cyber-btn flex items-center justify-center space-x-2 p-4 rounded-lg border border-red-500/50 hover:bg-red-900/20 transition-all duration-300"
          >
            <Trash2 className="w-5 h-5 text-red-400" />
            <span className="font-rajdhani font-medium text-red-400">CLEAR DATA</span>
          </button>
        </div>

        <div className="mt-6 p-4 cyber-card rounded-lg bg-yellow-900/20 border border-yellow-500/30 relative z-10">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <p className="text-sm font-rajdhani font-medium text-yellow-400">DATA SECURITY NOTICE</p>
              <p className="text-xs text-yellow-300 mt-1 font-rajdhani">
                All data is stored locally on your device. Export your data regularly to prevent loss. 
                Clearing data will permanently remove all tasks, workouts, achievements, and settings.
              </p>
              <p className="text-xs text-yellow-300 mt-1 font-rajdhani" dir="rtl">
                جميع البيانات محفوظة محلياً على جهازك. قم بتصدير بياناتك بانتظام لمنع فقدانها.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};