import React from 'react';
import { CheckCircle2, Clock, TrendingUp, Calendar, Dumbbell, BookOpen, Users, Zap, Activity, Target, Award, Star, Flame, Calendar as CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';
import { useLevel } from '../contexts/LevelContext';
import { useStreak } from '../contexts/StreakContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { getUserTasks, getUserWorkouts } = useTask();
  const { userLevel, achievements, getLevelProgress, getRecentActivity } = useLevel();
  const { streakData, getActivityCalendar } = useStreak();
  const navigate = useNavigate();

  const userTasks = getUserTasks(user?.id || '');
  const userWorkouts = getUserWorkouts(user?.id || '');
  
  const completedTasks = userTasks.filter(task => task.completed).length;
  const totalTasks = userTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const levelProgress = getLevelProgress();
  const recentActivity = getRecentActivity();
  const unlockedAchievements = achievements.filter(a => a.unlocked);

  // Get streak information
  const currentStreak = streakData.currentStreak;
  const longestStreak = streakData.longestStreak;
  const totalActiveDays = streakData.totalActiveDays;

  // Calculate this week's workouts
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const thisWeekWorkouts = userWorkouts.filter(w => {
    const workoutDate = new Date(w.date);
    return workoutDate >= weekAgo;
  }).length;

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
      value: thisWeekWorkouts.toString(),
      change: '+2 from last week',
      changeType: 'positive',
      icon: Dumbbell,
      color: 'from-purple-500 to-pink-600',
      glowColor: 'rgba(139, 92, 246, 0.3)'
    },
    {
      name: 'Active Streak',
      nameAr: 'الإنجاز المتتالي',
      value: `${currentStreak} days`,
      change: `Best: ${longestStreak} days`,
      changeType: 'positive',
      icon: Flame,
      color: 'from-orange-400 to-red-600',
      glowColor: 'rgba(251, 146, 60, 0.3)'
    },
    {
      name: 'System Level',
      nameAr: 'مستوى النظام',
      value: userLevel.level.toString(),
      change: `${userLevel.currentXP}/${userLevel.currentXP + userLevel.xpToNextLevel} XP`,
      changeType: 'positive',
      icon: Zap,
      color: 'from-yellow-400 to-orange-600',
      glowColor: 'rgba(251, 191, 36, 0.3)'
    }
  ];

  const recentTasks = userTasks.slice(0, 5);

  // Quick action handlers
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'tasks':
        navigate('/tasks');
        break;
      case 'workouts':
        navigate('/workouts');
        break;
      case 'journal':
        navigate('/journal');
        break;
      case 'chat':
        navigate('/chat');
        break;
      default:
        break;
    }
  };

  // Get recent streak activities
  const getRecentStreakActivities = () => {
    const recent = streakData.streakHistory
      .slice(-7) // Last 7 days
      .reverse() // Most recent first
      .map(entry => ({
        date: entry.date,
        activities: entry.activities,
        dayName: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' })
      }));
    return recent;
  };

  const recentStreakActivities = getRecentStreakActivities();

  return (
    <div className="space-y-4 lg:space-y-8">
      {/* Welcome Section with Level Info */}
      <div className="cyber-card rounded-xl lg:rounded-2xl p-4 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-cyan-900/50"></div>
        <div className="absolute inset-0 holographic opacity-20"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between relative z-10">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl lg:text-4xl font-orbitron font-bold mb-2 lg:mb-4 glitch cyber-text-glow" data-text={`NEXUS SYSTEM ONLINE`}>
              NEXUS SYSTEM ONLINE
            </h1>
            <p className="text-cyan-400 text-base lg:text-lg font-rajdhani mb-1 lg:mb-2">
              USER: {user?.name?.toUpperCase()} • STATUS: ACTIVE • LEVEL: {userLevel.level}
            </p>
            <p className="text-purple-400 font-rajdhani text-sm lg:text-base mb-2">
              RANK: {userLevel.title.toUpperCase()} • XP: {userLevel.totalXP} • STREAK: {currentStreak} DAYS
            </p>
            <div className="w-full lg:w-96 cyber-progress h-2 lg:h-3 rounded-full mb-2">
              <div 
                className="cyber-progress-bar h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-600"
                style={{ width: `${levelProgress}%` }}
              ></div>
            </div>
            <p className="text-xs lg:text-sm text-cyan-400 font-rajdhani">
              {userLevel.xpToNextLevel} XP to next level
            </p>
            <div className="mt-3 lg:mt-6" dir="rtl">
              <h2 className="text-lg lg:text-xl font-rajdhani font-semibold text-cyan-400">مرحباً بعودتك، {user?.name?.split(' ')[0]}</h2>
              <p className="text-purple-400 font-rajdhani text-sm lg:text-base">المستوى {userLevel.level} • {userLevel.titleAr} • الإنجاز المتتالي: {currentStreak} أيام</p>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-24 lg:w-32 h-24 lg:h-32 cyber-card rounded-full flex items-center justify-center neon-glow relative">
              <Activity className="w-12 lg:w-16 h-12 lg:h-16 text-cyan-400 animate-pulse" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-600 rounded-full flex items-center justify-center text-xs font-orbitron font-bold text-white">
                {userLevel.level}
              </div>
              {currentStreak > 0 && (
                <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-r from-orange-400 to-red-600 rounded-full flex items-center justify-center text-xs font-orbitron font-bold text-white">
                  <Flame className="w-4 h-4" />
                </div>
              )}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
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

        {/* Achievements */}
        <div className="cyber-card rounded-lg lg:rounded-xl p-4 lg:p-6 relative">
          <div className="absolute inset-0 animated-border rounded-lg lg:rounded-xl"></div>
          
          <div className="flex items-center justify-between mb-4 lg:mb-6 relative z-10">
            <h3 className="text-base lg:text-lg font-orbitron font-semibold text-cyan-400 neon-text">ACHIEVEMENTS</h3>
            <span className="text-xs lg:text-sm text-purple-400 font-rajdhani" dir="rtl">الإنجازات</span>
          </div>
          <div className="space-y-3 lg:space-y-4 relative z-10">
            {unlockedAchievements.slice(0, 4).map((achievement) => (
              <div key={achievement.id} className="flex items-center space-x-3 p-2 lg:p-3 rounded-lg bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30">
                <div className="text-lg">{achievement.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-rajdhani font-medium text-yellow-400 truncate">
                    {achievement.name.toUpperCase()}
                  </p>
                  <p className="text-xs text-orange-400 font-rajdhani">+{achievement.xpReward} XP</p>
                </div>
                <Award className="w-3 lg:w-4 h-3 lg:h-4 text-yellow-400" />
              </div>
            ))}
            {unlockedAchievements.length === 0 && (
              <div className="text-center py-4">
                <Star className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400 font-rajdhani">Complete tasks to unlock achievements</p>
              </div>
            )}
          </div>
        </div>

        {/* Streak Activity */}
        <div className="cyber-card rounded-lg lg:rounded-xl p-4 lg:p-6 relative">
          <div className="absolute inset-0 animated-border rounded-lg lg:rounded-xl"></div>
          
          <div className="flex items-center justify-between mb-4 lg:mb-6 relative z-10">
            <h3 className="text-base lg:text-lg font-orbitron font-semibold text-cyan-400 neon-text">STREAK ACTIVITY</h3>
            <span className="text-xs lg:text-sm text-purple-400 font-rajdhani" dir="rtl">نشاط الإنجاز</span>
          </div>
          
          {/* Streak Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4 relative z-10">
            <div className="text-center p-2 cyber-card rounded-lg bg-orange-900/20 border border-orange-500/30">
              <div className="text-lg font-orbitron font-bold text-orange-400">{currentStreak}</div>
              <div className="text-xs text-orange-300 font-rajdhani">CURRENT</div>
            </div>
            <div className="text-center p-2 cyber-card rounded-lg bg-red-900/20 border border-red-500/30">
              <div className="text-lg font-orbitron font-bold text-red-400">{longestStreak}</div>
              <div className="text-xs text-red-300 font-rajdhani">BEST</div>
            </div>
            <div className="text-center p-2 cyber-card rounded-lg bg-purple-900/20 border border-purple-500/30">
              <div className="text-lg font-orbitron font-bold text-purple-400">{totalActiveDays}</div>
              <div className="text-xs text-purple-300 font-rajdhani">TOTAL</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-2 relative z-10">
            {recentStreakActivities.slice(0, 5).map((activity, index) => (
              <div key={activity.date} className="flex items-center justify-between p-2 rounded-lg hover:bg-purple-900/20 transition-all duration-300">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-3 h-3 text-cyan-400" />
                  <span className="text-xs font-rajdhani text-cyan-400">{activity.dayName}</span>
                </div>
                <div className="flex space-x-1">
                  {activity.activities.map((activityType, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${
                      activityType === 'task' ? 'bg-blue-400' :
                      activityType === 'workout' ? 'bg-green-400' :
                      activityType === 'journal' ? 'bg-purple-400' : 'bg-gray-400'
                    }`} />
                  ))}
                </div>
              </div>
            ))}
            {recentStreakActivities.length === 0 && (
              <div className="text-center py-4">
                <Flame className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400 font-rajdhani">Complete activities to build your streak</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="cyber-card rounded-lg lg:rounded-xl p-4 lg:p-6 relative">
        <div className="absolute inset-0 animated-border rounded-lg lg:rounded-xl"></div>
        
        <h3 className="text-base lg:text-lg font-orbitron font-semibold text-cyan-400 neon-text mb-4 lg:mb-6 relative z-10">QUICK ACCESS</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 relative z-10">
          {[
            { 
              name: 'Add Task', 
              nameAr: 'إضافة مهمة', 
              icon: CheckCircle2, 
              color: 'from-blue-500 to-cyan-500', 
              xp: '+5 XP',
              action: 'tasks'
            },
            { 
              name: 'Log Workout', 
              nameAr: 'تسجيل تمرين', 
              icon: Dumbbell, 
              color: 'from-green-500 to-emerald-500', 
              xp: '+25 XP',
              action: 'workouts'
            },
            { 
              name: 'Write Journal', 
              nameAr: 'كتابة مذكرة', 
              icon: BookOpen, 
              color: 'from-purple-500 to-pink-500', 
              xp: '+20 XP',
              action: 'journal'
            },
            { 
              name: 'AI Assistant', 
              nameAr: 'المساعد الذكي', 
              icon: Target, 
              color: 'from-orange-500 to-red-500', 
              xp: '+2 XP',
              action: 'chat'
            }
          ].map((action) => (
            <button
              key={action.name}
              onClick={() => handleQuickAction(action.action)}
              className="cyber-btn flex flex-col items-center p-3 lg:p-6 rounded-lg transition-all duration-300 hover:neon-glow group focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <div className={`w-8 lg:w-12 h-8 lg:h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-2 lg:mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className="w-4 lg:w-6 h-4 lg:h-6 text-white" />
              </div>
              <span className="text-xs lg:text-sm font-rajdhani font-medium text-cyan-400 uppercase tracking-wide text-center">{action.name}</span>
              <span className="text-xs text-purple-400 mt-1 font-rajdhani hidden lg:block" dir="rtl">{action.nameAr}</span>
              <span className="text-xs text-yellow-400 mt-1 font-rajdhani">{action.xp}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};