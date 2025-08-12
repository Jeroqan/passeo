/**
 * Splits a given text into an array of paragraphs.
 * Paragraphs are determined by one or more blank lines.
 * Empty paragraphs are filtered out.
 *
 * @param text The input text to split.
 * @returns An array of strings, where each string is a paragraph.
 */
export function splitIntoParagraphs(text: string): string[] {
  if (!text) {
    return [];
  }
  return text.split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

/**
 * clusterAiBlocks.ts
 *
 * Verilen paragrafları ve bunlara ait AI güven skorlarını (confidence)
 * belirli bir eşik üzerinden bloklar halinde kümeler.
 *
 * Örnek kullanım:
 *   const blocks = clusterAiBlocks([
 *     "p1", "p2", "p3", ...
 *   ], [0.05, 0.2, 0.15, ...], 0.1)
 *
 * Dönen değer:
 *   [
 *     { start: 1, end: 2, texts: ["p2", "p3"] },
 *     ...
 *   ]
 */

export interface AiBlock {
  /** Blok içindeki ilk paragrafın indeksi */
  start: number;
  /** Blok içindeki son paragrafın indeksi */
  end: number;
  /** Blok içindeki tüm paragraf metinleri */
  texts: string[];
}

/**
 * AI güven skoru eşik değerine göre komşu paragrafları bloklar halinde gruplar.
 * @param paragraphs  Metin parçaları
 * @param scores      Her metin parçasına ait confidence skoru
 * @param threshold   AI olarak kabul edilecek alt eşik değeri
 */
export function clusterAiBlocks(
  paragraphs: string[],
  scores: number[],
  threshold: number
): AiBlock[] {
  const blocks: AiBlock[] = [];
  let currentBlock: AiBlock | null = null;

  paragraphs.forEach((text, idx) => {
    const score = scores[idx] ?? 0;
    const isAi = score >= threshold;

    if (isAi) {
      if (!currentBlock) {
        // Yeni blok başlat
        currentBlock = { start: idx, end: idx, texts: [text] };
      } else {
        // Var olan bloğa ekle
        currentBlock.end = idx;
        currentBlock.texts.push(text);
      }
    } else {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
    }
  });

  if (currentBlock) {
    blocks.push(currentBlock);
  }

  return blocks;
} 