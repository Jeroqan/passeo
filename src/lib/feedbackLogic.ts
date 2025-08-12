import { z } from 'zod';

// Gelen geri bildirim verisi için Zod şeması
export const feedbackSchema = z.object({
  type: z.enum(['BUG', 'FEATURE_REQUEST', 'GENERAL_FEEDBACK']),
  message: z.string().min(10, { message: 'Geri bildirim en az 10 karakter olmalıdır.' }).max(2000),
  page: z.string().optional(),
});

export type FeedbackData = z.infer<typeof feedbackSchema>;

// Bağımlılığı soyutluyoruz ve tip sorununu aşmak için `any` kullanıyoruz.
interface LogicDependencies {
  saveFeedback: (data: FeedbackData) => Promise<any>; // Prisma tipi sorunu nedeniyle geçici olarak any
}

/**
 * Gelen geri bildirim verisini doğrular ve bir servis aracılığıyla kaydeder.
 * @param data - Geri bildirim verileri (tip, mesaj, sayfa).
 * @param deps - Bağımlılıklar (örn. saveFeedback fonksiyonu).
 * @returns Başarılı olursa kaydedilen geri bildirimi, hata olursa bir hata nesnesi döner.
 */
export async function processFeedback(
  data: FeedbackData,
  deps: LogicDependencies
) {
  const validation = feedbackSchema.safeParse(data);

  if (!validation.success) {
    return {
      error: 'Geçersiz geri bildirim verisi.',
      details: validation.error.flatten().fieldErrors,
      status: 400,
    };
  }

  try {
    // Soyutlanmış fonksiyonu çağırıyoruz.
    const savedFeedback = await deps.saveFeedback(validation.data);
    return savedFeedback;
  } catch (error) {
    console.error('FEEDBACK_LOGIC_ERROR:', error);
    return {
      error: 'Geri bildirim kaydedilirken bir sunucu hatası oluştu.',
      status: 500,
    };
  }
} 