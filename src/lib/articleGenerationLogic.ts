import { openai } from '@/lib/openai';
import { z } from 'zod';
import { createArticlePrompt } from './promptBuilder/articlePrompt';
import { CoreMessage } from 'ai';

interface ProductInfo {
  name: string;
  brand: string;
  category: string;
}

interface ArticlePayload {
  productInfo: ProductInfo;
  keywords: string[];
  categoryUrl: string;
}

export interface ArticleApiResponse {
  content: string;
}

export interface ApiError {
  error: string;
  status: number;
}

export const ArticleGenerationSchema = z.object({
  productName: z.string().min(3, 'Ürün adı en az 3 karakter olmalıdır.'),
  brand: z.string().min(2, 'Marka en az 2 karakter olmalıdır.'),
  category: z.string().min(3, 'Kategori en az 3 karakter olmalıdır.'),
  keyword: z.string().min(3, 'Anahtar kelime en az 3 karakter olmalıdır.'),
});

export type ArticleGenerationParams = z.infer<typeof ArticleGenerationSchema>;

/**
 * Gelen makale üretme isteğini doğrular ve OpenAI'ye stream çağrısı yapar.
 * @param params - Makale üretimi için gerekli parametreler.
 * @returns Başarılı olursa OpenAI stream nesnesini, hata olursa ApiError döner.
 */
export async function processArticleGeneration(
  params: Partial<ArticleGenerationParams>
): Promise<ReturnType<typeof openai.chat.completions.create> | ApiError> {
  const validationResult = ArticleGenerationSchema.safeParse(params);
  if (!validationResult.success) {
    throw new Error(validationResult.error.errors.map(e => e.message).join(', '));
  }

  const { productName, brand, category, keyword } = validationResult.data;

  if (keyword.length > 100) {
    return {
      error: 'Anahtar kelime çok uzun.',
      status: 400,
    };
  }
  
  try {
    const prompt = createArticlePrompt({ productName, brand, category, keyword });

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Sen profesyonel bir teknik içerik yazarı ve SEO uzmanısın. Kullanıcıya sadece HTML formatında, <body> etiketleri olmadan doğrudan makale içeriğini döndür.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      stream: true,
    });

    return stream;
  } catch (error) {
    console.error('[ARTICLE GEN LOGIC ERROR]', error);
    return {
      error: 'Makale üretimi sırasında bir hata oluştu.',
      status: 500,
    };
  }
}

export async function generateArticleStream(params: ArticleGenerationParams) {
  const validationResult = ArticleGenerationSchema.safeParse(params);
  if (!validationResult.success) {
    const errorMessage = validationResult.error.errors.map(e => e.message).join(', ');
    throw new Error(errorMessage);
  }

  const { productName, brand, category, keyword } = validationResult.data;

  const prompt = createArticlePrompt({ productName, brand, category, keyword });

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    stream: true,
    messages: [
      {
        role: 'system',
        content: "You are a helpful assistant that provides responses in HTML format, chunk by chunk.",
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  return stream;
}

export function prepareArticleGeneration(params: ArticleGenerationParams): { messages: CoreMessage[] } {
  const validationResult = ArticleGenerationSchema.safeParse(params);
  if (!validationResult.success) {
    const errorMessage = validationResult.error.errors.map(e => e.message).join(', ');
    throw new Error(errorMessage);
  }

  const { productName, brand, category, keyword } = validationResult.data;
  const prompt = createArticlePrompt({ productName, brand, category, keyword });

  const messages: CoreMessage[] = [
    {
      role: 'system',
      content: "You are a helpful assistant that provides responses in HTML format, chunk by chunk.",
    },
    {
      role: 'user',
      content: prompt,
    },
  ];

  return { messages };
} 