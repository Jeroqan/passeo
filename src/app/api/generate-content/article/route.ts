import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { prepareArticleGeneration, ArticleGenerationSchema } from '@/lib/articleGenerationLogic';
// import { withLogging } from '@/lib/logging';

// Edge Runtime'da prom-client çalışmadığı için Node.js runtime kullanıyoruz
export const runtime = 'nodejs';

async function handler(req: NextRequest) {
  const body = await req.json();
  const validationResult = ArticleGenerationSchema.safeParse(body);

  if (!validationResult.success) {
    return new Response(JSON.stringify({ error: validationResult.error.flatten() }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { messages } = prepareArticleGeneration(validationResult.data);

  const result = await streamText({
    model: openai('gpt-4o'),
    messages: messages,
  });

  return result.toDataStreamResponse();
}

export const POST = handler; 