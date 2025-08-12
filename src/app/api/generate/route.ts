import { NextResponse } from 'next/server';
import { generateContent } from '@/lib/openai';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { productName, brand, category, keywords } = await request.json();

    const prompt = `
      Ürün: ${productName}
      Marka: ${brand}
      Kategori: ${category}
      Anahtar Kelimeler: ${keywords.join(', ')}

      Lütfen bu ürün için SEO odaklı, 500-700 kelimelik bir ürün açıklaması yaz.
      Açıklama şunları içermeli:
      - Ürünün temel özellikleri
      - Kullanım alanları
      - Avantajları
      - Hedef kitle
      - Teknik detaylar (varsa)
      
      Metni HTML formatında yaz ve önemli noktaları <strong> etiketi ile vurgula.
    `;

    const content = await generateContent(prompt);

    // Save to database
    await prisma.contentHistory.create({
      data: {
        productName,
        brand,
        category,
        keywords: JSON.stringify(keywords),
        content: content || '',
      },
    });

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
} 