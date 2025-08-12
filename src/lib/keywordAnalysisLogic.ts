import { getJson } from 'serpapi';
import OpenAI from 'openai';
import { buildKeywordExtractionPrompt } from '@/lib/promptBuilder/keywordPrompt';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// OpenAI kullanarak teknik özellikleri analiz eden yardımcı fonksiyon
const analyzeTechnicalFeatures = async (productName: string, category: string, brand?: string): Promise<string[]> => {
  try {
    const userPrompt = buildKeywordExtractionPrompt({ productName, brand, category });

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.2,
      max_tokens: 250,
    });

    const featuresString = completion.choices[0].message.content;
    if (!featuresString) {
      return [];
    }

    // Virgülle ayrılmış dizeyi diziye çevir ve gereksiz boşlukları temizle
    return featuresString.split(',').map(feature => feature.trim()).filter(feature => feature.length > 0);

  } catch (error) {
    console.error('OpenAI teknik özellik analizi hatası:', error);
    // Hata durumunda, hatayı yukarıya fırlat ki çağıran fonksiyon haberdar olsun.
    throw error;
  }
};

// SerpApi ile arama hacmi ve trend verilerini al
const getSearchData = async (query: string) => {
  try {
    const response = await getJson({
      api_key: process.env.SERPAPI_KEY,
      engine: 'google',
      q: query,
      google_domain: 'google.com.tr',
      gl: 'tr',
      hl: 'tr',
      num: 100
    });

    // Arama sonuçlarından ilgili terimleri çıkar
    const relatedTerms = response.related_searches?.map((item: any) => item.query) || [];
    
    // Arama hacmi ve trend verilerini hesapla
    const searchVolume = Math.floor(Math.random() * 1000) + 500; // Gerçek API'de bu veri gelecek
    const trend = Math.floor(Math.random() * 30) + 70; // Gerçek API'de bu veri gelecek

    return {
      searchVolume,
      trend,
      relatedTerms: relatedTerms.slice(0, 5)
    };
  } catch (error) {
    console.error('SerpApi hatası:', error);
    // Hata durumunda, hatayı yukarıya fırlat.
    throw error;
  }
};

interface ProductInfo {
    name: string;
    category: string;
    brand?: string;
}

export const analyzeKeywords = async (productInfo: ProductInfo, isFree: boolean) => {
    const { name: productName, brand, category } = productInfo;

    if (isFree) {
        const technicalFeatures = await analyzeTechnicalFeatures(productName, category, brand);
        
        const keywords = technicalFeatures.map((feature, i) => ({
            text: feature,
            trend: 80 - i * 5 + Math.floor(Math.random() * 10) - 5, // Dummy trend
            type: 'technical',
            searchVolume: 1000 - i * 50 + Math.floor(Math.random() * 100) - 50, // Dummy search volume
            relatedTerms: []
        }));
        return { keywords };
    }
    
    const technicalFeatures = await analyzeTechnicalFeatures(productName, category, brand);
    
    const keywordPromises = technicalFeatures.map(async (feature) => {
      const queryForSerpApi = `${productName} ${feature}`;
      const searchData = await getSearchData(queryForSerpApi);

      let type: 'technical' | 'feature' | 'specification' | 'comparison' = 'feature';
      if (feature.includes('işlemci') || feature.includes('ram') || feature.includes('depolama')) {
        type = 'specification';
      } else if (feature.includes('pil') || feature.includes('batarya')) {
        type = 'technical';
      }

      return {
        text: feature,
        type: type,
        searchVolume: searchData.searchVolume,
        trend: searchData.trend,
        relatedTerms: searchData.relatedTerms
      };
    });

    let keywords = await Promise.all(keywordPromises);

    const generalQuery = `${productName} teknik özellikleri`;
    const generalSearchData = await getSearchData(generalQuery);
    keywords.push({
      text: generalQuery,
      type: 'technical',
      searchVolume: generalSearchData.searchVolume,
      trend: generalSearchData.trend,
      relatedTerms: generalSearchData.relatedTerms
    });

    keywords.sort((a, b) => b.trend - a.trend);

    return { keywords };
} 