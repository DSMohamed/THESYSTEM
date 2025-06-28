import React from 'react';
import { Users as UsersIcon, UserPlus, Crown, Settings, Mail, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Users: React.FC = () => {
  const { users, user: currentUser, switchUser } = useAuth();

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
              ACTIVE USERS: {users.length} • CURRENT: {currentUser?.name?.toUpperCase()}
            </p>
            <div className="mt-3 lg:mt-6" dir="rtl">
              <h2 className="text-lg lg:text-xl font-rajdhani font-semibold text-cyan-400">نظام إدارة المستخدمين</h2>
              <p className="text-purple-400 font-rajdhani text-sm lg:text-base">المستخدمون النشطون: {users.length}</p>
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
              <span className="font-rajdhani font-medium">ADD USER</span>
            </button>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="cyber-card rounded-xl p-4 lg:p-6 relative">
        <div className="absolute inset-0 animated-border rounded-xl"></div>
        
        <div className="flex items-center justify-between mb-4 lg:mb-6 relative z-10">
          <h3 className="text-lg lg:text-xl font-orbitron font-semibold text-cyan-400 neon-text">SYSTEM USERS</h3>
          <span className="text-xs lg:text-sm text-purple-400 font-rajdhani" dir="rtl">مستخدمو النظام</span>
        </div>
        
        <div className="space-y-4 relative z-10">
          {users.map((user) => (
            <div key={user.id} className="cyber-card rounded-lg p-4 lg:p-6 relative hover:neon-glow transition-all duration-300">
              <div className="absolute inset-0 animated-border rounded-lg"></div>
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      className="w-12 lg:w-16 h-12 lg:h-16 rounded-full object-cover border-2 neon-border"
                      src={user.avatar}
                      alt={user.name}
                    />
                    {user.id === currentUser?.id && (
                      <div className="absolute -top-1 -right-1 status-indicator"></div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-lg font-orbitron font-medium text-cyan-400 neon-text">{user.name.toUpperCase()}</h4>
                      {user.role === 'admin' && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-purple-400 mt-1 font-rajdhani">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>JOINED JAN 2025</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-rajdhani font-medium border ${
                    user.role === 'admin' 
                      ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50' 
                      : 'bg-blue-900/30 text-blue-400 border-blue-500/50'
                  }`}>
                    {user.role === 'admin' ? 'ADMINISTRATOR' : 'MEMBER'}
                  </span>
                  
                  {user.id === currentUser?.id ? (
                    <span className="px-3 py-1 bg-green-900/30 text-green-400 border border-green-500/50 rounded-full text-xs font-rajdhani font-medium">
                      CURRENT USER
                    </span>
                  ) : (
                    <button
                      onClick={() => switchUser(user.id)}
                      className="cyber-btn px-3 py-1 bg-purple-900/30 text-purple-400 border border-purple-500/50 rounded-lg text-sm transition-all hover:bg-purple-900/50 font-rajdhani font-medium"
                    >
                      SWITCH TO
                    </button>
                  )}
                  
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
          ))}
        </div>
      </div>

      {/* Permissions & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="cyber-card rounded-xl p-4 lg:p-6 relative">
          <div className="absolute inset-0 animated-border rounded-xl"></div>
          
          <h3 className="text-lg font-orbitron font-semibold text-cyan-400 neon-text mb-4 relative z-10">USER PERMISSIONS</h3>
          <div className="space-y-3 relative z-10">
            {[
              'Create and edit tasks',
              'Log workout sessions',
              'Access personal journal',
              'Use AI assistant',
              'View other users\' progress',
              'Manage system settings'
            ].map((permission, index) => (
              <div key={index} className="flex items-center justify-between p-3 cyber-card rounded-lg bg-purple-900/20 border border-purple-500/30">
                <span className="text-sm text-cyan-400 font-rajdhani font-medium">{permission.toUpperCase()}</span>
                <div className="flex space-x-2">
                  <span className="text-xs text-green-400 font-rajdhani">✓ ADMIN</span>
                  <span className="text-xs text-blue-400 font-rajdhani">✓ MEMBER</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cyber-card rounded-xl p-4 lg:p-6 relative">
          <div className="absolute inset-0 animated-border rounded-xl"></div>
          
          <h3 className="text-lg font-orbitron font-semibold text-cyan-400 neon-text mb-4 relative z-10">PRIVACY SETTINGS</h3>
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between p-3 cyber-card rounded-lg bg-purple-900/20 border border-purple-500/30">
              <div>
                <p className="text-sm font-rajdhani font-medium text-cyan-400">SHARE WORKOUT PROGRESS</p>
                <p className="text-xs text-purple-400 font-rajdhani">Allow other users to see your fitness stats</p>
              </div>
              <button className="relative w-12 h-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-300 neon-glow">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-transform duration-300"></div>
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 cyber-card rounded-lg bg-purple-900/20 border border-purple-500/30">
              <div>
                <p className="text-sm font-rajdhani font-medium text-cyan-400">PRIVATE JOURNAL ENTRIES</p>
                <p className="text-xs text-purple-400 font-rajdhani">Keep journal entries completely private</p>
              </div>
              <button className="relative w-12 h-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-300 neon-glow">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-transform duration-300"></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-3 cyber-card rounded-lg bg-purple-900/20 border border-purple-500/30">
              <div>
                <p className="text-sm font-rajdhani font-medium text-cyan-400">TASK NOTIFICATIONS</p>
                <p className="text-xs text-purple-400 font-rajdhani">Get notified about task updates</p>
              </div>
              <button className="relative w-12 h-6 bg-gray-600 rounded-full transition-all duration-300">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};