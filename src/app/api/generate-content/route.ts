import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import categories from '@/data/categories';

// OpenAI entegrasyonu ile dinamik content generation
export const runtime = 'nodejs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { productName, brand, category, keywords } = payload;

    // Basit validasyon
    if (!productName || !brand || !category || !keywords || !Array.isArray(keywords)) {
      return NextResponse.json(
        { error: 'Ürün adı, marka, kategori ve anahtar kelimeler gerekli.' },
        { status: 400 }
      );
    }

    console.log('🚀 Dinamik content generation başlıyor:', { productName, brand, category, keywords: keywords.length });

    try {
      // OpenAI ile dinamik content generation
      const dynamicContent = await generateDynamicContent(productName, brand, category, keywords);
      return NextResponse.json({ content: dynamicContent });
    } catch (openaiError) {
      console.error('❌ OpenAI error, fallback kullanılıyor:', openaiError);
      // Fallback sistem
      const fallbackContent = generateFallbackContent(productName, brand, category, keywords);
      return NextResponse.json({ content: fallbackContent });
    }

  } catch (error) {
    console.error('İçerik üretme API hatası:', error);
    return NextResponse.json(
      { error: 'Geçersiz istek veya sunucu hatası.' },
      { status: 500 }
    );
  }
}

// OpenAI ile tam dinamik content generation
async function generateDynamicContent(productName: string, brand: string, category: string, keywords: string[]): Promise<string> {
  const sections: string[] = [];
  
  // Kullanılacak keyword sayısını belirle
  const usedKeywords = keywords.slice(0, 5);
  
  // Her keyword için dinamik section üret
  for (let i = 0; i < usedKeywords.length; i++) {
    const keyword = usedKeywords[i];
    
    try {
      const section = await generateDynamicSection(keyword, productName, brand, category, i, usedKeywords.length, false);
      sections.push(section);
      
      // API rate limit için küçük delay
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`❌ Section generation error for keyword "${keyword}":`, error);
      // Bu keyword için fallback
      const fallbackSection = generateFallbackSection(keyword, i, category, usedKeywords.length, false);
      sections.push(fallbackSection);
    }
  }
  
  // En sona kategori linkini ayrı section olarak ekle
  const categoryUrl = (categories as any)[category];
  if (categoryUrl) {
    const categorySection = `<p>Bu konuda daha fazla bilgi almak için <strong><a href="${categoryUrl}" target="_blank" style="color: #2563eb; text-decoration: none;">${category}</a></strong> sayfasını inceleyebilirsiniz.</p>`;
    sections.push(categorySection);
  }
  
  return sections.join('\n\n');
}

// Her section için yeni advanced prompt sistemi
async function generateDynamicSection(keyword: string, productName: string, brand: string, category: string, index: number, totalKeywords: number, isLastSection: boolean): Promise<string> {
  // OpenAI çağrı fonksiyonu
  const callGPT = async (prompt: string): Promise<string> => {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 300,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('OpenAI response boş');
    }
    return response.trim();
  };

  // Yeni advanced prompt sistemi kullan
  const { generateContentBlock } = await import('@/lib/promptBuilder/contentBlockPrompt');
  
  try {
    const finalContent = await generateContentBlock(productName, brand, category, keyword, callGPT);
    console.log(`✅ Advanced section oluşturuldu: ${keyword}`);
    return finalContent;
  } catch (error) {
    console.error(`❌ Advanced prompt error for "${keyword}":`, error);
    // Fallback olarak basit prompt
    const simplePrompt = `Ürün: ${productName} için "${keyword}" özelliği hakkında sadece <h2>başlık</h2> ve <p>açıklama</p> yaz.`;
    return await callGPT(simplePrompt);
  }
}

// Fallback system - basit ama farklı
function generateFallbackContent(productName: string, brand: string, category: string, keywords: string[]): string {
  const sections: string[] = [];
  
  const usedKeywords = keywords.slice(0, 5);
  usedKeywords.forEach((keyword, index) => {
    const section = generateFallbackSection(keyword, index, category, usedKeywords.length, false);
    sections.push(section);
  });
  
  // En sona kategori linkini ayrı section olarak ekle
  const categoryUrl = (categories as any)[category];
  if (categoryUrl) {
    const categorySection = `<p>Bu konuda daha fazla bilgi almak için <strong><a href="${categoryUrl}" target="_blank" style="color: #2563eb; text-decoration: none;">${category}</a></strong> sayfasını inceleyebilirsiniz.</p>`;
    sections.push(categorySection);
  }
  
  return sections.join('\n\n');
}

function generateFallbackSection(keyword: string, index: number, category: string, totalKeywords: number, isLastSection: boolean): string {
  const titles = [
    'Teknik Özellikleri',
    'Fonksiyonel Detaylar',
    'Sistem Kapasitesi',
    'İşletim Parametreleri',
    'Performans Kriterleri'
  ];
  
  const contents = [
    `Sistem yapısında bulunan teknik özellikler, günlük kullanım gereksinimlerini karşılamak üzere tasarlanmıştır. Çalışma parametreleri optimize edilmiş performans seviyelerinde işlem yapar.`,
    
    `Ürün yapısı ergonomik tasarım prensipleri ile geliştirilmiştir. Fonksiyonel detaylar, kullanım kolaylığı ve dayanıklılık açısından test edilmiş standartlara uygundur.`,
    
    `Dayanıklılık testleri, uzun süreli kullanım koşullarında performans stabilitesini doğrulamaktadır. Malzeme kalitesi, endüstri standartlarında güvenilirlik sağlar.`,
    
    `Çok amaçlı kullanım kapasitesi, farklı işletim koşullarında uyumluluk gösterir. Sistem gereksinimleri, standard kullanım profillerini desteklemektedir.`,
    
    `Kalite kontrol süreçleri, üretim aşamalarında denetlenen parametreleri içerir. Performans metrikleri, belirlenen spesifikasyonlara uygun sonuçlar üretir.`
  ];
  
  const title = titles[index % titles.length];
  const content = contents[index % contents.length];
  
  let section = `<h2>${title}</h2>\n<p>${content}</p>`;
  
  // Kategori linki artık ayrı section olarak ekleniyor
  
  return section;
} 