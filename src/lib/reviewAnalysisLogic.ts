import { openai } from '@/lib/openai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Zod şeması ile beklenen yanıt yapısını tanımlıyoruz
const analysisSchema = z.object({
  sentiment: z.enum(['Pozitif', 'Nötr', 'Negatif']).describe('Yorumun genel duygu durumu.'),
  categories: z.array(z.string()).describe('Yorumda bahsedilen ana konular (örneğin, Fiyat, Kargo, Ürün Kalitesi, Müşteri Hizmetleri).'),
});

export type ReviewAnalysisResponse = z.infer<typeof analysisSchema>;

export interface ApiError {
  error: string;
  status: number;
}

/**
 * Gelen metni analiz eder, duygu ve kategorilerini belirler.
 * @param text Analiz edilecek yorum metni.
 * @returns Başarılı olursa ReviewAnalysisResponse, hata olursa ApiError döner.
 */
export async function processReviewAnalysis(
  text: string | undefined | null
): Promise<ReviewAnalysisResponse | ApiError> {
  if (!text || text.trim().length < 5) {
    return { error: 'Analiz için en az 5 karakterli bir metin gereklidir.', status: 400 };
  }

  try {
    const prompt = `
      Bir e-ticaret ürününe yapılmış aşağıdaki yorumu analiz et.
      Yorumun genel duygu durumunu (Pozitif, Nötr, Negatif) ve yorumda bahsedilen ana kategorileri belirle.
      Kategoriler şunlardan biri veya birkaçı olabilir: Fiyat, Kargo, Ürün Kalitesi, Müşteri Hizmetleri, İade Süreci, Ambalaj.
      Yanıtını SADECE JSON formatında ver.
      Yorum: "${text}"
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const analysisJson = JSON.parse(response.choices[0].message.content || '{}');
    
    // Zod şeması ile yanıtı doğruluyoruz
    const validation = analysisSchema.safeParse(analysisJson);
    if (!validation.success) {
      console.error('OpenAI response validation failed:', validation.error);
      return { error: 'Modelden gelen yanıt doğrulanamadı.', status: 500 };
    }

    return validation.data;
  } catch (error) {
    console.error('PROCESS_REVIEW_ANALYSIS_ERROR:', error);
    return { error: 'Analiz sırasında sunucuda bir hata oluştu.', status: 500 };
  }
} 