import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyAj0iOfkTVkFQDZ5eOaOz1gkFx38yGpTts';
const genAI = new GoogleGenerativeAI(API_KEY);

export class GeminiService {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });
  }

  async generateResponse(message: string, language: 'en' | 'ar', userContext?: any, chatHistory?: { role: 'user' | 'assistant', content: string }[]): Promise<string> {
    try {
      const systemPrompt = this.getSystemPrompt(language, userContext, chatHistory);
      const fullPrompt = `${systemPrompt}\n\nUser message: ${message}`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      return this.getFallbackResponse(language);
    }
  }

  private getSystemPrompt(language: 'en' | 'ar', userContext?: any, chatHistory?: { role: 'user' | 'assistant', content: string }[]): string {
    let historyBlock = '';
    if (chatHistory && chatHistory.length > 0) {
      historyBlock = '\n\nRecent conversation history:';
      chatHistory.slice(-8).forEach(msg => {
        historyBlock += `\n${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`;
      });
    }
    const basePrompt = {
      en: `You are a helpful AI assistant for a daily task management and fitness app. You help users with:
- Task planning and organization
- Workout routines and fitness advice
- Goal setting and motivation
- General conversation and support
- Personal productivity tips

Be encouraging, supportive, and provide practical advice. Keep responses concise but helpful.
The user's current context: ${userContext ? JSON.stringify(userContext) : 'No specific context'}${historyBlock}`,

      ar: `أنت مساعد ذكي مفيد لتطبيق إدارة المهام اليومية واللياقة البدنية. تساعد المستخدمين في:
- تخطيط وتنظيم المهام
- روتين التمارين ونصائح اللياقة البدنية
- وضع الأهداف والتحفيز
- المحادثة العامة والدعم
- نصائح الإنتاجية الشخصية

كن مشجعاً وداعماً وقدم نصائح عملية. اجعل الردود مختصرة ولكن مفيدة.
السياق الحالي للمستخدم: ${userContext ? JSON.stringify(userContext) : 'لا يوجد سياق محدد'}${historyBlock}`
    };

    return basePrompt[language];
  }

  private getFallbackResponse(language: 'en' | 'ar'): string {
    const fallbacks = {
      en: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment. In the meantime, remember that consistency is key to achieving your goals!",
      ar: "أعتذر، أواجه مشكلة في الاتصال الآن. يرجى المحاولة مرة أخرى بعد قليل. في هذه الأثناء، تذكر أن الثبات هو مفتاح تحقيق أهدافك!"
    };

    return fallbacks[language];
  }

  async generateTaskSuggestions(userTasks: any[], language: 'en' | 'ar'): Promise<string[]> {
    try {
      const prompt = language === 'en'
        ? `Based on these existing tasks: ${JSON.stringify(userTasks)}, suggest 3 new productive tasks for today. Return only the task titles, one per line.`
        : `بناءً على هذه المهام الموجودة: ${JSON.stringify(userTasks)}، اقترح 3 مهام جديدة ومفيدة لليوم. أرجع عناوين المهام فقط، واحدة في كل سطر.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().split('\n').filter(line => line.trim()).slice(0, 3);
    } catch (error) {
      console.error('Task suggestions error:', error);
      return language === 'en'
        ? ['Review daily goals', 'Plan tomorrow\'s schedule', 'Take a 10-minute break']
        : ['مراجعة الأهداف اليومية', 'تخطيط جدول الغد', 'أخذ استراحة 10 دقائق'];
    }
  }

  async generateWorkoutPlan(userPreferences: any, language: 'en' | 'ar'): Promise<string> {
    try {
      const prompt = language === 'en'
        ? `Create a workout plan based on these preferences: ${JSON.stringify(userPreferences)}. Include exercises, sets, reps, and rest times.`
        : `أنشئ خطة تمرين بناءً على هذه التفضيلات: ${JSON.stringify(userPreferences)}. اشمل التمارين والمجموعات والتكرارات وأوقات الراحة.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Workout plan error:', error);
      return language === 'en'
        ? 'I recommend starting with basic bodyweight exercises: 3 sets of push-ups (8-12 reps), squats (12-15 reps), and planks (30-60 seconds). Rest 60-90 seconds between sets.'
        : 'أنصح بالبدء بتمارين وزن الجسم الأساسية: 3 مجموعات من تمارين الضغط (8-12 تكرار)، القرفصاء (12-15 تكرار)، واللوح الخشبي (30-60 ثانية). راحة 60-90 ثانية بين المجموعات.';
    }
  }

  // Utility to parse AI response for add task/workout commands
  parseAddCommand(aiResponse: string): { type: 'task' | 'workout', data: any } | null {
    // English and Arabic triggers
    const taskRegex = /add (a )?task:? (.+)/i;
    const workoutRegex = /add (a )?workout:? (.+)/i;
    const arTaskRegex = /أضف مهمة:? (.+)/i;
    const arWorkoutRegex = /أضف تمرين:? (.+)/i;
    let match;
    if ((match = aiResponse.match(taskRegex)) || (match = aiResponse.match(arTaskRegex))) {
      return { type: 'task', data: match[2] || match[1] };
    }
    if ((match = aiResponse.match(workoutRegex)) || (match = aiResponse.match(arWorkoutRegex))) {
      return { type: 'workout', data: match[2] || match[1] };
    }
    return null;
  }
}

export const geminiService = new GeminiService();