import { NextRequest, NextResponse } from 'next/server';
import { processHumanizeRequest } from '@/lib/aiHumanizeLogic';
import { ratelimit } from '@/lib/ratelimit';
import { withLogging } from '@/lib/logging';

async function handler(req: NextRequest) {
    const ip = req.ip ?? '127.0.0.1';
    const { success } = await ratelimit.limit(ip);

    if (!success) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const result = await processHumanizeRequest(body.fullText, body.selected);

    if ('error' in result) {
        return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result);
}

export const POST = withLogging(handler); 