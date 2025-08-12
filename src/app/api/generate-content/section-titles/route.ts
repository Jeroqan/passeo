import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAI API anahtarınızı environment variable'dan alın
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ProductInfo {
  name: string;
  brand: string;
  category: string;
}

interface Keyword {
  text: string;
  type: 'technical' | 'feature' | 'specification' | 'comparison';
  searchVolume: number;
  trend: number;
  relatedTerms: string[];
}

// Sekmeler için SEO uyumlu başlık üretimi
export async function POST(request: Request) {
  try {
    // API anahtarının varlığını kontrol et
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY environment variable is missing or empty.');
      return NextResponse.json(
        { error: 'OpenAI API anahtarı eksik veya boş. Lütfen .env dosyanızı kontrol edin ve uygulamayı yeniden başlatın.' },
        { status: 500 }
      );
    }

    const { productInfo, keywords } = await request.json();

    const prompt = `Aşağıdaki ürün adı (${productInfo.name}) ve anahtar kelimeler için, arama motorlarında öne çıkacak, dikkat çekici, ürün adını içermeyen, 4 ila 6 arası SEO uyumlu bölüm başlığı üret. Her başlık, ilgili anahtar kelimeyi ve ürün özelliğini yansıtmalı. Sadece başlıkları bir JSON string dizisi olarak döndür, başka açıklama veya kod ekleme. Örnek: ["Başlık 1", "Başlık 2"]

Ürün Adı: ${productInfo.name}
Anahtar Kelimeler: ${keywords.join(', ')}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "Sen profesyonel bir SEO başlık ve bölüm başlığı yazarı ve teknik içerik uzmanısın. Ürün adını tekrar etmeden, verilen anahtar kelimelerden özgün ve SEO uyumlu bölüm başlıkları üretiyorsun."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7, // Daha yaratıcı başlıklar için
      max_tokens: 200,
    });

    const rawTitles = completion.choices[0].message.content;
    let sectionTitles: string[] = [];

    // OpenAI'dan gelen yanıtın JSON olup olmadığını kontrol et
    try {
      console.log('OpenAI Raw Titles:', rawTitles); // Ham yanıtı logla
      sectionTitles = JSON.parse(rawTitles || '[]');
      if (!Array.isArray(sectionTitles)) {
        throw new Error('API yanıtı geçerli bir JSON dizisi değil.');
      }
    } catch (parseError) {
      console.error('Başlıkları ayrıştırma hatası:', parseError);
      // JSON parse hatası durumunda, metni satır satır ayırarak başlık olarak kabul et
      sectionTitles = rawTitles?.split('\n').map(line => line.replace(/^- /, '').trim()).filter(line => line.length > 0) || [];
      console.log('Fall-back titles:', sectionTitles); // Fallback başlıkları logla
    }

    // Maksimum 6 başlıkla sınırla
    sectionTitles = sectionTitles.slice(0, 6);

    return NextResponse.json({ sectionTitles });
  } catch (error) {
    console.error('Bölüm başlıkları üretme hatası:', error);
    // Hatanın detaylarını istemciye geri gönder
    return NextResponse.json(
      { error: `Bölüm başlıkları üretilirken bir hata oluştu: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 