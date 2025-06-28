import React from 'react';
import { CheckCircle2, Clock, TrendingUp, Calendar, Dumbbell, BookOpen, Users, Zap, Activity, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { getUserTasks, getUserWorkouts } = useTask();

  const userTasks = getUserTasks(user?.id || '');
  const userWorkouts = getUserWorkouts(user?.id || '');
  
  const completedTasks = userTasks.filter(task => task.completed).length;
  const totalTasks = userTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    {
      name: 'Tasks Completed',
      nameAr: 'المهام المكتملة',
      value: `${completedTasks}/${totalTasks}`,
      change: `${completionRate}%`,
      changeType: 'positive',
      icon: CheckCircle2,
      color: 'from-cyan-400 to-blue-600',
      glowColor: 'rgba(0, 255, 255, 0.3)'
    },
    {
      name: 'Workouts This Week',
      nameAr: 'التمارين هذا الأسبوع',
      value: userWorkouts.length.toString(),
      change: '+2 from last week',
      changeType: 'positive',
      icon: Dumbbell,
      color: 'from-purple-500 to-pink-600',
      glowColor: 'rgba(139, 92, 246, 0.3)'
    },
    {
      name: 'Active Streak',
      nameAr: 'الإنجاز المتتالي',
      value: '7 days',
      change: 'Keep it up!',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'from-green-400 to-emerald-600',
      glowColor: 'rgba(34, 197, 94, 0.3)'
    },
    {
      name: 'System Level',
      nameAr: 'مستوى النظام',
      value: '42',
      change: '+3 this week',
      changeType: 'positive',
      icon: Zap,
      color: 'from-yellow-400 to-orange-600',
      glowColor: 'rgba(251, 191, 36, 0.3)'
    }
  ];

  const recentTasks = userTasks.slice(0, 5);
  const upcomingTasks = userTasks.filter(task => !task.completed && task.dueDate).slice(0, 3);

  return (
    <div className="space-y-4 lg:space-y-8">
      {/* Welcome Section */}
      <div className="cyber-card rounded-xl lg:rounded-2xl p-4 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-cyan-900/50"></div>
        <div className="absolute inset-0 holographic opacity-20"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between relative z-10">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl lg:text-4xl font-orbitron font-bold mb-2 lg:mb-4 glitch cyber-text-glow" data-text={`NEXUS SYSTEM ONLINE`}>
              NEXUS SYSTEM ONLINE
            </h1>
            <p className="text-cyan-400 text-base lg:text-lg font-rajdhani mb-1 lg:mb-2">
              USER: {user?.name?.toUpperCase()} • STATUS: ACTIVE
            </p>
            <p className="text-purple-400 font-rajdhani text-sm lg:text-base">
              PENDING OPERATIONS: {userTasks.filter(t => !t.completed).length}
            </p>
            <div className="mt-3 lg:mt-6" dir="rtl">
              <h2 className="text-lg lg:text-xl font-rajdhani font-semibold text-cyan-400">مرحباً بعودتك، {user?.name?.split(' ')[0]}</h2>
              <p className="text-purple-400 font-rajdhani text-sm lg:text-base">لديك {userTasks.filter(t => !t.completed).length} مهام معلقة اليوم</p>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-24 lg:w-32 h-24 lg:h-32 cyber-card rounded-full flex items-center justify-center neon-glow">
              <Activity className="w-12 lg:w-16 h-12 lg:h-16 text-cyan-400 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        {stats.map((stat, index) => (
          <div key={stat.name} className="cyber-card rounded-lg lg:rounded-xl p-3 lg:p-6 relative overflow-hidden group hover:neon-glow transition-all duration-300">
            <div className="absolute inset-0 animated-border rounded-lg lg:rounded-xl"></div>
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between relative z-10">
              <div className="mb-2 lg:mb-0">
                <p className="text-xs lg:text-sm font-rajdhani font-medium text-purple-400 uppercase tracking-wide">{stat.name}</p>
                <p className="text-xs text-cyan-400 mt-1 font-rajdhani hidden lg:block" dir="rtl">{stat.nameAr}</p>
              </div>
              <div className={`w-8 lg:w-12 h-8 lg:h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center relative mb-2 lg:mb-0`}
                   style={{ boxShadow: `0 0 20px ${stat.glowColor}` }}>
                <stat.icon className="w-4 lg:w-6 h-4 lg:h-6 text-white" />
              </div>
            </div>
            <div className="mt-2 lg:mt-4 relative z-10">
              <p className="text-xl lg:text-3xl font-orbitron font-bold text-cyan-400 neon-text">{stat.value}</p>
              <p className={`text-xs lg:text-sm font-rajdhani mt-1 ${stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
        {/* Recent Tasks */}
        <div className="cyber-card rounded-lg lg:rounded-xl p-4 lg:p-6 relative">
          <div className="absolute inset-0 animated-border rounded-lg lg:rounded-xl"></div>
          
          <div className="flex items-center justify-between mb-4 lg:mb-6 relative z-10">
            <h3 className="text-base lg:text-lg font-orbitron font-semibold text-cyan-400 neon-text">RECENT OPERATIONS</h3>
            <span className="text-xs lg:text-sm text-purple-400 font-rajdhani" dir="rtl">المهام الحديثة</span>
          </div>
          <div className="space-y-3 lg:space-y-4 relative z-10">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center space-x-3 p-2 lg:p-3 rounded-lg hover:bg-purple-900/20 transition-all duration-300">
                <div className={`w-2 lg:w-3 h-2 lg:h-3 rounded-full ${
                  task.completed ? 'bg-green-400 animate-pulse' : 
                  task.priority === 'high' ? 'bg-red-400 animate-pulse' :
                  task.priority === 'medium' ? 'bg-yellow-400 animate-pulse' : 'bg-gray-400'
                }`} style={{ boxShadow: '0 0 10px currentColor' }} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs lg:text-sm font-rajdhani font-medium truncate ${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                    {task.title.toUpperCase()}
                  </p>
                  <p className="text-xs text-purple-400 font-rajdhani">{task.category.toUpperCase()}</p>
                </div>
                {task.completed && <CheckCircle2 className="w-3 lg:w-4 h-3 lg:h-4 text-green-400" />}
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="cyber-card rounded-lg lg:rounded-xl p-4 lg:p-6 relative">
          <div className="absolute inset-0 animated-border rounded-lg lg:rounded-xl"></div>
          
          <div className="flex items-center justify-between mb-4 lg:mb-6 relative z-10">
            <h3 className="text-base lg:text-lg font-orbitron font-semibold text-cyan-400 neon-text">SYSTEM STATUS</h3>
            <span className="text-xs lg:text-sm text-purple-400 font-rajdhani" dir="rtl">حالة النظام</span>
          </div>
          <div className="space-y-3 lg:space-y-4 relative z-10">
            {[
              { label: 'CPU USAGE', value: 45, color: 'bg-cyan-400' },
              { label: 'MEMORY', value: 67, color: 'bg-purple-400' },
              { label: 'NETWORK', value: 89, color: 'bg-green-400' },
              { label: 'STORAGE', value: 23, color: 'bg-yellow-400' }
            ].map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs lg:text-sm font-rajdhani text-purple-400">{item.label}</span>
                  <span className="text-xs lg:text-sm font-orbitron text-cyan-400">{item.value}%</span>
                </div>
                <div className="cyber-progress h-1 lg:h-2 rounded-full">
                  <div 
                    className={`cyber-progress-bar h-full rounded-full ${item.color}`}
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="cyber-card rounded-lg lg:rounded-xl p-4 lg:p-6 relative">
        <div className="absolute inset-0 animated-border rounded-lg lg:rounded-xl"></div>
        
        <h3 className="text-base lg:text-lg font-orbitron font-semibold text-cyan-400 neon-text mb-4 lg:mb-6 relative z-10">QUICK ACCESS</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 relative z-10">
          {[
            { name: 'Add Task', nameAr: 'إضافة مهمة', icon: CheckCircle2, color: 'from-blue-500 to-cyan-500' },
            { name: 'Log Workout', nameAr: 'تسجيل تمرين', icon: Dumbbell, color: 'from-green-500 to-emerald-500' },
            { name: 'Write Journal', nameAr: 'كتابة مذكرة', icon: BookOpen, color: 'from-purple-500 to-pink-500' },
            { name: 'AI Assistant', nameAr: 'المساعد الذكي', icon: Target, color: 'from-orange-500 to-red-500' }
          ].map((action) => (
            <button
              key={action.name}
              className="cyber-btn flex flex-col items-center p-3 lg:p-6 rounded-lg transition-all duration-300 hover:neon-glow group"
            >
              <div className={`w-8 lg:w-12 h-8 lg:h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-2 lg:mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className="w-4 lg:w-6 h-4 lg:h-6 text-white" />
              </div>
              <span className="text-xs lg:text-sm font-rajdhani font-medium text-cyan-400 uppercase tracking-wide text-center">{action.name}</span>
              <span className="text-xs text-purple-400 mt-1 font-rajdhani hidden lg:block" dir="rtl">{action.nameAr}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};