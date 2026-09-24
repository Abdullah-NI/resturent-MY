import KnowledgeDoc from '../models/KnowledgeDoc.js';
import MenuItem from '../models/MenuItem.js';
import Category from '../models/Category.js';
import { generateEmbedding, cosineSimilarity } from './embeddingService.js';
import { getCache, setCache } from './redisService.js';

// Static knowledge definitions for Sky Lounge
const SKY_LOUNGE_STATIC_KNOWLEDGE = [
  {
    documentId: 'static-restaurant-overview',
    docType: 'restaurant_info',
    title: 'Sky Lounge Restaurant Overview & Location',
    content:
      'Sky Lounge is a premium rooftop fine-dining restaurant located in Deoband, Uttar Pradesh (Pincode: 247554). Phone: 9760999444. It offers breathtaking views, ambient lighting, indoor and rooftop seating, and a luxurious culinary experience with North Indian, Chinese, Italian, South Indian, Tandoori, and Snack specialities.',
    metadata: { category: 'overview' },
  },
  {
    documentId: 'static-opening-hours',
    docType: 'restaurant_info',
    title: 'Sky Lounge Opening Hours & Timing',
    content:
      'Sky Lounge is open 7 days a week from 11:00 AM to 11:00 PM. Lunch is served from 11:30 AM to 4:00 PM. Dinner is served from 6:30 PM to 10:30 PM. Table reservations are recommended for weekend evenings.',
    metadata: { category: 'timings' },
  },
  {
    documentId: 'static-dietary-policy',
    docType: 'policy',
    title: 'Dietary & Vegetarian Policy',
    content:
      'Sky Lounge prioritizes 100% Pure Vegetarian, hygienic, and fresh food preparation. All items marked as Vegetarian are cooked in dedicated vegetarian cookware with premium quality ingredients, butter, and ghee.',
    metadata: { category: 'dietary' },
  },
  {
    documentId: 'static-order-delivery-policy',
    docType: 'policy',
    title: 'Delivery, Payment & Order Policies',
    content:
      'Delivery fee is flat ₹40 for local Deoband orders. Payment methods accepted are Cash on Delivery (COD), UPI/Pay at Restaurant. Standard order preparation time is 15-20 minutes for starters and 25-30 minutes for main course items.',
    metadata: { category: 'delivery' },
  },
  {
    documentId: 'static-reservation-policy',
    docType: 'policy',
    title: 'Table Reservation Policy & Capacity',
    content:
      'Table reservations can be requested online for groups of 1 to 30 guests. Confirmation is handled promptly by restaurant staff. Special requests such as candlelight setups, birthday decor, or quiet corner seating can be specified when booking.',
    metadata: { category: 'reservation' },
  },
];

/**
 * Sync single MenuItem into KnowledgeDoc RAG storage
 */
export const syncMenuItemToKnowledge = async (menuItem) => {
  if (!menuItem) return;

  const itemObj = menuItem.toObject ? menuItem.toObject() : menuItem;
  const categoryName = itemObj.category && itemObj.category.name ? itemObj.category.name : 'General';
  const vegText = itemObj.isVegetarian !== false ? 'Pure Veg' : 'Non-Veg';
  const tagsText = Array.isArray(itemObj.tags) && itemObj.tags.length > 0 ? itemObj.tags.join(', ') : '';

  const content = `Dish Name: ${itemObj.name}. Category: ${categoryName}. Price: ₹${itemObj.price}. Dietary: ${vegText}. Description: ${
    itemObj.description || 'Delicious Sky Lounge special dish.'
  }. Preparation Time: ${itemObj.preparationTime || '15-20 mins'}. Availability: ${
    itemObj.isAvailable ? 'Available' : 'Currently Out of Stock'
  }. Tags: ${tagsText}.`;

  const embedding = await generateEmbedding(`${itemObj.name} ${categoryName} ${itemObj.description || ''} ${vegText} ${tagsText}`);

  await KnowledgeDoc.findOneAndUpdate(
    { documentId: itemObj._id.toString(), docType: 'menu_item' },
    {
      documentId: itemObj._id.toString(),
      docType: 'menu_item',
      title: itemObj.name,
      content,
      metadata: {
        price: itemObj.price,
        category: categoryName,
        isVegetarian: itemObj.isVegetarian !== false,
        isAvailable: itemObj.isAvailable !== false,
        isPopular: !!itemObj.isPopular,
        tags: itemObj.tags || [],
      },
      embedding,
      isActive: itemObj.isAvailable !== false,
    },
    { upsert: true, new: true }
  );
};

/**
 * Sync single Category into KnowledgeDoc
 */
export const syncCategoryToKnowledge = async (category) => {
  if (!category) return;

  const catObj = category.toObject ? category.toObject() : category;
  const content = `Category Name: ${catObj.name}. Description: ${
    catObj.description || 'Delicious variety of Sky Lounge offerings.'
  }. Popular Category: ${catObj.isPopular ? 'Yes' : 'No'}.`;

  const embedding = await generateEmbedding(`${catObj.name} ${catObj.description || ''}`);

  await KnowledgeDoc.findOneAndUpdate(
    { documentId: catObj._id.toString(), docType: 'category' },
    {
      documentId: catObj._id.toString(),
      docType: 'category',
      title: catObj.name,
      content,
      metadata: { slug: catObj.slug, isPopular: !!catObj.isPopular },
      embedding,
      isActive: catObj.isActive !== false,
    },
    { upsert: true, new: true }
  );
};

/**
 * Remove KnowledgeDoc on item deletion
 */
export const removeKnowledgeDoc = async (documentId, docType) => {
  await KnowledgeDoc.deleteOne({ documentId: documentId.toString(), docType });
};

/**
 * Re-index all Menu Items, Categories, and Static Restaurant Info into RAG storage
 */
export const reindexAllKnowledge = async () => {
  console.log('🔄 Re-indexing RAG knowledge documents...');

  // 1. Sync Static Knowledge
  for (const staticDoc of SKY_LOUNGE_STATIC_KNOWLEDGE) {
    const embedding = await generateEmbedding(`${staticDoc.title} ${staticDoc.content}`);
    await KnowledgeDoc.findOneAndUpdate(
      { documentId: staticDoc.documentId, docType: staticDoc.docType },
      { ...staticDoc, embedding, isActive: true },
      { upsert: true, new: true }
    );
  }

  // 2. Sync Categories
  const categories = await Category.find({ isActive: true });
  for (const cat of categories) {
    await syncCategoryToKnowledge(cat);
  }

  // 3. Sync Menu Items
  const menuItems = await MenuItem.find({}).populate('category', 'name slug');
  for (const item of menuItems) {
    await syncMenuItemToKnowledge(item);
  }

  console.log(`✅ RAG Re-indexing complete (${categories.length} categories, ${menuItems.length} menu items).`);
};

/**
 * Perform semantic vector retrieval based on user query
 */
export const searchKnowledge = async (queryText, limit = 5) => {
  if (!queryText || typeof queryText !== 'string') return [];

  // Check Redis response cache for query
  const cacheKey = `rag:query:${queryText.trim().toLowerCase()}`;
  const cachedResults = await getCache(cacheKey);
  if (cachedResults) {
    return cachedResults;
  }

  const queryVector = await generateEmbedding(queryText);

  let results = [];

  // 1. Attempt MongoDB Atlas Vector Search Pipeline if index is available
  try {
    const indexName = process.env.VECTOR_INDEX_NAME || 'vector_index';
    const pipeline = [
      {
        $vectorSearch: {
          index: indexName,
          path: 'embedding',
          queryVector,
          numCandidates: limit * 5,
          limit,
        },
      },
      {
        $match: { isActive: true },
      },
      {
        $project: {
          documentId: 1,
          docType: 1,
          title: 1,
          content: 1,
          metadata: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ];

    const vectorResults = await KnowledgeDoc.aggregate(pipeline);
    if (vectorResults && vectorResults.length > 0) {
      results = vectorResults;
    }
  } catch (err) {
    // Atlas Vector Search not configured or fallback required
  }

  // 2. Fallback: In-memory Cosine Similarity matching over active documents
  if (results.length === 0) {
    const docs = await KnowledgeDoc.find({ isActive: true }).select('documentId docType title content metadata embedding');

    const scoredDocs = docs.map((doc) => {
      let similarity = 0;
      if (doc.embedding && doc.embedding.length > 0) {
        similarity = cosineSimilarity(queryVector, doc.embedding);
      } else {
        // Text keyword fallback score if embedding missing
        const qLower = queryText.toLowerCase();
        if (doc.title.toLowerCase().includes(qLower) || doc.content.toLowerCase().includes(qLower)) {
          similarity = 0.5;
        }
      }
      return {
        documentId: doc.documentId,
        docType: doc.docType,
        title: doc.title,
        content: doc.content,
        metadata: doc.metadata,
        similarity,
      };
    });

    // Sort by similarity score descending
    scoredDocs.sort((a, b) => b.similarity - a.similarity);
    results = scoredDocs.slice(0, limit);
  }

  // Cache top search results for 10 minutes in Redis
  await setCache(cacheKey, results, 600);

  return results;
};

export default {
  syncMenuItemToKnowledge,
  syncCategoryToKnowledge,
  removeKnowledgeDoc,
  reindexAllKnowledge,
  searchKnowledge,
};
