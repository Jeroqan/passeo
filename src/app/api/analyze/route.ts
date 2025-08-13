import { NextResponse } from 'next/server';
// import { searchKeywords } from '@/lib/serpapi';

export async function POST(request: Request) {
  try {
    // Geçici olarak devre dışı - SERPAPI_API_KEY eksik
    // const { keyword } = await request.json();
    // const results = await searchKeywords(keyword);

    return NextResponse.json(
      { message: 'API temporarily disabled - SERPAPI_API_KEY not configured' },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error analyzing keyword:', error);
    return NextResponse.json(
      { error: 'Failed to analyze keyword' },
      { status: 500 }
    );
  }
} 