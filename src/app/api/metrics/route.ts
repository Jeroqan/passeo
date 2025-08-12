export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
// import { register } from '@/lib/metrics';

export async function GET() {
  try {
    const metrics = await register.metrics();
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': register.contentType,
      },
    });
  } catch (error) {
    console.error('Failed to generate metrics:', error);
    return new NextResponse('Error generating metrics', { status: 500 });
  }
}

// This route should not be cached
export const revalidate = 0; 