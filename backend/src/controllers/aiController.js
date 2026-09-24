import asyncHandler from '../utils/asyncHandler.js';
import { generateAiChatResponse } from '../services/llmService.js';
import { reindexAllKnowledge } from '../services/ragService.js';
import { checkRateLimit } from '../services/redisService.js';

// @desc    Process AI Chat message with RAG + MCP tool calling
// @route   POST /api/ai/chat
// @access  Public (Optional User Auth)
export const handleAiChat = asyncHandler(async (req, res) => {
  const { message, conversationHistory = [] } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    res.status(400);
    throw new Error('Message content is required');
  }

  // Rate Limiting per IP / User (max 20 requests per minute)
  const clientIdentifier = req.user ? req.user._id.toString() : req.ip || 'anonymous';
  const rateCheck = await checkRateLimit(`ai_chat:${clientIdentifier}`, 20, 60);

  if (!rateCheck.allowed) {
    res.status(429);
    throw new Error('Too many AI requests. Please wait a moment before sending another message.');
  }

  const response = await generateAiChatResponse(message.trim(), conversationHistory, req.user);

  res.json({
    success: true,
    answer: response.text,
    sources: response.sources || [],
    toolsUsed: response.toolsUsed || [],
  });
});

// @desc    Get suggested AI prompt pills for frontend UI
// @route   GET /api/ai/suggestions
// @access  Public
export const getSuggestedPrompts = asyncHandler(async (req, res) => {
  const suggestions = [
    { text: '🌱 Suggest spicy vegetarian starters under ₹300', icon: '🥗' },
    { text: '🕒 What are your opening hours and location?', icon: '📍' },
    { text: '📦 What is the status of my order?', icon: '🛵' },
    { text: '📅 Is a table available for 4 guests at 8 PM?', icon: '🥂' },
    { text: '🍕 What are your most popular pizzas and mocktails?', icon: '⭐' },
  ];

  res.json({
    success: true,
    suggestions,
  });
});

// @desc    Admin endpoint to sync all menu items and static info into RAG knowledge base
// @route   POST /api/ai/admin/reindex
// @access  Private/Admin
export const reindexKnowledgeAdmin = asyncHandler(async (req, res) => {
  await reindexAllKnowledge();

  res.json({
    success: true,
    message: 'RAG knowledge base successfully synchronized and indexed.',
  });
});

export default {
  handleAiChat,
  getSuggestedPrompts,
  reindexKnowledgeAdmin,
};
