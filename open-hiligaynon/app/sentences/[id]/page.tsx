"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SentenceService } from "@/services/sentenceService";
import type { Sentence } from "@/types/sentence";

export default function EditSentencePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  // Form State
  const [english, setEnglish] = useState("");
  const [hiligaynon, setHiligaynon] = useState("");
  const [status, setStatus] = useState<Sentence["status"]>("pending");

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing data when page loads
  useEffect(() => {
    const fetchSentence = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const response = await SentenceService.get(id);
        const data =  response; 
        
        if (data) {
          setEnglish(data.english);
          setHiligaynon(data.hiligaynon);
          setStatus(data.status);
        } else {
          setError("Translation not found.");
        }
      } catch (err) {
        console.error("Failed to fetch:", err);
        setError("Could not load the translation for editing.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSentence();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!english.trim() || !hiligaynon.trim()) {
      setError("Both English and Hiligaynon fields are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Call the update service
      await SentenceService.update(id, { 
        english: english.trim(), 
        hiligaynon: hiligaynon.trim(),
        status 
      });

      // Redirect back to the details page after saving
      router.push(`/sentences/${id}`);
      router.refresh();
      
    } catch (err) {
      console.error("Failed to update:", err);
      setError("Failed to save changes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6">
        <div className="w-8 h-8 border-4 border-zinc-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-500 font-medium animate-pulse">Loading editor...</p>
      </div>
    );
  }

  if (error && !english) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center text-center p-6">
        <p className="text-red-500 mb-4">{error}</p>
        <Link href="/sentences" className="text-blue-600 hover:underline">Return to Database</Link>
      </div>
    );
  }

  return (
    <div className="min-h-[dvh] bg-zinc-50 dark:bg-zinc-950 font-sans py-10 px-4 sm:px-6 transition-colors">
      <div className="max-w-2xl mx-auto">
        
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">Edit Translation</h1>
          <Link 
            href={`/sentences/${id}`}
            className="text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition"
          >
            Cancel
          </Link>
        </header>

        <main className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 rounded-r-md">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* English Input */}
            <div>
              <label htmlFor="english" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                English Phrase
              </label>
              <input
                type="text"
                id="english"
                value={english}
                onChange={(e) => setEnglish(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-zinc-900 dark:text-zinc-100 transition"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Hiligaynon Input */}
            <div>
              <label htmlFor="hiligaynon" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                Hiligaynon Translation
              </label>
              <input
                type="text"
                id="hiligaynon"
                value={hiligaynon}
                onChange={(e) => setHiligaynon(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-zinc-900 dark:text-zinc-100 transition"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Status Dropdown */}
            <div>
              <label htmlFor="status" className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                Verification Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Sentence["status"])}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-zinc-900 dark:text-zinc-100 transition cursor-pointer"
                disabled={isSubmitting}
              >
                <option value="pending">🟡 Pending Review</option>
                <option value="verified">🟢 Verified</option>
                <option value="approved">🔵 Approved</option>
                <option value="rejected">🔴 Rejected</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all shadow-sm"
              >
                {isSubmitting ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}