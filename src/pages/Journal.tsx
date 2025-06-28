import React, { useState } from 'react';
import { Plus, Calendar, Lock, Search, Edit3, Trash2, Save, BookOpen, Zap, Target, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  isPrivate: boolean;
  tags: string[];
  userId: string;
}

export const Journal: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: '1',
      title: 'Great Workout Session',
      content: 'Had an amazing workout today. Completed all my sets with proper form and felt really strong. The new routine is working well for me. I\'m seeing improvements in my strength and endurance.',
      date: '2025-01-08',
      mood: 'great',
      isPrivate: false,
      tags: ['workout', 'fitness', 'progress'],
      userId: '1'
    },
    {
      id: '2',
      title: 'Personal Reflections',
      content: 'Today was a day of mixed emotions. I accomplished my main tasks but felt overwhelmed by the workload. Need to work on better time management and setting boundaries.',
      date: '2025-01-07',
      mood: 'okay',
      isPrivate: true,
      tags: ['personal', 'reflection', 'work'],
      userId: '1'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMood, setSelectedMood] = useState<'all' | JournalEntry['mood']>('all');

  const userEntries = entries.filter(entry => entry.userId === user?.id);

  const filteredEntries = userEntries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMood = selectedMood === 'all' || entry.mood === selectedMood;

    return matchesSearch && matchesMood;
  });

  // Calculate journal entry count and active streak
  const entryCount = userEntries.length;
  // Get unique dates with entries
  const entryDates = Array.from(new Set(userEntries.map(e => e.date))).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  let streak = 0;
  if (entryDates.length > 0) {
    let current = new Date(entryDates[0]);
    streak = 1;
    for (let i = 1; i < entryDates.length; i++) {
      const prev = new Date(entryDates[i]);
      const diff = (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
        current = prev;
      } else {
        break;
      }
    }
  }

  const moodEmojis = {
    great: '😄',
    good: '😊',
    okay: '😐',
    bad: '😞',
    terrible: '😢'
  };

  const moodColors = {
    great: 'bg-green-900/30 text-green-400 border-green-500/50',
    good: 'bg-blue-900/30 text-blue-400 border-blue-500/50',
    okay: 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50',
    bad: 'bg-orange-900/30 text-orange-400 border-orange-500/50',
    terrible: 'bg-red-900/30 text-red-400 border-red-500/50'
  };

  const handleAddEntry = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      date: formData.get('date') as string || new Date().toISOString().split('T')[0],
      mood: formData.get('mood') as JournalEntry['mood'],
      isPrivate: formData.has('isPrivate'),
      tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(Boolean),
      userId: user?.id || ''
    };

    setEntries(prev => [newEntry, ...prev]);
    setShowAddForm(false);
    e.currentTarget.reset();
  };

  const handleUpdateEntry = (id: string, updatedEntry: Partial<JournalEntry>) => {
    setEntries(prev => prev.map(entry =>
      entry.id === id ? { ...entry, ...updatedEntry } : entry
    ));
    setEditingEntry(null);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="cyber-card rounded-xl lg:rounded-2xl p-4 lg:p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-pink-900/50"></div>
        <div className="absolute inset-0 holographic opacity-20"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between relative z-10">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl lg:text-4xl font-orbitron font-bold mb-2 lg:mb-4 glitch cyber-text-glow" data-text="NEURAL JOURNAL SYSTEM">
              NEURAL JOURNAL SYSTEM
            </h1>
            <p className="text-cyan-400 text-base lg:text-lg font-rajdhani mb-1 lg:mb-2">
              MEMORY CORE • STATUS: ACTIVE
            </p>
            <p className="text-purple-400 font-rajdhani text-sm lg:text-base">
              ENTRIES: {entryCount} • STREAK: {streak} DAYS
            </p>
            <div className="mt-3 lg:mt-6" dir="rtl">
              <h2 className="text-lg lg:text-xl font-rajdhani font-semibold text-cyan-400">نظام المذكرات العصبية</h2>
              <p className="text-purple-400 font-rajdhani text-sm lg:text-base">المذكرات: {entryCount} • الإنجاز المتتالي: {streak} أيام</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden lg:block">
              <div className="w-20 lg:w-24 h-20 lg:h-24 cyber-card rounded-full flex items-center justify-center neon-glow">
                <BookOpen className="w-10 lg:w-12 h-10 lg:h-12 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="cyber-btn bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg hover:neon-glow transition-all duration-300 flex items-center space-x-2"
            >
              <Plus className="w-4 lg:w-5 h-4 lg:h-5" />
              <span className="font-rajdhani font-medium">NEW ENTRY</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        {[
          { name: 'Total Entries', nameAr: 'إجمالي المذكرات', value: entryCount, icon: BookOpen, color: 'from-purple-400 to-pink-600' },
          { name: 'Writing Streak', nameAr: 'إنجاز الكتابة', value: `${streak} days`, icon: Zap, color: 'from-cyan-400 to-blue-600' },
          { name: 'Private Entries', nameAr: 'المذكرات الخاصة', value: userEntries.filter(e => e.isPrivate).length, icon: Lock, color: 'from-orange-400 to-red-600' },
          { name: 'This Month', nameAr: 'هذا الشهر', value: userEntries.filter(e => new Date(e.date).getMonth() === new Date().getMonth()).length, icon: Calendar, color: 'from-green-400 to-emerald-600' }
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

      {/* Filters */}
      <div className="cyber-card rounded-xl p-4 lg:p-6 relative">
        <div className="absolute inset-0 animated-border rounded-xl"></div>
        
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 relative z-10">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-400" />
            <input
              type="text"
              placeholder="SEARCH MEMORIES..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cyber-input pl-10 pr-4 py-2 lg:py-3 w-full rounded-lg font-rajdhani placeholder:text-purple-400/50"
            />
          </div>

          {/* Mood Filter */}
          <select
            value={selectedMood}
            onChange={(e) => setSelectedMood(e.target.value as 'all' | JournalEntry['mood'])}
            className="cyber-input px-4 py-2 lg:py-3 rounded-lg font-rajdhani"
          >
            <option value="all">ALL MOODS</option>
            <option value="great">😄 GREAT</option>
            <option value="good">😊 GOOD</option>
            <option value="okay">😐 OKAY</option>
            <option value="bad">😞 BAD</option>
            <option value="terrible">😢 TERRIBLE</option>
          </select>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-3 lg:space-y-4">
        {filteredEntries.map((entry) => (
          <div key={entry.id} className="cyber-card rounded-xl p-4 lg:p-6 relative hover:neon-glow transition-all duration-300">
            <div className="absolute inset-0 animated-border rounded-xl"></div>
            
            {editingEntry === entry.id ? (
              <EditEntryForm
                entry={entry}
                onSave={(updatedEntry) => handleUpdateEntry(entry.id, updatedEntry)}
                onCancel={() => setEditingEntry(null)}
              />
            ) : (
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-orbitron font-semibold text-cyan-400 neon-text">{entry.title.toUpperCase()}</h3>
                      {entry.isPrivate && (
                        <div className="flex items-center space-x-1 text-orange-400">
                          <Lock className="w-4 h-4" />
                          <span className="text-sm font-rajdhani">CLASSIFIED</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-purple-400 mb-3 font-rajdhani">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${moodColors[entry.mood]}`}>
                        {moodEmojis[entry.mood]} {entry.mood.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingEntry(entry.id)}
                      className="cyber-btn p-2 rounded-lg text-cyan-400 hover:text-blue-400 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="cyber-btn p-2 rounded-lg text-cyan-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="cyber-card rounded-lg p-4 bg-purple-900/20 border border-purple-500/30 mb-4">
                  <p className="text-purple-100 font-rajdhani leading-relaxed">{entry.content}</p>
                </div>

                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-cyan-900/30 text-cyan-400 border border-cyan-500/50 rounded-full text-xs font-rajdhani font-medium"
                      >
                        #{tag.toUpperCase()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {filteredEntries.length === 0 && (
          <div className="text-center py-12 cyber-card rounded-xl">
            <BookOpen className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-orbitron font-medium text-cyan-400 mb-2">NO MEMORY ENTRIES FOUND</h3>
            <p className="text-purple-400 font-rajdhani">Initialize your first neural log!</p>
          </div>
        )}
      </div>

      {/* Add Entry Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="cyber-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <div className="absolute inset-0 animated-border rounded-2xl"></div>
            
            <h2 className="text-xl font-orbitron font-semibold text-cyan-400 mb-6 relative z-10 neon-text">NEW NEURAL ENTRY</h2>

            <form onSubmit={handleAddEntry} className="space-y-4 relative z-10">
              <div>
                <label className="block text-sm font-rajdhani font-medium text-purple-400 mb-2 uppercase tracking-wide">
                  Entry Title
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  className="cyber-input w-full px-4 py-3 rounded-lg font-rajdhani"
                  placeholder="What's on your neural network?"
                />
              </div>

              <div>
                <label className="block text-sm font-rajdhani font-medium text-purple-400 mb-2 uppercase tracking-wide">
                  Content
                </label>
                <textarea
                  name="content"
                  rows={8}
                  required
                  className="cyber-input w-full px-4 py-3 rounded-lg font-rajdhani"
                  placeholder="Write your thoughts..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-sm font-rajdhani font-medium text-purple-400 mb-2 uppercase tracking-wide">
                    Mood State
                  </label>
                  <select
                    name="mood"
                    className="cyber-input w-full px-4 py-3 rounded-lg font-rajdhani"
                  >
                    <option value="great">😄 GREAT</option>
                    <option value="good">😊 GOOD</option>
                    <option value="okay">😐 OKAY</option>
                    <option value="bad">😞 BAD</option>
                    <option value="terrible">😢 TERRIBLE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-rajdhani font-medium text-purple-400 mb-2 uppercase tracking-wide">
                  Tags (comma separated)
                </label>
                <input
                  name="tags"
                  type="text"
                  className="cyber-input w-full px-4 py-3 rounded-lg font-rajdhani"
                  placeholder="workout, personal, reflection"
                />
              </div>

              <div className="flex items-center">
                <input
                  name="isPrivate"
                  type="checkbox"
                  id="isPrivate"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="isPrivate" className="ml-2 block text-sm text-purple-400 font-rajdhani">
                  MARK AS CLASSIFIED ENTRY
                </label>
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
                  className="flex-1 cyber-btn bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-3 rounded-lg hover:neon-glow transition-all font-rajdhani font-medium"
                >
                  SAVE ENTRY
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Edit Entry Form Component
const EditEntryForm: React.FC<{
  entry: JournalEntry;
  onSave: (updatedEntry: Partial<JournalEntry>) => void;
  onCancel: () => void;
}> = ({ entry, onSave, onCancel }) => {
  const [title, setTitle] = useState(entry.title);
  const [content, setContent] = useState(entry.content);
  const [mood, setMood] = useState(entry.mood);
  const [isPrivate, setIsPrivate] = useState(entry.isPrivate);
  const [tags, setTags] = useState(entry.tags.join(', '));

  const handleSave = () => {
    onSave({
      title,
      content,
      mood,
      isPrivate,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean)
    });
  };

  return (
    <div className="space-y-4 relative z-10">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="cyber-input w-full px-4 py-3 rounded-lg font-orbitron font-semibold text-cyan-400"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
        className="cyber-input w-full px-4 py-3 rounded-lg font-rajdhani"
      />

      <div className="flex items-center space-x-4">
        <select
          value={mood}
          onChange={(e) => setMood(e.target.value as JournalEntry['mood'])}
          className="cyber-input px-3 py-2 rounded-lg font-rajdhani"
        >
          <option value="great">😄 GREAT</option>
          <option value="good">😊 GOOD</option>
          <option value="okay">😐 OKAY</option>
          <option value="bad">😞 BAD</option>
          <option value="terrible">😢 TERRIBLE</option>
        </select>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-purple-400 font-rajdhani">CLASSIFIED</span>
        </label>
      </div>

      <input
        type="text"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags (comma separated)"
        className="cyber-input w-full px-4 py-3 rounded-lg font-rajdhani"
      />

      <div className="flex space-x-2">
        <button
          onClick={handleSave}
          className="cyber-btn flex items-center space-x-1 px-4 py-2 bg-green-900/30 text-green-400 border border-green-500/50 rounded-lg hover:bg-green-900/50 transition-all font-rajdhani font-medium"
        >
          <Save className="w-4 h-4" />
          <span>SAVE</span>
        </button>
        <button
          onClick={onCancel}
          className="cyber-btn px-4 py-2 text-purple-400 border border-purple-500/50 rounded-lg hover:bg-purple-900/20 transition-all font-rajdhani font-medium"
        >
          CANCEL
        </button>
      </div>
    </div>
  );
};