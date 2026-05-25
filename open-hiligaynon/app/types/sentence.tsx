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
  
  // ISO Date strings returned by your database
  createdAt: string; 
  updatedAt: string;
}