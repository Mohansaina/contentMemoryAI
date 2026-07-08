"use server";

import { performRagSearch } from '@/services/search';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

export async function executeSearch(query: string) {
  try {
    if (!query || !query.trim()) {
      throw new Error('Query cannot be empty');
    }
    const result = await performRagSearch(DEMO_USER_ID, query.trim());
    return { success: true, answer: result.answer, sources: result.sources };
  } catch (error: any) {
    console.error('Search action failure:', error);
    return { 
      success: false, 
      answer: `Search execution error: ${error.message || 'Unknown database or dynamic client error.'}`, 
      sources: [] 
    };
  }
}
