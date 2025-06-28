import React, { useState } from 'react';
import { Plus, Calendar, Lock, Search, Edit3, Trash2, Save } from 'lucide-react';
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
    great: 'bg-green-100 text-green-800',
    good: 'bg-blue-100 text-blue-800',
    okay: 'bg-yellow-100 text-yellow-800',
    bad: 'bg-orange-100 text-orange-800',
    terrible: 'bg-red-100 text-red-800'
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journal</h1>
          <p className="text-gray-600 mt-1">Your private space for thoughts and reflections</p>
          <p className="text-sm text-gray-500 mt-1" dir="rtl">مساحتك الخاصة للأفكار والتأملات</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Entry</span>
        </button>
      </div>

      {/* Journal Summary */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-8 mb-4">
        <div className="flex items-center space-x-2 text-lg font-semibold text-purple-700">
          <span>Journal Entries:</span>
          <span className="text-purple-900">{entryCount}</span>
        </div>
        <div className="flex items-center space-x-2 text-lg font-semibold text-pink-700 mt-2 md:mt-0">
          <span>Active Streak:</span>
          <span className="text-pink-900">{streak} day{streak !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Mood Filter */}
          <select
            value={selectedMood}
            onChange={(e) => setSelectedMood(e.target.value as 'all' | JournalEntry['mood'])}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">All Moods</option>
            <option value="great">😄 Great</option>
            <option value="good">😊 Good</option>
            <option value="okay">😐 Okay</option>
            <option value="bad">😞 Bad</option>
            <option value="terrible">😢 Terrible</option>
          </select>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {filteredEntries.map((entry) => (
          <div key={entry.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            {editingEntry === entry.id ? (
              <EditEntryForm
                entry={entry}
                onSave={(updatedEntry) => handleUpdateEntry(entry.id, updatedEntry)}
                onCancel={() => setEditingEntry(null)}
              />
            ) : (
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{entry.title}</h3>
                      {entry.isPrivate && (
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Lock className="w-4 h-4" />
                          <span className="text-sm">Private</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${moodColors[entry.mood]}`}>
                        {moodEmojis[entry.mood]} {entry.mood}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingEntry(entry.id)}
                      className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">{entry.content}</p>

                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No journal entries found</h3>
            <p className="text-gray-600">Start writing your first journal entry!</p>
          </div>
        )}
      </div>

      {/* Add Entry Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">New Journal Entry</h2>

            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entry Title
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="What's on your mind?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  name="content"
                  rows={8}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Write your thoughts..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    name="date"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mood
                  </label>
                  <select
                    name="mood"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="great">😄 Great</option>
                    <option value="good">😊 Good</option>
                    <option value="okay">😐 Okay</option>
                    <option value="bad">😞 Bad</option>
                    <option value="terrible">😢 Terrible</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  name="tags"
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-900">
                  Mark as private entry
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all"
                >
                  Save Entry
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
    <div className="space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-semibold"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
      />

      <div className="flex items-center space-x-4">
        <select
          value={mood}
          onChange={(e) => setMood(e.target.value as JournalEntry['mood'])}
          className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="great">😄 Great</option>
          <option value="good">😊 Good</option>
          <option value="okay">😐 Okay</option>
          <option value="bad">😞 Bad</option>
          <option value="terrible">😢 Terrible</option>
        </select>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Private</span>
        </label>
      </div>

      <input
        type="text"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags (comma separated)"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
      />

      <div className="flex space-x-2">
        <button
          onClick={handleSave}
          className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save</span>
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};