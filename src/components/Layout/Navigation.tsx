import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  Dumbbell, 
  BookOpen, 
  MessageCircle, 
  Users, 
  Settings, 
  LogOut, 
  Zap, 
  X,
  Menu,
  User,
  Crown,
  Activity
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: Home, nameAr: 'لوحة التحكم' },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare, nameAr: 'المهام' },
  { name: 'Workouts', href: '/workouts', icon: Dumbbell, nameAr: 'التمارين' },
  { name: 'Journal', href: '/journal', icon: BookOpen, nameAr: 'المذكرات' },
  { name: 'AI Assistant', href: '/chat', icon: MessageCircle, nameAr: 'المساعد الذكي' },
  { name: 'Users', href: '/users', icon: Users, nameAr: 'المستخدمون' },
];

interface NavigationProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ isOpen, onClose, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Filter navigation items based on user role
  const filteredItems = navigationItems.filter(item => 
    item.name !== 'Users' || user?.role === 'admin'
  );

  // Get display avatar
  const getDisplayAvatar = () => {
    if (user?.id) {
      const localAvatar = localStorage.getItem(`avatar_${user.id}`);
      if (localAvatar) return localAvatar;
    }
    return user?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150';
  };

  // Handle navigation
  const handleNavigate = (href: string) => {
    navigate(href);
    // Always close on mobile after navigation
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  // Handle settings
  const handleSettings = () => {
    navigate('/settings');
    // Always close on mobile after navigation
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      // Always close on mobile after logout
      if (window.innerWidth < 1024) {
        onClose();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Mobile Menu Button - Only show on mobile when navigation is closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="lg:hidden fixed top-4 left-4 z-[100] cyber-btn p-3 rounded-lg neon-glow transition-all duration-300 text-cyan-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-purple-900/90 border border-cyan-400/50 backdrop-blur-md"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Mobile Overlay - Only show on mobile when open */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/75 backdrop-blur-sm z-40"
          onClick={onClose}
          onTouchStart={onClose}
        />
      )}

      {/* Navigation Panel */}
      <div className={`
        /* Desktop: always visible, full height */
        lg:relative lg:translate-x-0 lg:w-full lg:h-full lg:block
        /* Mobile: fixed overlay - COMPLETELY HIDDEN BY DEFAULT */
        fixed lg:static top-0 left-0 h-full w-80 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        /* Ensure proper display states - NEVER show on mobile unless open */
        ${isOpen ? 'block' : 'hidden'} lg:block
      `}>
        <div className="h-full cyber-card border-r-2 neon-border-purple bg-gray-900/95 backdrop-blur-md flex flex-col">
          {/* Animated border effect */}
          <div className="absolute inset-0 animated-border rounded-none"></div>
          
          {/* Header */}
          <div className="relative z-10 p-6 border-b border-purple-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center neon-glow">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-orbitron font-bold cyber-text-glow">NEXUS</h1>
                  <p className="text-xs text-purple-400 font-rajdhani">SYSTEM v2.0</p>
                </div>
              </div>
              
              {/* Single Close Button - Only show on mobile when open */}
              {isOpen && (
                <button
                  onClick={onClose}
                  className="lg:hidden cyber-btn p-2 rounded-lg hover:neon-glow transition-all duration-300 text-cyan-400 hover:text-white"
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* User Profile */}
          <div className="relative z-10 p-6 border-b border-purple-500/30">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  className="w-14 h-14 rounded-full object-cover border-2 neon-border"
                  src={getDisplayAvatar()}
                  alt={user?.name}
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <Activity className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-orbitron font-semibold text-cyan-400 truncate neon-text">
                    {user?.name}
                  </h3>
                  {user?.role === 'admin' && <Crown className="w-4 h-4 text-yellow-500" />}
                </div>
                <p className="text-sm text-purple-400 font-rajdhani">
                  {user?.role === 'admin' ? 'ADMIN ACCESS' : 'USER ACCESS'}
                </p>
                <p className="text-xs text-cyan-400 font-rajdhani" dir="rtl">
                  {user?.role === 'admin' ? 'وصول المدير' : 'وصول المستخدم'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 relative z-10 p-4 space-y-2 overflow-y-auto">
            {filteredItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigate(item.href)}
                  className={`w-full group flex items-center px-4 py-3 text-sm font-rajdhani font-medium rounded-xl transition-all duration-300 relative overflow-hidden ${
                    isActive
                      ? 'cyber-card neon-border text-cyan-400 neon-glow bg-purple-900/30'
                      : 'text-gray-300 hover:text-cyan-400 hover:bg-purple-900/20'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 holographic opacity-30"></div>
                  )}
                  <item.icon
                    className={`mr-4 h-5 w-5 transition-colors relative z-10 ${
                      isActive ? 'text-cyan-400 neon-text' : 'text-gray-400 group-hover:text-cyan-400'
                    }`}
                  />
                  <div className="flex-1 text-left relative z-10">
                    <span className="block font-medium tracking-wide">
                      {item.name.toUpperCase()}
                    </span>
                    <span className="block text-xs text-purple-400 font-rajdhani" dir="rtl">
                      {item.nameAr}
                    </span>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse relative z-10"></div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="relative z-10 p-4 border-t border-purple-500/30 space-y-2">
            <button
              onClick={handleSettings}
              className="w-full flex items-center px-4 py-3 text-sm font-rajdhani font-medium text-gray-300 rounded-xl hover:text-cyan-400 hover:bg-purple-900/20 transition-all duration-300"
            >
              <Settings className="mr-4 h-5 w-5 text-gray-400" />
              <div className="flex-1 text-left">
                <span className="block tracking-wide">SETTINGS</span>
                <span className="block text-xs text-purple-400 font-rajdhani" dir="rtl">الإعدادات</span>
              </div>
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-rajdhani font-medium text-red-400 rounded-xl hover:text-red-300 hover:bg-red-900/20 transition-all duration-300"
            >
              <LogOut className="mr-4 h-5 w-5 text-red-500" />
              <div className="flex-1 text-left">
                <span className="block tracking-wide">LOGOUT</span>
                <span className="block text-xs text-red-400 font-rajdhani" dir="rtl">تسجيل خروج</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};