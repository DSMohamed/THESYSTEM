import React, { useState } from 'react';
import { Plus, Clock, TrendingUp, Calendar, Play, Pause, RotateCcw, Dumbbell, Zap, Activity, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTask, WorkoutSession } from '../contexts/TaskContext';

export const Workouts: React.FC = () => {
  const { user } = useAuth();
  const { getUserWorkouts, addWorkout } = useTask();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutSession | null>(null);

  const userWorkouts = getUserWorkouts(user?.id || '');

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartWorkout = (workout: WorkoutSession) => {
    setCurrentWorkout(workout);
    setIsTimerRunning(true);
    setTimerSeconds(0);
  };

  const handleStopWorkout = () => {
    setIsTimerRunning(false);
    setCurrentWorkout(null);
    setTimerSeconds(0);
  };

  const workoutStats = {
    totalWorkouts: userWorkouts.length,
    totalTime: userWorkouts.reduce((acc, workout) => acc + workout.duration, 0),
    averageTime: userWorkouts.length > 0 ? Math.round(userWorkouts.reduce((acc, workout) => acc + workout.duration, 0) / userWorkouts.length) : 0,
    thisWeek: userWorkouts.filter(w => {
      const workoutDate = new Date(w.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return workoutDate >= weekAgo;
    }).length
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="cyber-card rounded-xl lg:rounded-2xl p-4 lg:p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/50 to-emerald-900/50"></div>
        <div className="absolute inset-0 holographic opacity-20"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between relative z-10">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl lg:text-4xl font-orbitron font-bold mb-2 lg:mb-4 glitch cyber-text-glow" data-text="FITNESS PROTOCOL SYSTEM">
              FITNESS PROTOCOL SYSTEM
            </h1>
            <p className="text-cyan-400 text-base lg:text-lg font-rajdhani mb-1 lg:mb-2">
              TRAINING CENTER • STATUS: OPERATIONAL
            </p>
            <p className="text-purple-400 font-rajdhani text-sm lg:text-base">
              SESSIONS: {workoutStats.totalWorkouts} • TOTAL TIME: {workoutStats.totalTime}MIN
            </p>
            <div className="mt-3 lg:mt-6" dir="rtl">
              <h2 className="text-lg lg:text-xl font-rajdhani font-semibold text-cyan-400">نظام بروتوكول اللياقة</h2>
              <p className="text-purple-400 font-rajdhani text-sm lg:text-base">الجلسات: {workoutStats.totalWorkouts} • الوقت الإجمالي: {workoutStats.totalTime} دقيقة</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden lg:block">
              <div className="w-20 lg:w-24 h-20 lg:h-24 cyber-card rounded-full flex items-center justify-center neon-glow">
                <Dumbbell className="w-10 lg:w-12 h-10 lg:h-12 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="cyber-btn bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg hover:neon-glow transition-all duration-300 flex items-center space-x-2"
            >
              <Plus className="w-4 lg:w-5 h-4 lg:h-5" />
              <span className="font-rajdhani font-medium">LOG WORKOUT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        {[
          { name: 'Total Workouts', nameAr: 'إجمالي التمارين', value: workoutStats.totalWorkouts, icon: TrendingUp, color: 'from-blue-400 to-cyan-600' },
          { name: 'Total Time', nameAr: 'إجمالي الوقت', value: `${workoutStats.totalTime}min`, icon: Clock, color: 'from-green-400 to-emerald-600' },
          { name: 'Average Time', nameAr: 'متوسط الوقت', value: `${workoutStats.averageTime}min`, icon: Target, color: 'from-purple-500 to-pink-600' },
          { name: 'This Week', nameAr: 'هذا الأسبوع', value: workoutStats.thisWeek, icon: Zap, color: 'from-orange-400 to-red-600' }
        ].map((stat, index) => (
          <div key={stat.name} className="cyber-card rounded-lg lg:rounded-xl p-3 lg:p-6 relative overflow-hidden group hover:neon-glow transition-all duration-300">
            <div className="absolute inset-0 animated-border rounded-lg lg:rounded-xl"></div>
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between relative z-10">
              <div className="mb-2 lg:mb-0">
                <p className="text-xs lg:text-sm font-rajdhani font-medium text-purple-400 uppercase tracking-wide">{stat.name}</p>
                <p className="text-xs text-cyan-400 mt-1 font-rajdhani hidden lg:block" dir="rtl">{stat.nameAr}</p>
              </div>
              <div className={`w-8 lg:w-12 h-8 lg:h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center relative mb-2 lg:mb-0 neon-glow`}>
                <stat.icon className="w-4 lg:w-6 h-4 lg:h-6 text-white" />
              </div>
            </div>
            <div className="mt-2 lg:mt-4 relative z-10">
              <p className="text-xl lg:text-3xl font-orbitron font-bold text-cyan-400 neon-text">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Active Workout Timer */}
      {currentWorkout && (
        <div className="cyber-card rounded-xl p-4 lg:p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-emerald-600/30"></div>
          <div className="absolute inset-0 holographic opacity-30"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h3 className="text-lg lg:text-xl font-orbitron font-semibold mb-1 text-cyan-400 neon-text">ACTIVE PROTOCOL</h3>
              <p className="text-green-300 font-rajdhani text-base lg:text-lg">{currentWorkout.name.toUpperCase()}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl lg:text-4xl font-orbitron font-bold text-cyan-400 neon-text">{formatTime(timerSeconds)}</div>
              <div className="flex items-center space-x-2 mt-2">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="cyber-btn p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-all duration-300 neon-glow"
                >
                  {isTimerRunning ? <Pause className="w-5 h-5 text-cyan-400" /> : <Play className="w-5 h-5 text-cyan-400" />}
                </button>
                <button
                  onClick={handleStopWorkout}
                  className="cyber-btn p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-all duration-300 neon-glow"
                >
                  <RotateCcw className="w-5 h-5 text-cyan-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workout History */}
      <div className="cyber-card rounded-xl p-4 lg:p-6 relative">
        <div className="absolute inset-0 animated-border rounded-xl"></div>
        
        <h3 className="text-lg lg:text-xl font-orbitron font-semibold text-cyan-400 neon-text mb-4 lg:mb-6 relative z-10">TRAINING HISTORY</h3>
        
        <div className="space-y-4 relative z-10">
          {userWorkouts.map((workout) => (
            <div key={workout.id} className="cyber-card rounded-lg p-4 lg:p-6 relative hover:neon-glow transition-all duration-300">
              <div className="absolute inset-0 animated-border rounded-lg"></div>
              
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div>
                  <h4 className="font-orbitron font-medium text-cyan-400 text-base lg:text-lg neon-text">{workout.name.toUpperCase()}</h4>
                  <p className="text-sm text-purple-400 font-rajdhani">
                    {new Date(workout.date).toLocaleDateString()} • {workout.duration} MINUTES
                  </p>
                </div>
                <button
                  onClick={() => handleStartWorkout(workout)}
                  className="cyber-btn flex items-center space-x-2 px-4 py-2 bg-green-900/30 text-green-400 border border-green-500/50 rounded-lg hover:bg-green-900/50 transition-all duration-300"
                >
                  <Play className="w-4 h-4" />
                  <span className="font-rajdhani font-medium">START</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 relative z-10">
                {workout.exercises.map((exercise) => (
                  <div key={exercise.id} className="cyber-card rounded-lg p-3 bg-purple-900/20 border border-purple-500/30">
                    <h5 className="font-rajdhani font-medium text-cyan-400 text-sm mb-2">{exercise.name.toUpperCase()}</h5>
                    <div className="text-xs text-purple-300 font-rajdhani space-y-1">
                      <div className="flex justify-between">
                        <span>SETS:</span>
                        <span className="text-cyan-400">{exercise.sets}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>REPS:</span>
                        <span className="text-cyan-400">{exercise.reps}</span>
                      </div>
                      {exercise.weight && (
                        <div className="flex justify-between">
                          <span>WEIGHT:</span>
                          <span className="text-cyan-400">{exercise.weight}kg</span>
                        </div>
                      )}
                      {exercise.restTime && (
                        <div className="flex justify-between">
                          <span>REST:</span>
                          <span className="text-cyan-400">{exercise.restTime}s</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {workout.notes && (
                <div className="cyber-card rounded-lg p-3 bg-blue-900/20 border border-blue-500/30 relative z-10">
                  <p className="text-sm text-blue-300 font-rajdhani">{workout.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {userWorkouts.length === 0 && (
          <div className="text-center py-12 relative z-10">
            <Activity className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-orbitron font-medium text-cyan-400 mb-2">NO TRAINING SESSIONS RECORDED</h3>
            <p className="text-purple-400 font-rajdhani">Initialize your first workout protocol!</p>
          </div>
        )}
      </div>

      {/* Add Workout Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="cyber-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <div className="absolute inset-0 animated-border rounded-2xl"></div>
            
            <h2 className="text-xl font-orbitron font-semibold text-cyan-400 mb-6 relative z-10 neon-text">LOG NEW TRAINING SESSION</h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              
              const newWorkout: Omit<WorkoutSession, 'id'> = {
                name: formData.get('name') as string,
                exercises: [
                  {
                    id: '1',
                    name: formData.get('exercise1') as string || 'Push-ups',
                    sets: parseInt(formData.get('sets1') as string) || 3,
                    reps: parseInt(formData.get('reps1') as string) || 10,
                    weight: formData.get('weight1') ? parseInt(formData.get('weight1') as string) : undefined,
                    restTime: formData.get('rest1') ? parseInt(formData.get('rest1') as string) : undefined
                  }
                ],
                duration: parseInt(formData.get('duration') as string) || 30,
                date: formData.get('date') as string || new Date().toISOString().split('T')[0],
                notes: formData.get('notes') as string,
                userId: user?.id || ''
              };

              addWorkout(newWorkout);
              setShowAddForm(false);
              e.currentTarget.reset();
            }} className="space-y-4 relative z-10">
              <div>
                <label className="block text-sm font-rajdhani font-medium text-purple-400 mb-2 uppercase tracking-wide">
                  Protocol Name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  className="cyber-input w-full px-4 py-3 rounded-lg font-rajdhani"
                  placeholder="e.g., UPPER BODY STRENGTH"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-rajdhani font-medium text-purple-400 mb-2 uppercase tracking-wide">
                    Duration (minutes)
                  </label>
                  <input
                    name="duration"
                    type="number"
                    min="1"
                    required
                    className="cyber-input w-full px-4 py-3 rounded-lg font-rajdhani"
                    placeholder="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-rajdhani font-medium text-purple-400 mb-2 uppercase tracking-wide">
                    Date
                  </label>
                  <input
                    name="date"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="cyber-input w-full px-4 py-3 rounded-lg font-rajdhani"
                  />
                </div>
              </div>

              {/* Exercise Section */}
              <div className="cyber-card rounded-lg p-4 border border-purple-500/30">
                <h3 className="text-lg font-orbitron font-medium text-cyan-400 mb-4 neon-text">EXERCISE PROTOCOL</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-rajdhani font-medium text-purple-400 mb-2 uppercase tracking-wide">
                      Exercise Name
                    </label>
                    <input
                      name="exercise1"
                      type="text"
                      required
                      className="cyber-input w-full px-4 py-3 rounded-lg font-rajdhani"
                      placeholder="e.g., PUSH-UPS"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-rajdhani font-medium text-purple-400 mb-2 uppercase tracking-wide">Sets</label>
                      <input
                        name="sets1"
                        type="number"
                        min="1"
                        required
                        className="cyber-input w-full px-4 py-3 rounded-lg font-rajdhani"
                        placeholder="3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-rajdhani font-medium text-purple-400 mb-2 uppercase tracking-wide">Reps</label>
                      <input
                        name="reps1"
                        type="number"
                        min="1"
                        required
                        className="cyber-input w-full px-4 py-3 rounded-lg font-rajdhani"
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-rajdhani font-medium text-purple-400 mb-2 uppercase tracking-wide">Weight (kg)</label>
                      <input
                        name="weight1"
                        type="number"
                        min="0"
                        step="0.5"
                        className="cyber-input w-full px-4 py-3 rounded-lg font-rajdhani"
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-rajdhani font-medium text-purple-400 mb-2 uppercase tracking-wide">Rest (sec)</label>
                      <input
                        name="rest1"
                        type="number"
                        min="0"
                        className="cyber-input w-full px-4 py-3 rounded-lg font-rajdhani"
                        placeholder="60"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-rajdhani font-medium text-purple-400 mb-2 uppercase tracking-wide">
                  Session Notes
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  className="cyber-input w-full px-4 py-3 rounded-lg font-rajdhani"
                  placeholder="Performance observations, modifications, etc."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 cyber-btn px-4 py-3 text-purple-400 border border-purple-500/50 rounded-lg hover:bg-purple-900/20 transition-all font-rajdhani font-medium"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 cyber-btn bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-lg hover:neon-glow transition-all font-rajdhani font-medium"
                >
                  LOG SESSION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};