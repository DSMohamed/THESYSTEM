import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, CheckSquare, Dumbbell, BookOpen, MessageCircle, Users, Settings, LogOut, Zap, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home, nameAr: 'لوحة التحكم' },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare, nameAr: 'المهام' },
  { name: 'Workouts', href: '/workouts', icon: Dumbbell, nameAr: 'التمارين' },
  { name: 'Journal', href: '/journal', icon: BookOpen, nameAr: 'المذكرات' },
  { name: 'AI Assistant', href: '/chat', icon: MessageCircle, nameAr: 'المساعد الذكي' },
  { name: 'Users', href: '/users', icon: Users, nameAr: 'المستخدمون' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Filter navigation: only show 'Users' for admin
  const filteredNavigation = navigation.filter(item => item.name !== 'Users' || user?.role === 'admin');

  const handleNavClick = (href: string) => {
    // Close sidebar on mobile when navigation item is clicked
    if (onClose) {
      console.log('Navigation clicked - closing sidebar');
      onClose();
    }
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    if (onClose) {
      console.log('Settings clicked - closing sidebar');
      onClose();
    }
  };

  const handleLogoutClick = async () => {
    try {
      await signOut();
      if (onClose) {
        console.log('Logout clicked - closing sidebar');
        onClose();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // DIRECT close handler - no event object needed
  const closeSidebar = () => {
    console.log('DIRECT CLOSE CALLED');
    if (onClose) {
      console.log('Calling onClose function');
      onClose();
    } else {
      console.log('onClose is not available');
    }
  };

  return (
    <div className="flex flex-col h-full cyber-card border-r-2 neon-border-purple relative bg-gray-900/95 backdrop-blur-md">
      {/* Animated border effect */}
      <div className="absolute inset-0 animated-border rounded-none"></div>
      
      {/* Header with Logo and Close Button */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-4 lg:py-6 border-b border-purple-500/30 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center neon-glow">
            <Zap className="w-4 lg:w-6 h-4 lg:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg lg:text-xl font-orbitron font-bold cyber-text-glow">NEXUS</h1>
            <p className="text-xs text-purple-400 font-rajdhani">SYSTEM v2.0</p>
          </div>
        </div>
        
        {/* FIXED Mobile Close Button */}
        <div className="lg:hidden">
          <button
            type="button"
            onClick={closeSidebar}
            onMouseDown={closeSidebar}
            onTouchStart={closeSidebar}
            className="cyber-btn p-3 rounded-lg hover:neon-glow transition-all duration-300 text-cyan-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-purple-900/30 border border-cyan-400/50"
            aria-label="Close sidebar"
            style={{ 
              zIndex: 9999,
              position: 'relative',
              minWidth: '44px',
              minHeight: '44px'
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* User Profile */}
      <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-purple-500/30 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              className="w-10 lg:w-12 h-10 lg:h-12 rounded-full object-cover border-2 neon-border"
              src={user?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
              alt={user?.name}
            />
            <div className="absolute -top-1 -right-1 status-indicator"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-orbitron font-medium text-cyan-400 truncate neon-text">
              {user?.name}
            </p>
            <p className="text-xs text-purple-400 truncate font-rajdhani">
              {user?.role === 'admin' ? 'ADMIN ACCESS' : 'USER ACCESS'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 lg:px-4 py-4 lg:py-6 space-y-1 lg:space-y-2 relative z-10 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => handleNavClick(item.href)}
              className={`group flex items-center px-3 lg:px-4 py-3 text-sm font-rajdhani font-medium rounded-lg transition-all duration-300 relative overflow-hidden ${
                isActive
                  ? 'cyber-card neon-border text-cyan-400 neon-glow'
                  : 'text-gray-300 hover:text-cyan-400 hover:bg-purple-900/20'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 holographic opacity-30"></div>
              )}
              <item.icon
                className={`mr-3 h-4 lg:h-5 w-4 lg:w-5 transition-colors relative z-10 ${
                  isActive ? 'text-cyan-400 neon-text' : 'text-gray-400 group-hover:text-cyan-400'
                }`}
              />
              <span className="flex-1 relative z-10 font-medium tracking-wide text-xs lg:text-sm">
                {item.name.toUpperCase()}
              </span>
              <span className="text-xs text-purple-400 ml-2 relative z-10 font-rajdhani hidden lg:inline" dir="rtl">
                {item.nameAr}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-2 lg:p-4 border-t border-purple-500/30 space-y-1 lg:space-y-2 relative z-10">
        <button
          onClick={handleSettingsClick}
          className="w-full flex items-center px-3 lg:px-4 py-3 text-sm font-rajdhani font-medium text-gray-300 rounded-lg hover:text-cyan-400 hover:bg-purple-900/20 transition-all duration-300"
        >
          <Settings className="mr-3 h-4 lg:h-5 w-4 lg:w-5 text-gray-400" />
          <span className="tracking-wide text-xs lg:text-sm">SETTINGS</span>
          <span className="text-xs text-purple-400 ml-auto font-rajdhani hidden lg:inline" dir="rtl">الإعدادات</span>
        </button>
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center px-3 lg:px-4 py-3 text-sm font-rajdhani font-medium text-red-400 rounded-lg hover:text-red-300 hover:bg-red-900/20 transition-all duration-300"
        >
          <LogOut className="mr-3 h-4 lg:h-5 w-4 lg:w-5 text-red-500" />
          <span className="tracking-wide text-xs lg:text-sm">LOGOUT</span>
          <span className="text-xs text-red-400 ml-auto font-rajdhani hidden lg:inline" dir="rtl">تسجيل خروج</span>
        </button>
      </div>
    </div>
  );
};