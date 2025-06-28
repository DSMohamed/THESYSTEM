import { useState, useCallback, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  language: 'en' | 'ar';
}

export const useGeminiChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI assistant powered by Google Gemini. I can help you with tasks, workout planning, goal setting, and general conversation. I also speak Arabic fluently. How can I assist you today?',
      isUser: false,
      timestamp: new Date(),
      language: 'en'
    },
    {
      id: '2',
      content: 'مرحباً! أنا مساعدك الذكي المدعوم بـ Google Gemini. يمكنني مساعدتك في المهام، تخطيط التمارين، وضع الأهداف، والمحادثة العامة. كيف يمكنني مساعدتك اليوم؟',
      isUser: false,
      timestamp: new Date(),
      language: 'ar'
    }
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();
  const { getUserTasks, getUserWorkouts, addTask, addWorkout } = useTask();

  // Load chat history from localStorage on mount
  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`geminiChatHistory_${user.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved).map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) }));
          setMessages(parsed);
        } catch {
          // ignore
        }
      }
    }
  }, [user?.id]);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`geminiChatHistory_${user.id}`,
        JSON.stringify(messages.map(m => ({ ...m, timestamp: m.timestamp.toISOString() }))));
    }
  }, [messages, user?.id]);

  const sendMessage = useCallback(async (content: string, language: 'en' | 'ar') => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
      language
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Prepare user context
      const userTasks = getUserTasks(user?.id || '');
      const userWorkouts = getUserWorkouts(user?.id || '');
      const userContext = {
        name: user?.name,
        totalTasks: userTasks.length,
        completedTasks: userTasks.filter(t => t.completed).length,
        recentWorkouts: userWorkouts.slice(0, 3),
        language
      };

      // Prepare chat history for Gemini
      const chatHistory = [...messages, userMessage].map(m => ({
        role: m.isUser ? 'user' as 'user' : 'assistant' as 'assistant',
        content: m.content
      }));

      // Get AI response
      const aiResponse = await geminiService.generateResponse(content, language, userContext, chatHistory);

      // Check for add task/workout command
      const addCommand = geminiService.parseAddCommand(aiResponse);
      if (addCommand && user) {
        if (addCommand.type === 'task') {
          addTask({
            title: addCommand.data,
            description: '',
            priority: 'medium',
            category: 'general',
            dueDate: '',
            completed: false,
            userId: user.id
          });
        } else if (addCommand.type === 'workout') {
          addWorkout({
            name: addCommand.data,
            exercises: [],
            duration: 30,
            date: new Date().toISOString().split('T')[0],
            notes: '',
            userId: user.id
          });
        }
      }

      // If the user asked for a workout plan, auto-add it as a workout
      if (/workout plan|خطة تمرين|create a workout plan|أنشئ لي خطة تمرين/i.test(content) && user) {
        addWorkout({
          name: language === 'ar' ? 'خطة تمرين' : 'Workout Plan',
          exercises: [],
          duration: 30,
          date: new Date().toISOString().split('T')[0],
          notes: aiResponse,
          userId: user.id
        });
      }

      // Add AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
        language
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: language === 'en'
          ? 'I apologize, but I\'m having trouble responding right now. Please try again.'
          : 'أعتذر، لكنني أواجه مشكلة في الرد الآن. يرجى المحاولة مرة أخرى.',
        isUser: false,
        timestamp: new Date(),
        language
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [user, getUserTasks, getUserWorkouts, addTask, addWorkout, messages]);

  const generateTaskSuggestions = useCallback(async (language: 'en' | 'ar') => {
    const userTasks = getUserTasks(user?.id || '');
    return await geminiService.generateTaskSuggestions(userTasks, language);
  }, [user, getUserTasks]);

  const generateWorkoutPlan = useCallback(async (preferences: any, language: 'en' | 'ar') => {
    return await geminiService.generateWorkoutPlan(preferences, language);
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    generateTaskSuggestions,
    generateWorkoutPlan
  };
};