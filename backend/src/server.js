import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';
import { reindexAllKnowledge } from './services/ragService.js';

const PORT = process.env.PORT || 5000;

// Connect Database and Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Sky Lounge Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);

    // Asynchronously trigger initial RAG knowledge sync
    reindexAllKnowledge().catch((err) => {
      console.warn('⚠️ Initial RAG Knowledge re-indexing warning:', err.message);
    });
  });
});
