import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_GEMINI_API_KEY || 'AIzaSyA2OLm2A1OK3wuxgKPmnspU-ou4_HpincE';
  process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('Google Gemini API key not found');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function getChatResponse(message: string, agents: any[]) {
  if (!genAI) {
    return "I'm sorry, the AI assistant is currently unavailable. Please check the API configuration.";
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

  const agentList = agents.map(agent => 
    `- ${agent.name}: ${agent.description} (Category: ${agent.category})`
  ).join('\n');

  const prompt = `You are an AI assistant for an AI Agent Hub platform. Help users find the right AI agents for their needs.

Available Agents:
${agentList}

User Question: ${message}

Please provide a helpful response that:
1. Suggests the most relevant agents based on the user's needs
2. Explains why each suggested agent would be useful
3. Keeps the response concise and actionable
4. Uses a friendly, professional tone

If no agents match perfectly, suggest the closest alternatives and explain what they can do instead.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return "I'm sorry, I'm having trouble processing your request right now. Please try browsing our available agents or contact support.";
  }
}