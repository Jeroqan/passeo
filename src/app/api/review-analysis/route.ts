import { NextRequest, NextResponse } from 'next/server';
import { processReviewAnalysis } from '@/lib/reviewAnalysisLogic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    const result = await processReviewAnalysis(text);

    // Hata durumunu kontrol et (ApiError tipindeyse)
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    // Başarılı sonucu gönder
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    // JSON parse hatası gibi beklenmedik durumlar için
    console.error('REVIEW_ANALYSIS_API_ERROR:', error);
    return NextResponse.json(
      { error: 'Geçersiz istek formatı.' },
      { status: 400 }
    );
  }
} 