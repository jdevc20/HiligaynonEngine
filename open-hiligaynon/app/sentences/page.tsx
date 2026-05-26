"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { Sentence } from "@/types/sentence";
import { SentenceService } from "@/services/sentenceService";

// Helper function for Windowed Pagination
const getVisiblePages = (current: number, total: number) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, "...", total];
  if (current >= total - 2) return [1, "...", total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
};

export default function SentencesPage() {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  
  // Split Search State (Immediate UI vs API Trigger)
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // 🧠 Dataset Pipeline Filters
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [sarcasmFilter, setSarcasmFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Pagination & API Meta State
  const [page, setPage] = useState(1);
  const limit = 30;
  const [meta, setMeta] = useState({ total: 0, skip: 0, take: limit });
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [votingId, setVotingId] = useState<string | null>(null);
  
  // Bulk Selection States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Debounce Effect: Only update the API search term after typing stops
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on new search
    }, 300);
    
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset pagination context to page 1 whenever database parameters shift
  useEffect(() => {
    setPage(1);
  }, [sentimentFilter, sarcasmFilter, statusFilter]);

  // Centralized Fetch Logic using useCallback
  const loadSentences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await SentenceService.list({ 
        page, 
        limit, 
        search: debouncedSearch,
        sentiment: sentimentFilter !== "all" ? parseInt(sentimentFilter, 10) : undefined,
        isSarcastic: sarcasmFilter !== "all" ? sarcasmFilter === "true" : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined
      }); 
      
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
  }, [page, limit, debouncedSearch, sentimentFilter, sarcasmFilter, statusFilter]);

  // Fetch data when dependencies change
  useEffect(() => {
    loadSentences();
    setSelectedIds([]); // Clear selection on new data load
  }, [loadSentences]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this translation?")) return;

    try {
      setDeletingId(id);
      await SentenceService.remove(id); 
      await loadSentences();
    } catch (err) {
      console.error("Failed to delete sentence:", err);
      alert("An error occurred while trying to delete the sentence.");
    } finally {
      setDeletingId(null);
    }
  };

  // ⚡ Interactive Voting Handler (Performs local atomic updates)
  const handleVote = async (sentenceId: string, type: "UP" | "DOWN") => {
    try {
      setVotingId(`${sentenceId}-${type}`);
      const response = await SentenceService.vote({ sentenceId, type });
      
      // Update local array item immediately to keep counters perfectly synced without page refresh
      if (response && response.data) {
        setSentences((prev) =>
          prev.map((s) => (s.id === sentenceId ? response.data : s))
        );
      }
    } catch (err) {
      console.error("Failed to register vote:", err);
    } finally {
      setVotingId(null);
    }
  };

  // Bulk Action Handlers
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === sentences.length && sentences.length > 0) {
      setSelectedIds([]); 
    } else {
      setSelectedIds(sentences.map((s) => s.id)); 
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} translations?`)) return;

    try {
      setIsBulkDeleting(true);
      await SentenceService.removeBulk(selectedIds);
      await loadSentences();
      setSelectedIds([]);
    } catch (err) {
      console.error("Failed to execute bulk delete:", err);
      alert("An error occurred while trying to delete the selected sentences.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(meta.total / limit));
  const pageNumbers = getVisiblePages(page, totalPages);

  // Styling helper for Sentiment Tags
  const getSentimentBadgeStyles = (val: number) => {
    if (val === 2) return "bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40";
    if (val === 0) return "bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40";
    return "bg-zinc-100 text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";
  };

  const getSentimentLabel = (val: number) => {
    if (val === 2) return "😊 Positive";
    if (val === 0) return "😡 Negative";
    return "😐 Neutral";
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 transition-colors py-6 px-4 sm:px-6 overflow-hidden">
      
      <div className="max-w-6xl mx-auto w-full flex flex-col flex-1 overflow-hidden space-y-4">
        
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
          
          <div className="flex items-center gap-3 shrink-0">
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm text-white font-medium hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {isBulkDeleting ? "Deleting..." : `🗑️ Delete Selected (${selectedIds.length})`}
              </button>
            )}
            <Link 
              href="/sentences/create"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm text-white font-medium hover:bg-blue-700 transition-all"
            >
              ➕ Add Phrase
            </Link>
          </div>
        </header>

        {/* 🎛️ Search and Semantic Filter Grid Area */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 shrink-0">
          <input
            type="text"
            placeholder="Search in English or Hiligaynon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sm:col-span-1 h-10 px-4 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 transition-all"
          />
          
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-zinc-200 bg-white text-sm focus:border-blue-500 outline-none dark:border-zinc-800 dark:bg-zinc-900"
          >
            <option value="all">All Sentiments</option>
            <option value="2">😊 Positive (2)</option>
            <option value="1">😐 Neutral (1)</option>
            <option value="0">😡 Negative (0)</option>
          </select>

          <select
            value={sarcasmFilter}
            onChange={(e) => setSarcasmFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-zinc-200 bg-white text-sm focus:border-blue-500 outline-none dark:border-zinc-800 dark:bg-zinc-900"
          >
            <option value="all">Literal & Sarcasm</option>
            <option value="true">😏 Sarcastic Only</option>
            <option value="false">📝 Literal Only</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-zinc-200 bg-white text-sm focus:border-blue-500 outline-none dark:border-zinc-800 dark:bg-zinc-900"
          >
            <option value="all">All Verification Statuses</option>
            <option value="pending">⏳ Pending</option>
            <option value="verified">✅ Verified</option>
            <option value="approved">⭐ Approved</option>
            <option value="rejected">❌ Rejected</option>
          </select>
        </div>

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
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="flex flex-col gap-2">
                  
                  {sentences.length > 0 && (
                    <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                      <input
                        type="checkbox"
                        id="selectAll"
                        checked={selectedIds.length === sentences.length && sentences.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor="selectAll" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
                        Select All on this page
                      </label>
                    </div>
                  )}

                  {sentences.map((sentence) => (
                    <article
                      key={sentence.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border transition-all group ${
                        selectedIds.includes(sentence.id)
                          ? "border-blue-400 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                          : "border-zinc-100 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-800"
                      }`}
                    >
                      <div className="flex-1 flex items-center gap-3 overflow-hidden">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(sentence.id)}
                          onChange={() => toggleSelection(sentence.id)}
                          className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 shrink-0 cursor-pointer"
                        />
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 overflow-hidden">
                          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate min-w-[150px]">
                            {sentence.english}
                          </h3>
                          <p className="text-sm text-blue-700 dark:text-blue-400 truncate">
                            {sentence.hiligaynon}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-xs">
                        {/* 🧠 COLUMN 1: Sentiment Output Tag */}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getSentimentBadgeStyles(sentence.sentiment)}`}>
                          {getSentimentLabel(sentence.sentiment)}
                        </span>

                        {/* 🎭 COLUMN 2: Explicit Sarcasm / Literal Tone Column */}
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                          sentence.isSarcastic 
                            ? 'bg-amber-100 text-amber-800 border border-amber-200/60 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40' 
                            : 'bg-purple-50 text-purple-700 border border-purple-200/60 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/40'
                        }`}>
                          {sentence.isSarcastic ? "😏 Sarcastic" : "📝 Literal"}
                        </span>

                        {/* 📋 COLUMN 3: Verification Status */}
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider
                          ${sentence.status === 'verified' || sentence.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}
                        >
                          {sentence.status}
                        </span>
                        
                        {/* ⚡ COLUMN 4: Active Atomic Voting Interface */}
                        <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800 p-0.5 rounded border border-zinc-200/40 dark:border-zinc-700">
                          <button
                            disabled={votingId !== null}
                            onClick={() => handleVote(sentence.id, "UP")}
                            className="px-1.5 py-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-green-600 font-bold transition-all disabled:opacity-40"
                          >
                            ▲ {sentence.upVotes || 0}
                          </button>
                          <button
                            disabled={votingId !== null}
                            onClick={() => handleVote(sentence.id, "DOWN")}
                            className="px-1.5 py-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-red-500 font-bold transition-all disabled:opacity-40"
                          >
                            ▼ {sentence.downVotes || 0}
                          </button>
                        </div>

                        {/* ⚙️ COLUMN 5: Target Record Operations */}
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
                  
                  {sentences.length === 0 && (
                    <p className="text-center text-sm text-zinc-500 py-10">No translations found matching your data pipeline selection.</p>
                  )}
                </div>
              </div>

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
                    {pageNumbers.map((num, idx) => (
                      num === "..." ? (
                        <span key={`ellipsis-${idx}`} className="px-2 py-1 text-zinc-500">...</span>
                      ) : (
                        <button
                          key={num}
                          onClick={() => setPage(num as number)}
                          disabled={page === num}
                          className={`w-8 h-8 flex items-center justify-center text-xs font-medium rounded-md border 
                            ${page === num 
                              ? 'bg-blue-600 text-white border-blue-600 cursor-default' 
                              : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
                            }`}
                        >
                          {num}
                        </button>
                      )
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
