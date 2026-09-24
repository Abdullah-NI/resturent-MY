import express from 'express';
import { handleAiChat, getSuggestedPrompts, reindexKnowledgeAdmin } from '../controllers/aiController.js';
import { optionalAuth, requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public chat endpoint with optional logged-in user context
router.post('/chat', optionalAuth, handleAiChat);

// Quick suggestions endpoint
router.get('/suggestions', getSuggestedPrompts);

// Admin RAG re-index endpoint
router.post('/admin/reindex', requireAuth, requireRole('admin'), reindexKnowledgeAdmin);

export default router;
