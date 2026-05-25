"use client";

import { useEffect, useState, useCallback } from "react";
import { SentenceService } from "@/app/services/sentenceService";
import type { Sentence } from "@/app/types/sentence";

// We define the parameters the hook will accept
interface UseSentencesProps {
  page?: number;
  limit?: number;
  search?: string;
}

export const useSentences = ({ page = 1, limit = 30, search = "" }: UseSentencesProps = {}) => {
  // 1. Data States (Matching the paginated API response)
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [meta, setMeta] = useState({ total: 0, skip: 0, take: limit });

  // 2. UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // useCallback ensures this function doesn't recreate on every render
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await SentenceService.list({ page, limit, search });
      
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
  }, [page, limit, search]);

  const remove = async (id: string) => {
    // We move the confirmation check into the hook so the UI doesn't have to worry about it
    if (!window.confirm("Are you sure you want to delete this translation?")) {
      return false; 
    }

    try {
      setDeletingId(id);
      await SentenceService.remove(id);
      
      // Optimistically update the UI without needing to reload the whole page
      setSentences((prev) => prev.filter((s) => s.id !== id));
      setMeta((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      
      return true; // Return success status
    } catch (err) {
      console.error("Failed to delete sentence:", err);
      alert("An error occurred while trying to delete the sentence.");
      return false;
    } finally {
      setDeletingId(null);
    }
  };

  // Re-fetch automatically whenever page, limit, or search changes
  useEffect(() => {
    load();
  }, [load]);

  // Return everything the UI might need
  return { 
    sentences, 
    meta, 
    loading, 
    error, 
    deletingId, 
    remove, 
    refresh: load 
  };
};