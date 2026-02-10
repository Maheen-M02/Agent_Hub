import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_GEMINI_API_KEY || 'AIzaSyCS-0iCiE5WJTzEJ9IJO8GjomLy6l6nEGI';

if (!apiKey) {
  console.warn('Google Gemini API key not found');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function getChatResponse(message: string, agents: any[], conversationHistory: any[] = []) {
  if (!genAI) {
    return "I'm sorry, the AI assistant is currently unavailable. Please check the API configuration.";
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

  const agentList = agents.map(agent => 
    `- ${agent.name}: ${agent.description} (Category: ${agent.category})`
  ).join('\n');

  const conversationContext = conversationHistory.length > 0 
    ? `\n\nConversation History:\n${conversationHistory.map(msg => `${msg.type}: ${msg.content}`).join('\n')}\n`
    : '';

  const prompt = `You are an expert AI assistant for an AI Agent Hub platform. You help users in multiple ways:

1. **Find existing agents** - Recommend agents from the available list
2. **Create new agents** - Provide detailed guidance on building custom agents
3. **Technical support** - Help with n8n workflows, APIs, integrations
4. **General AI assistance** - Answer any questions about AI, automation, or technology

Available Agents:
${agentList}

## Agent Creation Guidelines:
When users want to create agents, provide:
- **Step-by-step instructions** for building the workflow
- **Code examples** (JavaScript, Python, etc.)
- **n8n workflow suggestions** with specific nodes to use
- **API integration examples**
- **Best practices** for input/output handling
- **Testing strategies**

## Technical Expertise:
You can help with:
- n8n workflow design and optimization
- API integrations and webhook setup
- JavaScript/Python code for custom functions
- Database queries and data processing
- AI model integration (OpenAI, Gemini, etc.)
- Authentication and security best practices

${conversationContext}

User Question: ${message}

Provide a comprehensive, helpful response that:
1. **Directly answers** the user's question
2. **Suggests relevant existing agents** if applicable
3. **Provides creation guidance** if they want to build something new
4. **Includes code examples** or technical details when relevant
5. **Offers next steps** or follow-up suggestions
6. **Uses a friendly, expert tone**

If the user wants to create an agent:
- Ask clarifying questions about their specific needs
- Provide detailed technical guidance
- Suggest the best tools and approaches
- Include example code or workflow configurations

Format your response with clear sections using markdown headers when appropriate.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return "I'm sorry, I'm having trouble processing your request right now. Please try again or browse our available agents in the meantime.";
  }
}