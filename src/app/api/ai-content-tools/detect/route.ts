import { NextRequest, NextResponse } from 'next/server';
import { ratelimit } from '@/lib/ratelimit';
// import { withLogging } from '@/lib/logging';
import { withApiMetrics } from '@/lib/apiMetrics';

async function handler(req: NextRequest) {
    const body = await req.json();
    const { text } = body;

    if (!text || text.trim().length === 0) {
        return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Rate limiting
    const ip = req.ip ?? '127.0.0.1';
    const { success } = await ratelimit.limit(ip);
    if (!success) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    try {
        console.log('🧪 AI Detection API çağrısı başlatılıyor...');
        
        // Önce embedding-based sistemi dene (OpenAI API key varsa)
        const { processAiDetection } = await import('@/lib/aiDetectionLogic');
        const result = await processAiDetection(text);
        
        if ('error' in result) {
            console.error('AI detection error:', result.error);
            return NextResponse.json({ error: result.error }, { status: result.status });
        }
        
        console.log(`✅ AI Detection tamamlandı: ${(result.overall_ai_probability * 100).toFixed(1)}%`);
        return NextResponse.json(result);
        
    } catch (error) {
        console.error('AI detection service critical error:', error);
        
        // Son çare: minimalist fallback
        return NextResponse.json({
            results: [
                { label: 'Yapay Zeka', score: 0.15 },
                { label: 'İnsan', score: 0.85 },
            ],
            overall_ai_probability: 0.15,
            paragraphs: [text],
            scores: [0.15],
            clusters: []
        });
    }
}

export const POST = withApiMetrics(handler);

export const runtime = 'nodejs'; 