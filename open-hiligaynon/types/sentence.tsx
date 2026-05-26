export interface Sentence {
  id: string;
  english: string;
  hiligaynon: string;
  
  // These are returned by your API for search indexing
  normalizedEnglish: string;
  normalizedHiligaynon: string;
  
  // Expanded to include 'approved' which is commonly used in crowdsourced apps
  status: "pending" | "verified" | "approved" | "rejected"; 
  
  upVotes: number;
  downVotes: number;

  // 🧠 Semantic & Sentiment Analytics Layers
  sentiment: number;       // 0 = Negative, 1 = Neutral, 2 = Positive
  intent: string | null;   // e.g., "express_financial_luck", "complaint_delay"
  isSarcastic: boolean;    // Flags contextual irony (e.g., "Nanamian gid ko...")
  
  // ISO Date strings returned by your database
  createdAt: string; 
  updatedAt: string;
}