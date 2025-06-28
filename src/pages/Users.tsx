import React from 'react';
import { Users as UsersIcon, UserPlus, Crown, Settings, Mail, Calendar, Shield, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Users: React.FC = () => {
  const { user: currentUser } = useAuth();

  // Only show this page if user is admin
  if (currentUser?.role !== 'admin') {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="cyber-card rounded-xl p-6 text-center">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-orbitron font-bold text-red-400 mb-2">ACCESS DENIED</h2>
          <p className="text-purple-400 font-rajdhani">Administrator privileges required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="cyber-card rounded-xl lg:rounded-2xl p-4 lg:p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-purple-900/50"></div>
        <div className="absolute inset-0 holographic opacity-20"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between relative z-10">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl lg:text-4xl font-orbitron font-bold mb-2 lg:mb-4 glitch cyber-text-glow" data-text="USER MANAGEMENT SYSTEM">
              USER MANAGEMENT SYSTEM
            </h1>
            <p className="text-cyan-400 text-base lg:text-lg font-rajdhani mb-1 lg:mb-2">
              ACCESS CONTROL • STATUS: OPERATIONAL
            </p>
            <p className="text-purple-400 font-rajdhani text-sm lg:text-base">
              CURRENT USER: {currentUser?.name?.toUpperCase()} • ROLE: {currentUser?.role?.toUpperCase()}
            </p>
            <div className="mt-3 lg:mt-6" dir="rtl">
              <h2 className="text-lg lg:text-xl font-rajdhani font-semibold text-cyan-400">نظام إدارة المستخدمين</h2>
              <p className="text-purple-400 font-rajdhani text-sm lg:text-base">المستخدم الحالي: {currentUser?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden lg:block">
              <div className="w-20 lg:w-24 h-20 lg:h-24 cyber-card rounded-full flex items-center justify-center neon-glow">
                <UsersIcon className="w-10 lg:w-12 h-10 lg:h-12 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <button className="cyber-btn bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg hover:neon-glow transition-all duration-300 flex items-center space-x-2">
              <UserPlus className="w-4 lg:w-5 h-4 lg:h-5" />
              <span className="font-rajdhani font-medium">INVITE USER</span>
            </button>
          </div>
        </div>
      </div>

      {/* Current User Profile */}
      <div className="cyber-card rounded-xl p-4 lg:p-6 relative">
        <div className="absolute inset-0 animated-border rounded-xl"></div>
        
        <div className="flex items-center justify-between mb-4 lg:mb-6 relative z-10">
          <h3 className="text-lg lg:text-xl font-orbitron font-semibold text-cyan-400 neon-text">CURRENT USER PROFILE</h3>
          <span className="text-xs lg:text-sm text-purple-400 font-rajdhani" dir="rtl">الملف الشخصي الحالي</span>
        </div>
        
        <div className="cyber-card rounded-lg p-4 lg:p-6 relative hover:neon-glow transition-all duration-300 relative z-10">
          <div className="absolute inset-0 animated-border rounded-lg"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  className="w-12 lg:w-16 h-12 lg:h-16 rounded-full object-cover border-2 neon-border"
                  src={currentUser?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
                  alt={currentUser?.name}
                />
                <div className="absolute -top-1 -right-1 status-indicator"></div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-lg font-orbitron font-medium text-cyan-400 neon-text">{currentUser?.name?.toUpperCase()}</h4>
                  {currentUser?.role === 'admin' && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-purple-400 mt-1 font-rajdhani">
                  <div className="flex items-center space-x-1">
                    <Mail className="w-4 h-4" />
                    <span>{currentUser?.email}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>ACTIVE SESSION</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-xs font-rajdhani font-medium border ${
                currentUser?.role === 'admin' 
                  ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50' 
                  : 'bg-blue-900/30 text-blue-400 border-blue-500/50'
              }`}>
                {currentUser?.role === 'admin' ? 'ADMINISTRATOR' : 'MEMBER'}
              </span>
              
              <span className="px-3 py-1 bg-green-900/30 text-green-400 border border-green-500/50 rounded-full text-xs font-rajdhani font-medium">
                ACTIVE
              </span>
              
              <button className="cyber-btn p-2 text-purple-400 hover:text-cyan-400 transition-colors rounded-lg">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* User Stats */}
          <div className="mt-4 grid grid-cols-4 gap-4 relative z-10">
            <div className="text-center p-3 cyber-card rounded-lg bg-purple-900/20 border border-purple-500/30">
              <div className="text-lg font-orbitron font-bold text-cyan-400">12</div>
              <div className="text-xs text-purple-400 font-rajdhani">TASKS</div>
            </div>
            <div className="text-center p-3 cyber-card rounded-lg bg-purple-900/20 border border-purple-500/30">
              <div className="text-lg font-orbitron font-bold text-cyan-400">5</div>
              <div className="text-xs text-purple-400 font-rajdhani">WORKOUTS</div>
            </div>
            <div className="text-center p-3 cyber-card rounded-lg bg-purple-900/20 border border-purple-500/30">
              <div className="text-lg font-orbitron font-bold text-cyan-400">8</div>
              <div className="text-xs text-purple-400 font-rajdhani">JOURNAL</div>
            </div>
            <div className="text-center p-3 cyber-card rounded-lg bg-purple-900/20 border border-purple-500/30">
              <div className="text-lg font-orbitron font-bold text-cyan-400">95%</div>
              <div className="text-xs text-purple-400 font-rajdhani">COMPLETION</div>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="cyber-card rounded-xl p-4 lg:p-6 relative">
          <div className="absolute inset-0 animated-border rounded-xl"></div>
          
          <h3 className="text-lg font-orbitron font-semibold text-cyan-400 neon-text mb-4 relative z-10">SYSTEM PERMISSIONS</h3>
          <div className="space-y-3 relative z-10">
            {[
              'Create and edit tasks',
              'Log workout sessions',
              'Access personal journal',
              'Use AI assistant',
              'Manage system settings',
              'Access user management'
            ].map((permission, index) => (
              <div key={index} className="flex items-center justify-between p-3 cyber-card rounded-lg bg-purple-900/20 border border-purple-500/30">
                <span className="text-sm text-cyan-400 font-rajdhani font-medium">{permission.toUpperCase()}</span>
                <div className="flex space-x-2">
                  {currentUser?.role === 'admin' ? (
                    <span className="text-xs text-green-400 font-rajdhani">✓ GRANTED</span>
                  ) : (
                    <span className="text-xs text-blue-400 font-rajdhani">
                      {index < 4 ? '✓ GRANTED' : '✗ RESTRICTED'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cyber-card rounded-xl p-4 lg:p-6 relative">
          <div className="absolute inset-0 animated-border rounded-xl"></div>
          
          <h3 className="text-lg font-orbitron font-semibold text-cyan-400 neon-text mb-4 relative z-10">SESSION ACTIVITY</h3>
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between p-3 cyber-card rounded-lg bg-purple-900/20 border border-purple-500/30">
              <div>
                <p className="text-sm font-rajdhani font-medium text-cyan-400">LOGIN TIME</p>
                <p className="text-xs text-purple-400 font-rajdhani">Session started</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-400 font-rajdhani">{new Date().toLocaleTimeString()}</p>
                <p className="text-xs text-purple-400 font-rajdhani">TODAY</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 cyber-card rounded-lg bg-purple-900/20 border border-purple-500/30">
              <div>
                <p className="text-sm font-rajdhani font-medium text-cyan-400">LAST ACTIVITY</p>
                <p className="text-xs text-purple-400 font-rajdhani">Recent system interaction</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-cyan-400 font-rajdhani">ACTIVE NOW</p>
                <div className="flex items-center justify-end space-x-1">
                  <Activity className="w-3 h-3 text-green-400" />
                  <p className="text-xs text-green-400 font-rajdhani">ONLINE</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 cyber-card rounded-lg bg-purple-900/20 border border-purple-500/30">
              <div>
                <p className="text-sm font-rajdhani font-medium text-cyan-400">SECURITY STATUS</p>
                <p className="text-xs text-purple-400 font-rajdhani">Account protection level</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-400 font-rajdhani">SECURE</p>
                <div className="flex items-center justify-end space-x-1">
                  <Shield className="w-3 h-3 text-green-400" />
                  <p className="text-xs text-green-400 font-rajdhani">PROTECTED</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};