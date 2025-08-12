import { NextResponse } from 'next/server';
import { searchKeywords } from '@/lib/serpapi';

export async function POST(request: Request) {
  try {
    const { keyword } = await request.json();
    const results = await searchKeywords(keyword);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error analyzing keyword:', error);
    return NextResponse.json(
      { error: 'Failed to analyze keyword' },
      { status: 500 }
    );
  }
} 