import mongoose from 'mongoose';

const knowledgeDocSchema = new mongoose.Schema(
  {
    documentId: {
      type: String,
      required: true,
      index: true,
    },
    docType: {
      type: String,
      enum: ['menu_item', 'category', 'restaurant_info', 'faq', 'policy'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    embedding: {
      type: [Number],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

knowledgeDocSchema.index({ documentId: 1, docType: 1 }, { unique: true });

const KnowledgeDoc = mongoose.model('KnowledgeDoc', knowledgeDocSchema);
export default KnowledgeDoc;
