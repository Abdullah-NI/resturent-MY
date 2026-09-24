let pipelineInstance = null;

/**
 * Lazy loads the ONNX feature extraction pipeline for zero-latency local embeddings
 */
const getPipeline = async () => {
  if (!pipelineInstance) {
    try {
      const { pipeline } = await import('@xenova/transformers');
      console.log('⚡ Initializing feature-extraction pipeline (all-MiniLM-L6-v2)...');
      pipelineInstance = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      console.log('✅ Local Embedding model ready.');
    } catch (err) {
      console.warn('⚠️ Could not load @xenova/transformers locally:', err.message);
      pipelineInstance = null;
    }
  }
  return pipelineInstance;
};

/**
 * Generate embedding array for text string
 * @param {string} text 
 * @returns {Promise<number[]>} Array of float numbers
 */
export const generateEmbedding = async (text) => {
  if (!text || typeof text !== 'string') return [];

  const cleanText = text.replace(/\n+/g, ' ').trim();
  if (!cleanText) return [];

  try {
    const extractor = await getPipeline();
    if (extractor) {
      const output = await extractor(cleanText, { pooling: 'mean', normalize: true });
      return Array.from(output.data);
    }
  } catch (err) {
    console.warn('Embedding generation error with local transformer:', err.message);
  }

  // Fallback: Generate pseudo-normalized vector deterministic from text if model load fails
  return generateDeterministicFallbackEmbedding(cleanText);
};

/**
 * Cosine similarity between two vector arrays
 */
export const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) {
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Simple hash-based fallback embedding (384 dimensions)
 */
function generateDeterministicFallbackEmbedding(str) {
  const dim = 384;
  const vec = new Array(dim).fill(0);
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    const index = (charCode * (i + 1)) % dim;
    vec[index] += Math.sin(charCode);
  }
  let sum = 0;
  for (let i = 0; i < dim; i++) sum += vec[i] * vec[i];
  const mag = Math.sqrt(sum) || 1;
  return vec.map((v) => v / mag);
}

export default {
  generateEmbedding,
  cosineSimilarity,
};
