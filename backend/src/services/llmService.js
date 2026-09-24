import Groq from 'groq-sdk';
import { mcpToolsDefinitions, executeMcpTool } from './mcpService.js';
import { searchKnowledge } from './ragService.js';

let groqClient = null;

const getGroqClient = () => {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ GROQ_API_KEY environment variable is not set!');
      return null;
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
};

const SKY_LOUNGE_SYSTEM_PROMPT = `You are the official AI Assistant for "Sky Lounge", a luxury fine-dining rooftop restaurant located in Deoband, UP.

STRICT GROUNDING & SAFETY RULES:
1. NEVER invent dishes, prices, ingredients, discounts, opening hours, or policies that are not present in your retrieved RAG knowledge or MCP tool outputs.
2. If asked about menu items or prices, retrieve actual menu data using RAG or the 'searchMenu' tool.
3. If asked about current user orders or reservations, check if the user is authenticated and call 'getMyOrders', 'getOrderStatus', or 'getMyReservations'.
4. Do NOT disclose private user data (orders, reservations, profiles) of other users.
5. Provide helpful, courteous, elegant, and concise natural-language answers formatted with markdown bullet points and emojis. Prices should always be formatted in INR (e.g. ₹270).
6. If an authenticated user wants to book a table, confirm the date, time, guest count, and name before calling 'createReservation'.`;

/**
 * Generate AI chat response with RAG knowledge and MCP tool calling loop
 */
export const generateAiChatResponse = async (userMessage, conversationHistory = [], contextUser = null) => {
  const groq = getGroqClient();

  // 1. Perform RAG Knowledge Retrieval for user query
  const ragDocs = await searchKnowledge(userMessage, 4);

  let ragContextText = '';
  if (ragDocs && ragDocs.length > 0) {
    ragContextText = `RETRIEVED SKY LOUNGE KNOWLEDGE:\n` + ragDocs.map((doc, idx) => `[${idx + 1}] ${doc.title}: ${doc.content}`).join('\n\n');
  }

  const userContextStatus = contextUser
    ? `AUTHENTICATED USER: Name: "${contextUser.name}", Email: "${contextUser.email}", Phone: "${contextUser.phone || 'N/A'}"`
    : `UNAUTHENTICATED GUEST USER (Logged out)`;

  const messages = [
    { role: 'system', content: `${SKY_LOUNGE_SYSTEM_PROMPT}\n\n${userContextStatus}\n\n${ragContextText}` },
    ...conversationHistory.slice(-8), // Maintain past conversation history context
    { role: 'user', content: userMessage },
  ];

  if (!groq) {
    // Fallback response if GROQ_API_KEY is not configured
    return {
      text: generateOfflineFallbackResponse(userMessage, ragDocs, contextUser),
      sources: ragDocs.map((d) => d.title),
      toolsUsed: [],
    };
  }

  const modelName = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const toolsUsed = [];

  let maxIterations = 3;
  while (maxIterations > 0) {
    maxIterations--;

    const completion = await groq.chat.completions.create({
      model: modelName,
      messages,
      tools: mcpToolsDefinitions,
      tool_choice: 'auto',
      temperature: 0.3,
      max_tokens: 1024,
    });

    const responseMessage = completion.choices[0].message;

    // Check if LLM requested tool calling
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      messages.push(responseMessage);

      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name;
        let functionArgs = {};
        try {
          functionArgs = JSON.parse(toolCall.function.arguments || '{}');
        } catch (e) {
          functionArgs = {};
        }

        toolsUsed.push(functionName);

        // Execute MCP Tool on backend
        const toolResult = await executeMcpTool(functionName, functionArgs, contextUser);

        messages.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          name: functionName,
          content: JSON.stringify(toolResult),
        });
      }
    } else {
      // Final textual response generated
      return {
        text: responseMessage.content || 'Thank you for contacting Sky Lounge!',
        sources: ragDocs.map((d) => d.title),
        toolsUsed,
      };
    }
  }

  return {
    text: 'I have processed your request with Sky Lounge restaurant tools.',
    sources: ragDocs.map((d) => d.title),
    toolsUsed,
  };
};

/**
 * Offline fallback generator if Groq API key is missing or unavailable
 */
function generateOfflineFallbackResponse(userQuery, ragDocs, contextUser) {
  const qLower = userQuery.toLowerCase();

  if (qLower.includes('hour') || qLower.includes('timing') || qLower.includes('open')) {
    return '🕒 **Sky Lounge Opening Hours:**\n\nWe are open 7 days a week from **11:00 AM to 11:00 PM**. Lunch is served from 11:30 AM to 4:00 PM, and dinner from 6:30 PM to 10:30 PM.';
  }

  if (qLower.includes('location') || qLower.includes('address') || qLower.includes('where')) {
    return '📍 **Sky Lounge Location:**\n\nSky Lounge Rooftop Restaurant is located in **Deoband, Uttar Pradesh (Pincode: 247554)**. For reservations or inquiries, call us at **9760999444**.';
  }

  if (ragDocs && ragDocs.length > 0) {
    return `✨ **Sky Lounge Information:**\n\n${ragDocs[0].content}`;
  }

  return 'Welcome to Sky Lounge Restaurant! How can I assist you with our menu, table reservations, or location details today?';
}

export default {
  generateAiChatResponse,
};
