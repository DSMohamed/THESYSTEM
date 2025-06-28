import React, { useState } from 'react';
import { Send, Bot, User, Globe, Volume2, Lightbulb, Dumbbell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGeminiChat } from '../hooks/useGeminiChat';

export const Chat: React.FC = () => {
  const { user } = useAuth();
  const { messages, isTyping, sendMessage, generateTaskSuggestions, generateWorkoutPlan } = useGeminiChat();
  const [inputValue, setInputValue] = useState('');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const messageContent = inputValue;
    setInputValue('');
    await sendMessage(messageContent, language);
  };

  const handleQuickAction = async (action: string) => {
    setInputValue(action);
    await sendMessage(action, language);
  };

  const handleTaskSuggestions = async () => {
    const suggestions = await generateTaskSuggestions(language);
    const suggestionText = language === 'en' 
      ? `Here are some task suggestions for today:\n${suggestions.join('\n')}`
      : `إليك بعض اقتراحات المهام لليوم:\n${suggestions.join('\n')}`;
    
    await sendMessage(suggestionText, language);
  };

  const handleWorkoutPlan = async () => {
    const preferences = {
      level: 'beginner',
      duration: 30,
      equipment: 'bodyweight'
    };
    
    const plan = await generateWorkoutPlan(preferences, language);
    await sendMessage(language === 'en' ? 'Create a workout plan for me' : 'أنشئ لي خطة تمرين', language);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">AI Assistant</h1>
              <p className="text-sm text-gray-600">Powered by Google Gemini</p>
              <p className="text-xs text-gray-500" dir="rtl">مدعوم بـ Google Gemini</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="flex items-center space-x-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm">{language === 'ar' ? 'EN' : 'عر'}</span>
            </button>

            {/* Quick Actions */}
            <button
              onClick={handleTaskSuggestions}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
              title={language === 'en' ? 'Get task suggestions' : 'احصل على اقتراحات المهام'}
            >
              <Lightbulb className="w-4 h-4" />
              <span className="text-sm hidden md:inline">
                {language === 'en' ? 'Tasks' : 'مهام'}
              </span>
            </button>

            <button
              onClick={handleWorkoutPlan}
              className="flex items-center space-x-1 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
              title={language === 'en' ? 'Get workout plan' : 'احصل على خطة تمرين'}
            >
              <Dumbbell className="w-4 h-4" />
              <span className="text-sm hidden md:inline">
                {language === 'en' ? 'Workout' : 'تمرين'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-2xl ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.isUser 
                  ? 'bg-blue-500' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-600'
              }`}>
                {message.isUser ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              {/* Message Content */}
              <div className={`px-4 py-3 rounded-2xl ${
                message.isUser 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-900 shadow-sm border border-gray-100'
              }`}>
                <div className={`${message.language === 'ar' ? 'text-right' : 'text-left'}`} dir={message.language === 'ar' ? 'rtl' : 'ltr'}>
                  {message.content.split('\n').map((line, index) => (
                    <p key={index} className={index > 0 ? 'mt-2' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
                <p className={`text-xs mt-2 ${
                  message.isUser ? 'text-blue-100' : 'text-gray-500'
                } ${message.language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3 max-w-2xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white shadow-sm border border-gray-100">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-6 bg-white border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={language === 'ar' ? 'اكتب رسالتك هنا...' : 'Type your message...'}
              className={`w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                language === 'ar' ? 'text-right' : 'text-left'
              }`}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
              disabled={isTyping}
            />
            {inputValue && (
              <button 
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        {/* Quick Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          {language === 'en' ? [
            "Help me plan my workout",
            "What should I focus on today?",
            "Give me motivation",
            "Analyze my progress",
            "Create a daily routine"
          ] : [
            "ساعدني في تخطيط تمريني",
            "على ماذا يجب أن أركز اليوم؟",
            "أعطني الدافع",
            "حلل تقدمي",
            "أنشئ روتيناً يومياً"
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(suggestion)}
              disabled={isTyping}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Status */}
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500">
            {isTyping 
              ? (language === 'en' ? 'AI is thinking...' : 'الذكي الاصطناعي يفكر...')
              : (language === 'en' ? 'Powered by Google Gemini AI' : 'مدعوم بـ Google Gemini AI')
            }
          </p>
        </div>
      </div>
    </div>
  );
};