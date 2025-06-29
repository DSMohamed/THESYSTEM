import React, { useState, useRef } from 'react';
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
  Edit3,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  FileText,
  Star,
  TrendingUp,
  ImageIcon,
  X
} from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const { settings, updateSetting, resetSettings, exportSettings, importSettings } = useSettings();
  
  // Profile settings
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Image upload states
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Password settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Import/Export
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Image upload functions
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setProfileMsg('Please select a valid image file');
      setTimeout(() => setProfileMsg(null), 5000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setProfileMsg('Image size must be less than 5MB');
      setTimeout(() => setProfileMsg(null), 5000);
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Create a preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Convert to base64 for storage (in a real app, you'd upload to a service like Firebase Storage)
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      // Complete the progress
      setUploadProgress(100);
      clearInterval(progressInterval);

      // Update avatar state
      setAvatar(base64);
      setProfileMsg('Image uploaded successfully! Click "Update Profile" to save.');
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setProfileMsg(null);
      }, 2000);

    } catch (error) {
      setProfileMsg('Failed to upload image. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
      setTimeout(() => setProfileMsg(null), 5000);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const removePreviewImage = () => {
    setPreviewImage(null);
    setAvatar(user?.avatar || '');
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileLoading(true);
    try {
      const finalAvatar = previewImage || avatar;
      await authService.updateProfile(name, finalAvatar);
      setProfileMsg('Profile updated successfully!');
      setPreviewImage(null);
      setTimeout(() => setProfileMsg(null), 3000);
    } catch (err: any) {
      setProfileMsg(err.message || 'Failed to update profile');
      setTimeout(() => setProfileMsg(null), 5000);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    
    if (newPassword !== confirmPassword) {
      setPasswordMsg('New passwords do not match');
      setTimeout(() => setPasswordMsg(null), 5000);
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordMsg('Password must be at least 6 characters');
      setTimeout(() => setPasswordMsg(null), 5000);
      return;
    }

    setPasswordLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setPasswordMsg('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(null), 3000);
    } catch (err: any) {
      setPasswordMsg(err.message || 'Failed to change password');
      setTimeout(() => setPasswordMsg(null), 5000);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleExportData = () => {
    const data = {
      profile: { name: user?.name, email: user?.email },
      tasks: localStorage.getItem('dailyflow_tasks'),
      workouts: localStorage.getItem('dailyflow_workouts'),
      level: localStorage.getItem(`userLevel_${user?.id}`),
      achievements: localStorage.getItem(`achievements_${user?.id}`),
      settings: exportSettings(),
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

  const handleExportSettings = () => {
    const settingsData = exportSettings();
    const blob = new Blob([settingsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = importSettings(content);
        
        if (success) {
          setImportMsg('Settings imported successfully!');
          setTimeout(() => {
            setImportMsg(null);
            window.location.reload(); // Reload to apply all settings
          }, 2000);
        } else {
          setImportMsg('Invalid settings file format');
          setTimeout(() => setImportMsg(null), 5000);
        }
      } catch (error) {
        setImportMsg('Error reading settings file');
        setTimeout(() => setImportMsg(null), 5000);
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    if (window.confirm('⚠️ WARNING: This will permanently delete ALL your data including tasks, workouts, achievements, and settings. This action cannot be undone. Are you absolutely sure?')) {
      if (window.confirm('This is your final warning. All data will be lost forever. Continue?')) {
        // Clear all app data
        const keysToRemove = Object.keys(localStorage).filter(key => 
          key.startsWith('dailyflow_') || 
          key.startsWith('userLevel_') || 
          key.startsWith('achievements_') ||
          key.startsWith('settings_') ||
          key.startsWith('geminiChatHistory_')
        );
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Reset settings
        resetSettings();
        
        alert('All data has been cleared. The page will now reload.');
        window.location.reload();
      }
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Reset all settings to default values? This will not affect your tasks or workouts.')) {
      resetSettings();
      alert('Settings have been reset to defaults. The page will reload to apply changes.');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const testNotificationSound = () => {
    // Play test sound
    try {
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
    } catch (error) {
      console.error('Error playing test sound:', error);
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
            {/* Profile Picture Upload */}
            <div>
              <label className="block text-sm font-rajdhani font-medium text-purple-400 mb-2 uppercase tracking-wide">
                Avatar Protocol
              </label>
              
              {/* Current/Preview Avatar */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                  <img
                    className="w-16 h-16 rounded-full object-cover border-2 neon-border"
                    src={previewImage || avatar || user?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
                    alt="Profile"
                  />
                  {previewImage && (
                    <button
                      type="button"
                      onClick={removePreviewImage}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-cyan-400 font-rajdhani">
                    {previewImage ? 'New image ready to save' : 'Current profile image'}
                  </p>
                  <p className="text-xs text-purple-400 font-rajdhani">
                    Drag & drop or click to upload
                  </p>
                </div>
              </div>

              {/* Drag & Drop Zone */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 cursor-pointer ${
                  isDragging 
                    ? 'border-cyan-400 bg-cyan-900/20 neon-glow' 
                    : 'border-purple-500/50 hover:border-cyan-400/70 hover:bg-purple-900/20'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => imageInputRef.current?.click()}
              >
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {isUploading ? (
                  <div className="space-y-3">
                    <RefreshCw className="w-8 h-8 text-cyan-400 mx-auto animate-spin" />
                    <p className="text-cyan-400 font-rajdhani font-medium">UPLOADING IMAGE...</p>
                    <div className="w-full cyber-progress h-2 rounded-full">
                      <div 
                        className="cyber-progress-bar h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-purple-400 font-rajdhani">{uploadProgress}% complete</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <ImageIcon className="w-8 h-8 text-purple-400 mx-auto" />
                    <div>
                      <p className="text-cyan-400 font-rajdhani font-medium">
                        {isDragging ? 'DROP IMAGE HERE' : 'DRAG & DROP IMAGE'}
                      </p>
                      <p className="text-xs text-purple-400 font-rajdhani mt-1">
                        or click to browse • Max 5MB • JPG, PNG, GIF
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

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
              className="w-full cyber-btn bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 px-4 rounded-lg font-rajdhani font-medium hover:neon-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {profileLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>UPDATING...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>UPDATE PROFILE</span>
                </>
              )}
            </button>

            {profileMsg && (
              <div className={`p-3 cyber-card border rounded-lg flex items-center space-x-2 ${
                profileMsg.includes('success') ? 'border-green-500/50' : 'border-red-500/50'
              }`}>
                {profileMsg.includes('success') ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )}
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
              className="w-full cyber-btn bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 px-4 rounded-lg font-rajdhani font-medium hover:neon-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {passwordLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>UPDATING...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>UPDATE PASSWORD</span>
                </>
              )}
            </button>

            {passwordMsg && (
              <div className={`p-3 cyber-card border rounded-lg flex items-center space-x-2 ${
                passwordMsg.includes('success') ? 'border-green-500/50' : 'border-red-500/50'
              }`}>
                {passwordMsg.includes('success') ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )}
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
          
          <div className="flex items-center justify-between mb-4 lg:mb-6 relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center neon-glow">
                <Bell className="w-4 lg:w-5 h-4 lg:h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-orbitron font-semibold text-cyan-400 neon-text">ALERT SYSTEM</h3>
                <p className="text-xs text-purple-400 font-rajdhani" dir="rtl">نظام التنبيهات</p>
              </div>
            </div>
            {settings.notifications.sound && (
              <button
                onClick={testNotificationSound}
                className="cyber-btn p-2 rounded-lg text-yellow-400 hover:text-orange-400 transition-colors"
                title="Test notification sound"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="space-y-4 relative z-10">
            {[
              { key: 'taskReminders', label: 'Task Reminders', labelAr: 'تذكير المهام', icon: CheckCircle },
              { key: 'workoutReminders', label: 'Workout Reminders', labelAr: 'تذكير التمارين', icon: Zap },
              { key: 'achievements', label: 'Achievement Alerts', labelAr: 'تنبيهات الإنجازات', icon: Star },
              { key: 'dailyStreak', label: 'Daily Streak', labelAr: 'الإنجاز اليومي', icon: TrendingUp },
              { key: 'weeklyReport', label: 'Weekly Reports', labelAr: 'التقارير الأسبوعية', icon: FileText },
              { key: 'sound', label: 'Sound Effects', labelAr: 'المؤثرات الصوتية', icon: settings.notifications.sound ? Volume2 : VolumeX }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 cyber-card rounded-lg border border-purple-500/30 hover:border-cyan-500/50 transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <item.icon className="w-4 h-4 text-cyan-400" />
                  <div>
                    <p className="text-sm font-rajdhani font-medium text-cyan-400">{item.label.toUpperCase()}</p>
                    <p className="text-xs text-purple-400 font-rajdhani" dir="rtl">{item.labelAr}</p>
                  </div>
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
              { key: 'shareProgress', label: 'Share Progress', labelAr: 'مشاركة التقدم', desc: 'Allow others to see your achievements' },
              { key: 'publicProfile', label: 'Public Profile', labelAr: 'الملف العام', desc: 'Make your profile visible to other users' },
              { key: 'dataCollection', label: 'Data Collection', labelAr: 'جمع البيانات', desc: 'Help improve the app with usage data' },
              { key: 'analytics', label: 'Usage Analytics', labelAr: 'تحليلات الاستخدام', desc: 'Anonymous usage statistics' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 cyber-card rounded-lg border border-purple-500/30 hover:border-green-500/50 transition-all duration-300">
                <div>
                  <p className="text-sm font-rajdhani font-medium text-cyan-400">{item.label.toUpperCase()}</p>
                  <p className="text-xs text-purple-400 font-rajdhani" dir="rtl">{item.labelAr}</p>
                  <p className="text-xs text-gray-400 font-rajdhani mt-1">{item.desc}</p>
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
                  onClick={() => updateSetting('theme', 'theme', 'dark')}
                  className={`cyber-btn flex items-center justify-center space-x-2 p-3 rounded-lg transition-all duration-300 ${
                    settings.theme === 'dark' ? 'bg-gradient-to-r from-purple-500 to-pink-600 neon-glow' : 'border border-purple-500/50 hover:border-purple-400'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span className="font-rajdhani font-medium">DARK</span>
                </button>
                <button
                  onClick={() => updateSetting('theme', 'theme', 'light')}
                  className={`cyber-btn flex items-center justify-center space-x-2 p-3 rounded-lg transition-all duration-300 ${
                    settings.theme === 'light' ? 'bg-gradient-to-r from-yellow-500 to-orange-600 neon-glow' : 'border border-purple-500/50 hover:border-yellow-400'
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
                  onClick={() => updateSetting('language', 'language', 'en')}
                  className={`cyber-btn flex items-center justify-center space-x-2 p-3 rounded-lg transition-all duration-300 ${
                    settings.language === 'en' ? 'bg-gradient-to-r from-blue-500 to-cyan-600 neon-glow' : 'border border-purple-500/50 hover:border-blue-400'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span className="font-rajdhani font-medium">ENGLISH</span>
                </button>
                <button
                  onClick={() => updateSetting('language', 'language', 'ar')}
                  className={`cyber-btn flex items-center justify-center space-x-2 p-3 rounded-lg transition-all duration-300 ${
                    settings.language === 'ar' ? 'bg-gradient-to-r from-green-500 to-emerald-600 neon-glow' : 'border border-purple-500/50 hover:border-green-400'
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
              { key: 'animations', label: 'Animations', labelAr: 'الحركات', desc: 'Enable visual animations and transitions' },
              { key: 'particles', label: 'Particle Effects', labelAr: 'تأثيرات الجسيمات', desc: 'Show floating particle effects' },
              { key: 'autoSave', label: 'Auto Save', labelAr: 'الحفظ التلقائي', desc: 'Automatically save changes' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 cyber-card rounded-lg border border-purple-500/30 hover:border-orange-500/50 transition-all duration-300">
                <div>
                  <p className="text-sm font-rajdhani font-medium text-cyan-400">{item.label.toUpperCase()}</p>
                  <p className="text-xs text-purple-400 font-rajdhani" dir="rtl">{item.labelAr}</p>
                  <p className="text-xs text-gray-400 font-rajdhani mt-1">{item.desc}</p>
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
              <p className="text-xs text-gray-400 font-rajdhani mt-1">How often to sync data changes</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          <button
            onClick={handleExportData}
            className="cyber-btn flex flex-col items-center justify-center space-y-2 p-4 rounded-lg border border-blue-500/50 hover:bg-blue-900/20 hover:border-blue-400 transition-all duration-300"
          >
            <Download className="w-6 h-6 text-blue-400" />
            <span className="font-rajdhani font-medium text-blue-400 text-sm">EXPORT ALL DATA</span>
            <span className="text-xs text-gray-400 font-rajdhani text-center">Complete backup</span>
          </button>

          <button
            onClick={handleExportSettings}
            className="cyber-btn flex flex-col items-center justify-center space-y-2 p-4 rounded-lg border border-cyan-500/50 hover:bg-cyan-900/20 hover:border-cyan-400 transition-all duration-300"
          >
            <FileText className="w-6 h-6 text-cyan-400" />
            <span className="font-rajdhani font-medium text-cyan-400 text-sm">EXPORT SETTINGS</span>
            <span className="text-xs text-gray-400 font-rajdhani text-center">Settings only</span>
          </button>

          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportSettings}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="cyber-btn flex flex-col items-center justify-center space-y-2 p-4 rounded-lg border border-green-500/50 hover:bg-green-900/20 hover:border-green-400 transition-all duration-300 w-full"
            >
              <Upload className="w-6 h-6 text-green-400" />
              <span className="font-rajdhani font-medium text-green-400 text-sm">IMPORT SETTINGS</span>
              <span className="text-xs text-gray-400 font-rajdhani text-center">Restore settings</span>
            </button>
          </div>

          <button
            onClick={handleClearAllData}
            className="cyber-btn flex flex-col items-center justify-center space-y-2 p-4 rounded-lg border border-red-500/50 hover:bg-red-900/20 hover:border-red-400 transition-all duration-300"
          >
            <Trash2 className="w-6 h-6 text-red-400" />
            <span className="font-rajdhani font-medium text-red-400 text-sm">CLEAR ALL DATA</span>
            <span className="text-xs text-gray-400 font-rajdhani text-center">⚠️ Permanent</span>
          </button>
        </div>

        {/* Additional Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4 relative z-10">
          <button
            onClick={handleResetSettings}
            className="cyber-btn flex items-center justify-center space-x-2 px-4 py-3 border border-yellow-500/50 hover:bg-yellow-900/20 hover:border-yellow-400 transition-all duration-300"
          >
            <RefreshCw className="w-4 h-4 text-yellow-400" />
            <span className="font-rajdhani font-medium text-yellow-400">RESET SETTINGS</span>
          </button>
          
          <div className="flex-1">
            {importMsg && (
              <div className={`p-3 cyber-card border rounded-lg flex items-center space-x-2 ${
                importMsg.includes('success') ? 'border-green-500/50' : 'border-red-500/50'
              }`}>
                {importMsg.includes('success') ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )}
                <p className={`text-sm font-rajdhani ${
                  importMsg.includes('success') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {importMsg}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 cyber-card rounded-lg bg-yellow-900/20 border border-yellow-500/30 relative z-10">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <p className="text-sm font-rajdhani font-medium text-yellow-400">DATA SECURITY NOTICE</p>
              <p className="text-xs text-yellow-300 mt-1 font-rajdhani">
                All data is stored locally on your device. Export your data regularly to prevent loss. 
                Clearing data will permanently remove all tasks, workouts, achievements, and settings.
                Settings are automatically saved when changed. Profile images are stored as base64 data.
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