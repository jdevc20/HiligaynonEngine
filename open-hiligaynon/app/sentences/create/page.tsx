"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SentenceService } from "@/app/services/sentenceService";

export default function CreateSentencePage() {
  const router = useRouter();
  
  // Form State
  const [english, setEnglish] = useState("");
  const [hiligaynon, setHiligaynon] = useState("");
  
  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!english.trim() || !hiligaynon.trim()) {
      setError("Both English and Hiligaynon fields are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Call your service to POST the data
      await SentenceService.create({ 
        english: english.trim(), 
        hiligaynon: hiligaynon.trim() 
      });

      // Redirect back to the sentences list page after success
      router.push("/sentences");
      router.refresh(); // Forces Next.js to re-fetch the list data
      
    } catch (err) {
      console.error("Failed to create sentence:", err);
      setError("Failed to save the sentence. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Sentence</h1>
        <Link 
          href="/sentences"
          className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
        >
          ← Back to List
        </Link>
      </header>

      <main className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* English Input */}
          <div>
            <label 
              htmlFor="english" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              English Phrase
            </label>
            <input
              type="text"
              id="english"
              value={english}
              onChange={(e) => setEnglish(e.target.value)}
              placeholder="e.g., Good afternoon"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Hiligaynon Input */}
          <div>
            <label 
              htmlFor="hiligaynon" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Hiligaynon Translation
            </label>
            <input
              type="text"
              id="hiligaynon"
              value={hiligaynon}
              onChange={(e) => setHiligaynon(e.target.value)}
              placeholder="e.g., Maayong hapon"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? "Saving..." : "Save Sentence"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}