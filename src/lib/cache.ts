import crypto from 'crypto';
import type { AiDetectionApiResponse } from './aiDetectionLogic';

// Define the structure of the data we'll be caching.
// This now directly uses the API response type for consistency.
export type DetectCacheData = AiDetectionApiResponse;

// Simple in-memory cache using a Map.
const detectCache = new Map<string, DetectCacheData>();

/**
 * Generates a SHA-256 hash for a given text.
 * @param text The text to hash.
 * @returns A hex-encoded SHA-256 hash.
 */
function hashText(text: string): string {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

export { detectCache, hashText }; 