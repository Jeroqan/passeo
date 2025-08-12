export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { processContentBlockRequest } from '@/lib/contentBlockLogic';
import { openai, streamToResponse } from '@/lib/openai';
import { withLogging } from '@/lib/logging';

async function handler(req: NextRequest) {
  const payload = await req.json();
  const result = processContentBlockRequest(payload);

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const responseStream = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'Sen profesyonel bir teknik içerik yazarı ve SEO uzmanısın. Kullanıcıya sadece HTML döndür.'
      },
      { role: 'user', content: result.prompt },
    ],
    temperature: 0.7,
    stream: true,
  });

  return streamToResponse(responseStream);
}

export const POST = withLogging(handler); 