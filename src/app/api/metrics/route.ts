export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
// import { register } from '@/lib/metrics';

export async function GET() {
  try {
    // Metrics temporarily disabled for Vercel deployment
    return new NextResponse('Metrics temporarily disabled', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Failed to generate metrics:', error);
    return new NextResponse('Error generating metrics', { status: 500 });
  }
}

// This route should not be cached
export const revalidate = 0; 