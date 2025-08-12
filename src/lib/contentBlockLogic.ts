import { createContentBlockPrompt } from '@/lib/promptBuilder/contentBlockPrompt';

export interface ContentBlockPayload {
  productName: string;
  brand: string;
  category: string;
  keyword: string;
}

export interface ApiError {
  error: string;
  status: number;
}

/**
 * İçerik bloğu oluşturma isteğini işler ve doğrular.
 * @param payload API'den gelen gövde.
 * @returns Başarılı olursa oluşturulan prompt'u, hata olursa ApiError nesnesini döner.
 */
export function processContentBlockRequest(
  payload: Partial<ContentBlockPayload>
): { prompt: string } | ApiError {
  const { productName, brand, category, keyword } = payload;

  if (!productName || !brand || !category || !keyword) {
    return { error: 'Eksik bilgi gönderildi.', status: 400 };
  }

  if (keyword.length > 100) {
    return { error: 'Anahtar kelime çok uzun.', status: 400 };
  }

  const prompt = createContentBlockPrompt(productName, brand, category, keyword);
  return { prompt };
} 