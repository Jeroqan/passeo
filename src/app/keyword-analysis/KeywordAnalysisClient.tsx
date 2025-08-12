"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import categories from "@/data/categories";

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

export default function KeywordAnalysisClient() {
  const router = useRouter();
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [formData, setFormData] = useState<ProductInfo>({ name: '', brand: '', category: '' });
  const [showProductForm, setShowProductForm] = useState(false);
  const [categoryInput, setCategoryInput] = useState('');
  const [filteredCategories, setFilteredCategories] = useState(Object.keys(categories).sort((a, b) => a.localeCompare(b)));
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // localStorage.removeItem('productInfo'); // KALDIRILDI, sadece menüden tıklanınca silinecek
      // Eğer localStorage'da ürün bilgisi varsa, formu otomatik doldur
      const storedInfo = localStorage.getItem('productInfo');
      if (storedInfo) {
        setFormData(JSON.parse(storedInfo));
        setProductInfo(JSON.parse(storedInfo));
        setShowProductForm(false);
      } else {
        setShowProductForm(true);
      }
      // Anahtar kelime seçimleri de localStorage'dan alınsın
      const storedKeywords = localStorage.getItem('selectedKeywords');
      if (storedKeywords) {
        setSelectedKeywords(JSON.parse(storedKeywords));
      }
      // Anahtar kelime listesini de localStorage'dan yükle
      const storedKeywordList = localStorage.getItem('keywords');
      if (storedKeywordList) {
        setKeywords(JSON.parse(storedKeywordList));
      }
    }
  }, []);

  useEffect(() => {
    setFilteredCategories(
      Object.keys(categories)
        .filter(cat => cat.toLowerCase().includes(categoryInput.toLowerCase()))
        .sort((a, b) => a.localeCompare(b))
    );
  }, [categoryInput]);

  const handleProductFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.brand || !formData.category) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }
    localStorage.setItem('productInfo', JSON.stringify(formData));
    setProductInfo(formData);
    setShowProductForm(false);
    handleAnalyze(formData);
  };

  const handleAnalyze = async (info: ProductInfo) => {
    setIsLoading(true);
    setError(null);
    try {
      // API'ye gönderirken kategori adını URL'ye çevir
      const categoryUrl = (categories as any)[info.category] || info.category;
      
      const response = await fetch('/api/keyword-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: info.name,
          brand: info.brand,
          category: info.category, // Kategori adını gönder
          categoryUrl: categoryUrl, // URL'yi ayrı gönder
          type: 'technical'
        }),
      });
      if (!response.ok) {
        throw new Error('Anahtar kelime analizi yapılırken bir hata oluştu.');
      }
      const data = await response.json();
      setKeywords(data.keywords);
      localStorage.setItem('keywords', JSON.stringify(data.keywords));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      const exampleKeywords: Keyword[] = [
        { text: `${info.name} teknik özellikleri`, type: 'technical', searchVolume: 800, trend: 85, relatedTerms: ['özellikler', 'detaylar', 'spesifikasyonlar'] },
        { text: `${info.name} işlemci`, type: 'specification', searchVolume: 600, trend: 75, relatedTerms: ['CPU', 'performans', 'hız'] },
        { text: `${info.name} ekran`, type: 'feature', searchVolume: 500, trend: 70, relatedTerms: ['çözünürlük', 'boyut', 'teknoloji'] },
        { text: `${info.name} batarya`, type: 'specification', searchVolume: 450, trend: 65, relatedTerms: ['pil ömrü', 'şarj', 'kapasite'] },
        { text: `${info.name} kamera`, type: 'feature', searchVolume: 400, trend: 60, relatedTerms: ['megapiksel', 'özellikler', 'video'] }
      ];
      setKeywords(exampleKeywords);
      localStorage.setItem('keywords', JSON.stringify(exampleKeywords));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeywordSelect = (keyword: string) => {
    setSelectedKeywords(prev => {
      if (prev.includes(keyword)) {
        return prev.filter(k => k !== keyword);
      }
      return [...prev, keyword];
    });
  };

  const handleContinue = () => {
    if (selectedKeywords.length === 0) {
      alert('Lütfen en az bir anahtar kelime seçin.');
      return;
    }
    localStorage.setItem('selectedKeywords', JSON.stringify(selectedKeywords));
    router.push('/content-generation');
  };

  if (showProductForm) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50">
        <h2 className="text-2xl font-semibold mb-4">Ürün Bilgileri</h2>
        <form onSubmit={handleProductFormSubmit} className="bg-white rounded-lg shadow-md p-8 w-full max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Adı</label>
            <input
              type="text"
              className="w-full border rounded-md px-3 py-2"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marka</label>
            <input
              type="text"
              className="w-full border rounded-md px-3 py-2"
              value={formData.brand}
              onChange={e => setFormData({ ...formData, brand: e.target.value })}
              required
            />
          </div>
          <div className="relative" ref={categoryDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <input
              type="text"
              className="w-full border rounded-md px-3 py-2"
              value={categoryInput}
              onChange={e => {
                setCategoryInput(e.target.value);
                setFormData({ ...formData, category: e.target.value });
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Kategori seçin veya yazın"
              required
              autoComplete="off"
            />
            {showDropdown && filteredCategories.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto mt-1">
                {filteredCategories.map((cat) => (
                  <div
                    key={cat}
                    className="px-4 py-2 cursor-pointer hover:bg-blue-100 text-gray-700"
                    onClick={() => {
                      setCategoryInput(cat);
                      setFormData({ ...formData, category: cat });
                      setShowDropdown(false);
                    }}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition">Başla</button>
        </form>
      </div>
    );
  }

  if (!productInfo) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Anahtar Kelime Analizi</h1>
      {/* Filtreleme Seçenekleri */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-md ${
              filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilterType('technical')}
            className={`px-4 py-2 rounded-md ${
              filterType === 'technical'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Teknik Özellikler
          </button>
          <button
            onClick={() => setFilterType('specification')}
            className={`px-4 py-2 rounded-md ${
              filterType === 'specification'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Spesifikasyonlar
          </button>
          <button
            onClick={() => setFilterType('feature')}
            className={`px-4 py-2 rounded-md ${
              filterType === 'feature'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Özellikler
          </button>
        </div>
      </div>
      {/* Ürün Bilgileri - Modern Tasarım */}
      <div className="mb-8 relative max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-2xl shadow-lg p-8 border border-blue-100 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-400/20 to-blue-500/20 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg mb-4">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-white">
                  <path stroke="currentColor" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <h3 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 bg-clip-text text-transparent break-words mb-2 drop-shadow-sm">
                {productInfo.name}
              </h3>
              <p className="text-gray-600 text-sm font-medium">Seçtiğiniz ürün için anahtar kelime analizi</p>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Marka & Kategori Card */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-white">
                      <path stroke="currentColor" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-gray-800">Marka</h4>
                </div>
                <p className="text-2xl font-extrabold text-purple-700 mb-2">{productInfo.brand}</p>
                <div className="flex items-center text-gray-600">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-2">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-white">
                      <path stroke="currentColor" strokeWidth="2" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"/>
                    </svg>
                  </div>
                  <span className="font-semibold text-green-700">{productInfo.category}</span>
                </div>
              </div>

              {/* Analiz Durumu Card */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-white">
                      <path stroke="currentColor" strokeWidth="2" d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-gray-800">Analiz Durumu</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Bulunan Kelimeler:</span>
                    <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {keywords.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Seçili Kelimeler:</span>
                    <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {selectedKeywords.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8">
          {error}
        </div>
      )}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Teknik anahtar kelimeler analiz ediliyor...</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Önerilen Teknik Anahtar Kelimeler
            </h2>
            <div className="space-y-4">
              {keywords
                .filter(k => filterType === 'all' || k.type === filterType)
                .map((keyword, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedKeywords.includes(keyword.text)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => handleKeywordSelect(keyword.text)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{keyword.text}</h3>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 mr-2">Arama Hacmi:</span>
                          <span className="text-sm text-gray-600">{keyword.searchVolume} arama/ay</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 mr-2">Trend:</span>
                          <div className="w-24 h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 bg-blue-600 rounded-full"
                              style={{ width: `${keyword.trend}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 ml-2">{keyword.trend}%</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-sm text-gray-500 mr-2">İlgili Terimler:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {keyword.relatedTerms.map((term, i) => (
                              <span
                                key={i}
                                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                              >
                                {term}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <input
                        type="checkbox"
                        checked={selectedKeywords.includes(keyword.text)}
                        onChange={() => {}}
                        className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleContinue}
              disabled={selectedKeywords.length === 0}
              className={`px-6 py-3 rounded-md text-white font-medium ${
                selectedKeywords.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Devam Et ({selectedKeywords.length} seçili)
            </button>
          </div>
          <button
            type="button"
            className="mt-4 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
            onClick={() => setShowProductForm(true)}
          >
            Geri Dön
          </button>
        </>
      )}
    </div>
  );
} 