"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Sentence } from "@/app/types/sentence";
import { SentenceService } from "@/app/services/sentenceService";

export default function SentencesPage() {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination & API Meta State
  const [page, setPage] = useState(1);
  const limit = 30; // Changed to 30 items per page
  const [meta, setMeta] = useState({ total: 0, skip: 0, take: limit });
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadSentences = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await SentenceService.list({ page, limit, search: searchQuery }); 
      
      if (response && Array.isArray(response.items)) {
        setSentences(response.items);
        if (response.meta) setMeta(response.meta);
      } else {
        setSentences([]);
      }
    } catch (err) {
      console.error("Failed to fetch sentences:", err);
      setError("Failed to load the database. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this translation?")) return;

    try {
      setDeletingId(id);
      await SentenceService.remove(id); // Your DELETE endpoint is called here
      setSentences((prev) => prev.filter((s) => s.id !== id));
      setMeta((prev) => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      console.error("Failed to delete sentence:", err);
      alert("An error occurred while trying to delete the sentence.");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    loadSentences();
  }, [page]);

  useEffect(() => {
    if (searchQuery) setPage(1);
  }, [searchQuery]);

  const filteredSentences = sentences.filter(
    (s) =>
      s.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.hiligaynon.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(meta.total / limit));
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    // 1. Fixed height to window size (100dvh)
    <div className="h-[100dvh] flex flex-col bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 transition-colors py-6 px-4 sm:px-6 overflow-hidden">
      
      {/* 2. Inner container flexed to manage remaining space */}
      <div className="max-w-6xl mx-auto w-full flex flex-col flex-1 overflow-hidden space-y-4">
        
        {/* Header Section (Fixed) */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4 shrink-0">
          <div>
            <Link href="/" className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2 inline-block">
              &larr; Home
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight">Database</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              {meta.total > 0 ? `${meta.total} total translations` : "Loading..."}
            </p>
          </div>
          
          <Link 
            href="/sentences/create"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm text-white font-medium hover:bg-blue-700 transition-all shrink-0"
          >
            ➕ Add Phrase
          </Link>
        </header>

        {/* Search Bar (Fixed) */}
        <div className="relative shrink-0">
          <input
            type="text"
            placeholder="Search in English or Hiligaynon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-4 pr-4 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 transition-all"
          />
        </div>

        {/* Content Area (Scrollable dynamically takes up middle space) */}
        <main className="flex flex-col flex-1 overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-zinc-500 animate-pulse">Loading translations...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : (
            <>
              {/* 3. The actual scrollable list container */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="flex flex-col gap-2">
                  {filteredSentences.map((sentence) => (
                    <article
                      key={sentence.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-800 transition-all group"
                    >
                      {/* Compact Phrases */}
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 overflow-hidden">
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate min-w-[150px]">
                          {sentence.english}
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-400 truncate">
                          {sentence.hiligaynon}
                        </p>
                      </div>

                      {/* Compact Meta & Actions */}
                      <div className="flex items-center gap-3 shrink-0 text-xs">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider
                          ${sentence.status === 'verified' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}
                        >
                          {sentence.status}
                        </span>
                        
                        <div className="flex items-center gap-2 text-zinc-500 font-medium bg-zinc-50 dark:bg-zinc-800 px-2 py-0.5 rounded">
                          <span className="text-green-600">▲ {sentence.upVotes || 0}</span>
                          <span className="text-red-500">▼ {sentence.downVotes || 0}</span>
                        </div>

                        <div className="flex items-center gap-3 border-l border-zinc-200 dark:border-zinc-700 pl-3">
                          <Link href={`/sentences/${sentence.id}`} className="text-blue-600 hover:underline">
                            View
                          </Link>
                          <button
                            onClick={() => handleDelete(sentence.id)}
                            disabled={deletingId === sentence.id}
                            className="text-zinc-400 hover:text-red-600 disabled:opacity-50"
                          >
                            {deletingId === sentence.id ? "..." : "🗑️"}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                  
                  {filteredSentences.length === 0 && (
                    <p className="text-center text-sm text-zinc-500 py-10">No translations found.</p>
                  )}
                </div>
              </div>

              {/* ALWAYS VISIBLE PAGINATION BAR (Fixed to bottom of main area) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
                <span className="text-xs text-zinc-500">
                  Showing page {page} of {totalPages}
                </span>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs font-medium rounded-md border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Prev
                  </button>

                  <div className="hidden sm:flex gap-1">
                    {pageNumbers.map((num) => (
                      <button
                        key={num}
                        onClick={() => setPage(num)}
                        disabled={page === num}
                        className={`w-8 h-8 flex items-center justify-center text-xs font-medium rounded-md border 
                          ${page === num 
                            ? 'bg-blue-600 text-white border-blue-600 cursor-default' 
                            : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
                          }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || totalPages === 0}
                    className="px-3 py-1.5 text-xs font-medium rounded-md border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

