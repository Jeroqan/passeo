import { NextRequest, NextResponse } from 'next/server';
import { processFeedback } from '@/lib/feedbackLogic';
import { prisma } from '@/lib/prisma'; // Gerçek Prisma client'ını import ediyoruz
import { withLogging } from '@/lib/logging';

async function handler(req: NextRequest) {
  try {
    const body = await req.json();

    // Bağımlılığı burada, gerçek veritabanı işlemiyle sağlıyoruz.
    const saveFeedbackWithPrisma = (data: typeof body) => {
      return prisma.feedback.create({ data });
    };

    const result = await processFeedback(body, {
      saveFeedback: saveFeedbackWithPrisma,
    });

    if ('error' in result && result.status) {
      return NextResponse.json({ ...result }, { status: result.status });
    }

    return NextResponse.json(result, { status: 201 }); // Başarılı oluşturma
  } catch (error) {
    // JSON parse hatası gibi beklenmedik durumlar için
    console.error('FEEDBACK_API_ERROR:', error);
    return NextResponse.json(
      { error: 'Geçersiz istek formatı.' },
      { status: 400 }
    );
  }
}

export const POST = withLogging(handler); 