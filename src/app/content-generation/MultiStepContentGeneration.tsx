"use client";

import { useState, useEffect, useRef, useCallback, ChangeEvent, memo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import categories from '@/data/categories';
import { Loader2, Download } from 'lucide-react';


// Word'e aktarma fonksiyonu için bu paketlerin kurulması gerekecektir:
// npm install html-to-docx-ts file-saver
// import { saveAs } from 'file-saver';
// import htmlToDocx from 'html-to-docx-ts';

const steps = [
  { key: 'product-info', label: 'Ürün Bilgileri' },
  { key: 'keyword-analysis', label: 'Anahtar Kelime Analizi' },
  { key: 'content-generation', label: 'İçerik Üretme' },
  // { key: 'final-touches', label: 'Son Vuruş' }, // GEÇİCİ OLARAK KAPALI
];

interface ProductInfo {
  name: string;
  brand: string;
  category: string;
}

const InfoPanel = ({ productInfo, keywords }: { productInfo: ProductInfo | null, keywords: string[] }) => {
  if (!productInfo) return null;
  return (
    <div className="mb-8 relative max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-2xl shadow-lg p-8 border border-blue-100 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-400/20 to-blue-500/20 rounded-full -ml-12 -mb-12"></div>
        
        <div className="relative z-10">
                        {/* Header - İçerik Üretimi başlığı */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl shadow-lg mb-4">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-white">
                    <path stroke="currentColor" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                  </svg>
                </div>
                <h3 className="text-3xl font-extrabold bg-gradient-to-r from-orange-600 via-orange-700 to-red-700 bg-clip-text text-transparent break-words mb-2 drop-shadow-sm">
                  İçerik Üretimi
                </h3>
                <p className="text-gray-600 text-sm font-medium">Seçtiğiniz anahtar kelimelerle ürününüz için profesyonel içerik oluşturun</p>
              </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ürün Bilgileri Card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-shadow duration-300 text-center">
              {/* Büyük Kullanıcı İkonu */}
              <div className="text-blue-500 mx-auto mb-4">
                <svg width="64" height="64" fill="none" viewBox="0 0 24 24" className="mx-auto">
                  <path stroke="currentColor" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              
              {/* Ürün Adı */}
              <div className="mb-4">
                <div className="text-sm text-gray-500 font-medium mb-1">Ürün Adı</div>
                <div className="text-lg font-bold text-gray-800 break-words">{productInfo.name}</div>
              </div>

              {/* Marka */}
              <div className="mb-4">
                <div className="text-sm text-gray-500 font-medium mb-1">Marka</div>
                <div className="text-lg font-bold text-gray-800">{productInfo.brand}</div>
              </div>

              {/* Kategori */}
              <div>
                <div className="text-sm text-gray-500 font-medium mb-1">Kategori</div>
                <div className="text-lg font-bold text-gray-800">{productInfo.category}</div>
              </div>
            </div>

            {/* Anahtar Kelimeler Card */}
            {keywords && keywords.length > 0 && (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-white">
                      <path stroke="currentColor" strokeWidth="2" d="M15 7a8 8 0 11-16 0 8 8 0 0116 0zM9 12l2 2 4-4"/>
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-gray-800">Seçili Kelimeler</h4>
                </div>
                <div className="flex flex-wrap gap-3">
                  {keywords.map((kw, i) => (
                    <span 
                      key={i} 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm hover:shadow-md transition-shadow duration-200 cursor-default"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3 font-medium">{keywords.length} anahtar kelime seçildi</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
InfoPanel.displayName = 'InfoPanel';

// Ayrı bir ProductForm bileşeni oluşturuyoruz
const ProductForm = memo(({ onSubmit, initialData }: { onSubmit: (data: ProductInfo) => void; initialData?: ProductInfo | null }) => {
  const [formData, setFormData] = useState<ProductInfo>(initialData || { name: '', brand: '', category: '' });
  const [formError, setFormError] = useState<string | null>(null);

  // initialData değiştiğinde formData'yı güncelle
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setCategoryFilter(initialData.category || '');
    } else {
      // initialData null ise formu temizle
      setFormData({ name: '', brand: '', category: '' });
      setCategoryFilter('');
    }
  }, [initialData]);
  
  // Marka autocomplete state'leri
  const [brandHistory, setBrandHistory] = useState<string[]>([]);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [highlightedBrandIndex, setHighlightedBrandIndex] = useState(-1);
  const brandInputRef = useRef<HTMLInputElement>(null);
  const brandDropdownRef = useRef<HTMLUListElement>(null);

  // Kategori autocomplete state'leri
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const categoryInputRef = useRef<HTMLInputElement>(null);
  const categoryDropdownRef = useRef<HTMLUListElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // Marka geçmişini yükle
  useEffect(() => {
    try {
      const savedBrands = localStorage.getItem('brandHistory');
      if (savedBrands) {
        setBrandHistory(JSON.parse(savedBrands));
      }
    } catch (error) {
      console.error('Marka geçmişi okunurken hata:', error);
    }
  }, []);

  const sortedCategories = Object.keys(categories).sort((a, b) => a.localeCompare(b, 'tr'));
  const filteredCategories = sortedCategories.filter(cat => cat.toLowerCase().includes(categoryFilter.toLowerCase()));
  const filteredBrands = brandHistory.filter(brand =>
    formData.brand && brand.toLowerCase().includes(formData.brand.toLowerCase())
  );

  // Form gönderimi
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.brand.trim() || !formData.category) {
      setFormError('Tüm alanları doldurmalısınız.');
      return;
    }
    // Marka geçmişini güncelle
    const newBrand = formData.brand.trim();
    if (newBrand && !brandHistory.includes(newBrand)) {
      const updatedHistory = [...brandHistory, newBrand].sort();
      setBrandHistory(updatedHistory);
      localStorage.setItem('brandHistory', JSON.stringify(updatedHistory));
    }
    setFormError(null);
    onSubmit(formData);
  }, [formData, onSubmit, brandHistory]);

  // Her input için ayrı handler'lar
  const handleNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
  }, []);

  const handleBrandChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, brand: e.target.value }));
    setShowBrandDropdown(true);
  }, []);

  const handleCategoryChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, category: value }));
    setCategoryFilter(value);
    setShowCategoryDropdown(true);
  }, []);
  
  const selectCategory = useCallback((categoryName: string) => {
    setFormData(prev => ({ ...prev, category: categoryName }));
    setCategoryFilter(categoryName);
    setShowCategoryDropdown(false);
  }, []);

  const selectBrand = useCallback((brandName: string) => {
    setFormData(prev => ({ ...prev, brand: brandName }));
    setShowBrandDropdown(false);
  }, []);

  // Kategori ve Marka dropdown'ı dışına tıklamayı dinle
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node) &&
        categoryInputRef.current &&
        !categoryInputRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
      if (
        brandDropdownRef.current &&
        !brandDropdownRef.current.contains(event.target as Node) &&
        brandInputRef.current &&
        !brandInputRef.current.contains(event.target as Node)
      ) {
        setShowBrandDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtre değiştiğinde highlight'ı sıfırla
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [categoryFilter]);

  useEffect(() => {
    setHighlightedBrandIndex(-1);
  }, [formData.brand]);

  // Klavye navigasyonu için
  const handleBrandKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (showBrandDropdown && filteredBrands.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedBrandIndex(prev => (prev < filteredBrands.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedBrandIndex(prev => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedBrandIndex > -1) {
            selectBrand(filteredBrands[highlightedBrandIndex]);
          }
          break;
        case 'Tab':
          if (highlightedBrandIndex > -1) {
            e.preventDefault();
            selectBrand(filteredBrands[highlightedBrandIndex]);
            categoryInputRef.current?.focus();
          }
          break;
        case 'Escape':
          setShowBrandDropdown(false);
          break;
      }
    }
  }, [showBrandDropdown, filteredBrands, highlightedBrandIndex, selectBrand]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (showCategoryDropdown && filteredCategories.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => (prev < filteredCategories.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex > -1) {
            selectCategory(filteredCategories[highlightedIndex]);
          }
          break;
        case 'Tab':
          if (highlightedIndex > -1) {
            e.preventDefault();
            selectCategory(filteredCategories[highlightedIndex]);
            submitButtonRef.current?.focus();
          }
          break;
        case 'Escape':
          setShowCategoryDropdown(false);
          break;
      }
    }
  }, [showCategoryDropdown, filteredCategories, highlightedIndex, selectCategory]);

  // Highlight edilen elemanı görünür kıl
  useEffect(() => {
    if (highlightedBrandIndex < 0 || !brandDropdownRef.current) return;
    const highlightedItem = brandDropdownRef.current.children[highlightedBrandIndex] as HTMLLIElement;
    if (highlightedItem) {
      highlightedItem.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [highlightedBrandIndex]);

  useEffect(() => {
    if (highlightedIndex < 0 || !categoryDropdownRef.current) return;
    const highlightedItem = categoryDropdownRef.current.children[highlightedIndex] as HTMLLIElement;
    if (highlightedItem) {
      highlightedItem.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [highlightedIndex]);

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-2xl shadow-lg p-8 max-w-xl mx-auto border border-blue-100">
      <h2 className="text-3xl font-extrabold mb-6 text-center bg-gradient-to-r from-blue-600 via-blue-400 to-green-400 bg-clip-text text-transparent drop-shadow-lg">Ürün Bilgileri</h2>
      <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-1 ml-1">Ürün Adı</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-1a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z"/></svg>
            </span>
            <input 
              type="text" 
              name="name" 
              className="w-full border border-blue-200 rounded-lg pl-10 pr-3 py-2.5 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition outline-none bg-white placeholder:italic placeholder:text-gray-400"
              value={formData.name} 
              onChange={handleNameChange} 
              required 
              placeholder="Ürün adını girin..." 
            />
          </div>
        </div>
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-1 ml-1">Marka</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-1a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z"/></svg>
            </span>
            <input 
              type="text" 
              name="brand" 
              className="w-full border border-blue-200 rounded-lg pl-10 pr-3 py-2.5 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition outline-none bg-white placeholder:italic placeholder:text-gray-400"
              value={formData.brand} 
              ref={brandInputRef}
              onChange={handleBrandChange} 
              onKeyDown={handleBrandKeyDown}
              onFocus={() => setShowBrandDropdown(true)}
              required 
              placeholder="Marka adını girin..." 
              autoComplete="off"
            />
            {showBrandDropdown && filteredBrands.length > 0 && (
              <ul ref={brandDropdownRef} className="absolute z-20 w-full bg-white border border-blue-300 rounded-lg shadow-lg max-h-48 overflow-auto mt-1">
                {filteredBrands.map((brand, index) => (
                  <li
                    key={brand}
                    onClick={() => selectBrand(brand)}
                    className={`px-4 py-2 hover:bg-blue-100 cursor-pointer ${index === highlightedBrandIndex ? 'bg-blue-100' : ''}`}
                  >
                    {brand}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="relative">
          <label className="block text-base font-semibold text-gray-700 mb-1 ml-1">Kategori</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Zm4 4h8m-8 4h5"/></svg>
            </span>
            <input 
              type="text" 
              name="category" 
              className="w-full border border-blue-200 rounded-lg pl-10 pr-3 py-2.5 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition outline-none bg-white placeholder:italic placeholder:text-gray-400"
              value={formData.category} 
              ref={categoryInputRef} 
              onFocus={() => setShowCategoryDropdown(true)}
              onChange={handleCategoryChange}
              onKeyDown={handleKeyDown}
              placeholder="Kategori seçin..." 
              required 
              autoComplete="off" 
            />
            {showCategoryDropdown && filteredCategories.length > 0 && (
              <ul ref={categoryDropdownRef} className="absolute z-10 w-full bg-white border border-blue-300 rounded-lg shadow-lg max-h-48 overflow-auto mt-1">
                {filteredCategories.map((cat, index) => (
                  <li 
                    key={cat} 
                    onClick={() => selectCategory(cat)} 
                    className={`px-4 py-2 hover:bg-blue-100 cursor-pointer ${index === highlightedIndex ? 'bg-blue-100' : ''}`}
                  >
                    {cat}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {formError && <p className="text-red-500 text-center font-semibold">{formError}</p>}
        <div className="text-center pt-4">
          <Button 
            ref={submitButtonRef}
            type="submit" 
            size="lg" 
            className="glossy-btn rounded-full bg-gradient-to-b from-blue-500 to-blue-700 text-white font-semibold shadow-lg px-10"
          >
            Anahtar Kelime Analizi
          </Button>
        </div>
      </form>
    </div>
  );
});

ProductForm.displayName = 'ProductForm';

// Step mapping
const stepUrls = [
  'product-info',
  'keyword-analysis', 
  'content-creation',
  'final-touches'
];

const urlToStep = {
  'product-info': 0,
  'keyword-analysis': 1,
  'content-creation': 2,
  'final-touches': 3
};

interface MultiStepContentGenerationProps {
  initialStep?: number;
}

export default function MultiStepContentGeneration({ initialStep = 0 }: MultiStepContentGenerationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeStep, setActiveStep] = useState(initialStep);

  // URL değişikliklerini dinle ve step'i güncelle
  useEffect(() => {
    const currentPath = pathname.split('/').pop();
    if (currentPath && urlToStep[currentPath as keyof typeof urlToStep] !== undefined) {
      const newStep = urlToStep[currentPath as keyof typeof urlToStep];
      if (newStep !== activeStep) {
        setActiveStep(newStep);
      }
    }
  }, [pathname, activeStep]);
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Sayfa yüklendiğinde localStorage'dan veriyi geri yükle veya temizle
  useEffect(() => {
    if (isInitialized || typeof window === 'undefined') return;
    
    try {
      const currentPath = pathname.split('/').pop();
      const isMainPage = pathname === '/content-generation' || currentPath === 'product-info';
      
      // URL'de return parametresi varsa geri dönüş durumu
      const urlParams = new URLSearchParams(window.location.search);
      const isReturn = urlParams.get('return') === 'true';
      
      if (isReturn || !isMainPage) {
        // Geri dönüş durumunda veya alt sayfalarda localStorage'dan yükle
        const savedProductInfo = localStorage.getItem('productInfo');
        const savedKeywords = localStorage.getItem('keywords');
        const savedSelectedKeywords = localStorage.getItem('selectedKeywords');
        const savedGeneratedContent = localStorage.getItem('generatedContent');
        const savedFinalContent = localStorage.getItem('finalContent');
        const savedHumanizedContent = localStorage.getItem('humanizedContent');

        if (savedProductInfo) {
          setProductInfo(JSON.parse(savedProductInfo));
        }
        if (savedKeywords) {
          setKeywords(JSON.parse(savedKeywords));
        }
        if (savedSelectedKeywords) {
          setSelectedKeywords(JSON.parse(savedSelectedKeywords));
        }
        if (savedGeneratedContent) {
          setGeneratedContent(savedGeneratedContent);
        }
        if (savedFinalContent) {
          setFinalContent(savedFinalContent);
        }
        if (savedHumanizedContent) {
          setHumanizedContent(savedHumanizedContent);
        }
      } else if (isMainPage && !isReturn) {
        // Ana sayfada ve geri dönüş değilse (navbar'dan geliyorsa) localStorage'ı temizle
        localStorage.removeItem('productInfo');
        localStorage.removeItem('keywords');
        localStorage.removeItem('selectedKeywords');
        localStorage.removeItem('generatedContent');
        localStorage.removeItem('finalContent');
        localStorage.removeItem('humanizedContent');
        
        // State'leri de temizle
        setProductInfo(null);
        setKeywords([]);
        setSelectedKeywords([]);
        setGeneratedContent('');
        setFinalContent('');
        setHumanizedContent('');
      }
    } catch (error) {
      console.error('localStorage işlem hatası:', error);
    }
    
    setIsInitialized(true);
  }, [isInitialized, pathname]);

  const [keywords, setKeywords] = useState<any[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  // Seçili anahtar kelimeleri localStorage'a kaydet
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem('selectedKeywords', JSON.stringify(selectedKeywords));
    }
  }, [selectedKeywords, isInitialized]);
  const [keywordLoading, setKeywordLoading] = useState(false);
  const [keywordError, setKeywordError] = useState<string | null>(null);

  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [finalContent, setFinalContent] = useState<string>('');
  const [humanizeLoading, setHumanizeLoading] = useState<boolean>(false);
  const [humanizeError, setHumanizeError] = useState<string | null>(null);
  const [humanizedContent, setHumanizedContent] = useState<string>('');
  const [aiCheckLoading, setAiCheckLoading] = useState(false);
  const [aiCheckResult, setAiCheckResult] = useState<any>(null);

  // Otomatik içerik üretimi kaldırıldı; içerik kullanıcı tarafından tetiklenecek

  // Step değiştirme fonksiyonu (URL ile senkronize)
  const changeStep = useCallback((newStep: number, isReturn = false) => {
    if (newStep >= 0 && newStep < stepUrls.length) {
      setActiveStep(newStep);
      const url = `/content-generation/${stepUrls[newStep]}${isReturn ? '?return=true' : ''}`;
      router.push(url);
    }
  }, [router]);

  // Form gönderim handler'ı
  const handleProductSubmit = useCallback((data: ProductInfo) => {
    // Eğer ürün bilgileri değiştiyse, sadece keywords'leri temizle
    const isProductChanged = !productInfo || 
      productInfo.name !== data.name || 
      productInfo.brand !== data.brand || 
      productInfo.category !== data.category;
    
    setProductInfo(data);
    if (typeof window !== 'undefined') {
      localStorage.setItem('productInfo', JSON.stringify(data));
    }
    
    if (isProductChanged) {
      // Sadece ürün bilgileri değiştiyse anahtar kelime verilerini temizle
      setSelectedKeywords([]);
      setKeywords([]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('selectedKeywords');
        localStorage.removeItem('keywords');
      }
      // İçerik verilerini de temizle
      setGeneratedContent('');
      setFinalContent('');
      setHumanizedContent('');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('generatedContent');
        localStorage.removeItem('finalContent');
        localStorage.removeItem('humanizedContent');
      }
    }
    
    changeStep(1);
  }, [changeStep, productInfo]);
  
  // Anahtar Kelime Analizi
  const handleKeywordAnalysis = async () => {
    if (!productInfo) return;
    setKeywordLoading(true);
    setKeywordError(null);
    try {
      // API'ye gönderirken kategori adını URL'ye çevir
      const categoryUrl = (categories as any)[productInfo.category] || productInfo.category;
      
      const response = await fetch('/api/keyword-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: productInfo.name,
          brand: productInfo.brand,
          category: productInfo.category, // Kategori adını gönder
          categoryUrl: categoryUrl // URL'yi ayrı gönder (gerekirse kullanmak için)
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Anahtar kelime analizi başarısız oldu.');
      }
      const data = await response.json();
      setKeywords(data.keywords || []);
      if (typeof window !== 'undefined') {
        localStorage.setItem('keywords', JSON.stringify(data.keywords || []));
      }
    } catch (error: any) {
      setKeywordError(error.message);
    } finally {
      setKeywordLoading(false);
    }
  };

  // İçerik Üretimi
  const handleGenerateContent = async () => {
      if (!productInfo || selectedKeywords.length === 0) return;
      setIsGenerating(true);
      setGeneratedContent('');
      setFinalContent('');
      try {
          // API'ye gönderirken kategori adını URL'ye çevir
          const categoryUrl = (categories as any)[productInfo.category] || productInfo.category;
          
          const response = await fetch('/api/generate-content', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                productName: productInfo.name,
                brand: productInfo.brand,
                category: categoryUrl, // Generate content için URL gerekli
                keywords: selectedKeywords 
              }),
          });
          if (!response.ok) throw new Error('İçerik üretme başarısız.');
          const data = await response.json();
          
          // GPT'den gelen içeriği kullan (ürün ismi GPT'den gelecek)
          const fullContent = data.content;
          
          setGeneratedContent(fullContent);
          setFinalContent(fullContent);
          if (typeof window !== 'undefined') {
            localStorage.setItem('generatedContent', fullContent);
            localStorage.setItem('finalContent', fullContent);
          }
      } catch (error) {
          console.error(error);
      } finally {
          setIsGenerating(false);
      }
  };

  // Son Vuruş - AI Kontrolü
  const handleAiCheck = async () => {
    const contentToCheck = humanizedContent || finalContent;
    if (!contentToCheck) return;
        setAiCheckLoading(true);
        setAiCheckResult(null);
        try {
          const res = await fetch("/api/ai-content-tools/detect", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: contentToCheck })
          });
          const data = await res.json();
          console.log('AI Check Response:', data); // Debug için
          console.log('Overall AI Probability:', data.overall_ai_probability);
          console.log('Paragraphs:', data.paragraphs);
          console.log('Scores:', data.scores);
          
          // API response format dönüştürme
          const result = {
            ai_probability: data.overall_ai_probability || 0,
            sentence_results: data.paragraphs && data.scores ? data.paragraphs.map((paragraph: string, index: number) => ({
              sentence: paragraph,
              ai_prob: data.scores[index] || 0
            })) : [],
            error: data.error || null,
            clusters: data.clusters || []
          };
          
          setAiCheckResult(result);
        } catch (e) {
          setAiCheckResult({ error: "AI kontrolü başarısız oldu." });
        } finally {
          setAiCheckLoading(false);
        }
  };

  // Son Vuruş - Akıllı Selective Humanize
  const handleHumanize = async () => {
    if (!finalContent || !aiCheckResult) {
      setHumanizeError("Önce AI kontrolü yapın!");
      return;
    }

    setHumanizeLoading(true);
    setHumanizeError(null);
    
    try {
      // AI riski orta/yüksek olan paragrafları tespit et (>40% AI riski)
      // UI'da sarı ve kırmızı olan tüm bölümler doğallaştırılacak
      const aiRiskParagraphs = aiCheckResult.sentence_results?.filter(
        (result: any) => result.ai_prob > 0.4
      ) || [];

      console.log('AI Check Result:', aiCheckResult);
      console.log('Sentence Results:', aiCheckResult.sentence_results);
      console.log('AI Risk Paragraphs (>40%):', aiRiskParagraphs);

      if (aiRiskParagraphs.length === 0) {
        setHumanizeError("Doğallaştırılması gereken AI riski olan paragraf bulunamadı. (Tüm paragraflar %40'ın altında)");
        setHumanizeLoading(false);
        return;
      }

      console.log(`🔄 ${aiRiskParagraphs.length} paragraf doğallaştırılacak`);

      // AI riski olan paragrafların sentence'larını al
      const selectedSentences = aiRiskParagraphs.map((p: any) => p.sentence);
      
      // Tüm metni ve seçili paragrafları humanization API'sine gönder
      const res = await fetch("/api/ai-content-tools/humanize", {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ 
          fullText: humanizedContent || finalContent,
          selected: selectedSentences
        })
      });
      
      const data = await res.json();
      
      if (data.error) {
        setHumanizeError(data.error);
        setHumanizeLoading(false);
        return;
      }
      
      const updatedContent = data.humanizedText || (humanizedContent || finalContent);

      setHumanizedContent(updatedContent);
      if (typeof window !== 'undefined') {
        localStorage.setItem('humanizedContent', updatedContent);
      }

      console.log("✅ Selective humanization tamamlandı");

      // Otomatik AI kontrolü yap
      setAiCheckLoading(true);
      const res2 = await fetch("/api/ai-content-tools/detect", {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ text: updatedContent })
      });
      const newCheckData = await res2.json();
      
      // Response formatını düzelt
      const newResult = {
        ai_probability: newCheckData.overall_ai_probability || 0,
        sentence_results: newCheckData.paragraphs && newCheckData.scores ? 
          newCheckData.paragraphs.map((paragraph: string, index: number) => ({
            sentence: paragraph,
            ai_prob: newCheckData.scores[index] || 0
          })) : [],
        error: newCheckData.error || null,
        clusters: newCheckData.clusters || []
      };
      
      setAiCheckResult(newResult);
      setAiCheckLoading(false);
      
      console.log(`🎯 Yeni AI riski: ${(newResult.ai_probability * 100).toFixed(1)}%`);

    } catch (e: any) {
      console.error("Humanization error:", e);
      setHumanizeError(e.message || "İnsancıllaştırılma işlemi başarısız oldu.");
      setAiCheckLoading(false);
    } finally {
      setHumanizeLoading(false);
    }
  };

  const Step2KeywordAnalysis = () => (
    <div className="bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-2xl shadow-lg p-8 border border-blue-100 relative">
      {productInfo && (
        <div className="mb-8 relative max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-2xl shadow-lg p-8 border border-blue-100 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-400/20 to-blue-500/20 rounded-full -ml-12 -mb-12"></div>
            
            <div className="relative z-10">
              {/* Header - Anahtar Kelime Analizi başlığı */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl shadow-lg mb-4">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-white">
                    <path stroke="currentColor" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
                <h3 className="text-3xl font-extrabold bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 bg-clip-text text-transparent break-words mb-2 drop-shadow-sm">
                  Anahtar Kelime Analizi
                </h3>
                <p className="text-gray-600 text-sm font-medium">Ürününüz için teknik anahtar kelimeler bulup analiz edin</p>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ürün Bilgileri Card */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-shadow duration-300 text-center">
                  {/* Büyük Kullanıcı İkonu */}
                  <div className="text-blue-500 mx-auto mb-4">
                    <svg width="64" height="64" fill="none" viewBox="0 0 24 24" className="mx-auto">
                      <path stroke="currentColor" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  
                  {/* Ürün Adı */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 font-medium mb-1">Ürün Adı</div>
                    <div className="text-lg font-bold text-gray-800 break-words">{productInfo.name}</div>
                  </div>

                  {/* Marka */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 font-medium mb-1">Marka</div>
                    <div className="text-lg font-bold text-gray-800">{productInfo.brand}</div>
                  </div>

                  {/* Kategori */}
                  <div>
                    <div className="text-sm text-gray-500 font-medium mb-1">Kategori</div>
                    <div className="text-lg font-bold text-gray-800">{productInfo.category}</div>
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
                  <div className="space-y-4">
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
                    
                    {/* Seçili Anahtar Kelimeler Balonları */}
                    {selectedKeywords && selectedKeywords.length > 0 && (
                      <div className="pt-2 border-t border-gray-200/50">
                        <div className="text-xs text-gray-500 font-medium mb-2">Seçili Kelimeler:</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedKeywords.map((kw, i) => (
                            <span 
                              key={i} 
                              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm hover:shadow-md transition-shadow duration-200 cursor-default"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {keywordLoading ? (
        <div className="text-center p-8">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
          <p className="mt-4 text-lg font-semibold text-gray-600">Anahtar kelimeler analiz ediliyor...</p>
        </div>
      ) : keywordError ? (
        <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-lg font-bold text-red-700">Bir Hata Oluştu</p>
            <p className="mt-2 text-red-600">{keywordError}</p>
            <Button onClick={handleKeywordAnalysis} className="mt-4">Tekrar Dene</Button>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          
          {keywords.length > 0 ? (
          <>
            <div className="flex justify-center items-center gap-4 mt-8 mb-8">
                <Button 
                    size="lg" 
                    onClick={() => changeStep(0, true)} 
                    className="glossy-btn rounded-full bg-gradient-to-b from-gray-400 to-gray-200 text-gray-900 font-semibold shadow-md px-10"
                >
                  Ürün Bilgileri
                </Button>
                <Button 
                  size="lg" 
                  onClick={() => changeStep(2)} 
                  disabled={selectedKeywords.length === 0}
                  className="glossy-btn rounded-full bg-gradient-to-b from-blue-500 to-blue-700 text-white font-semibold shadow-lg px-10 flex-grow"
                >
                  {selectedKeywords && selectedKeywords.length > 0 
                    ? `Seçili ${selectedKeywords.length} Kelimeyle Devam Et` 
                    : 'Devam Etmek İçin Seçim Yapın'}
                </Button>
              </div>

            <h3 className="text-xl font-bold text-gray-700 mb-4 text-center">Anahtar Kelimeler</h3>
            <div className="space-y-3">
              {keywords.map((kw, i) => (
                <button key={i} onClick={() => {
                  const newSelection = selectedKeywords.includes(kw.text)
                            ? selectedKeywords.filter(k => k !== kw.text)
                    : [...selectedKeywords, kw.text];
                  setSelectedKeywords(newSelection);
                }} className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all duration-200 text-left shadow-sm ${selectedKeywords.includes(kw.text) ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white hover:border-blue-500 hover:shadow-md border-gray-300'}`}>
                  <span className="font-semibold text-lg">"{kw.text}"</span>
                  <div className="flex items-center space-x-4">
                    <span className={`text-sm font-medium ${selectedKeywords.includes(kw.text) ? 'text-blue-100' : 'text-gray-500'}`}>Trend:</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className={`${selectedKeywords.includes(kw.text) ? 'bg-white' : 'bg-blue-500'} h-2 rounded-full`} style={{ width: `${kw.trend}%` }}></div>
                    </div>
    
                    <span className={`font-bold w-10 text-right ${selectedKeywords.includes(kw.text) ? 'text-white' : 'text-blue-600'}`}>{`%${kw.trend}`}</span>
                    
                    <div className="w-6 h-6">
                            {selectedKeywords.includes(kw.text) && (
                         <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            )}
                    </div>
                  </div>
                        </button>
                      ))}
                  </div>

            <div className="sticky bottom-0 -mx-8 -mb-8 px-8 pt-6 pb-8 mt-8 text-center bg-gradient-to-t from-blue-100/90 via-blue-50/90 to-transparent backdrop-blur-sm">
              <Button 
                size="lg" 
                onClick={() => changeStep(2)} 
                disabled={selectedKeywords.length === 0}
                className="glossy-btn rounded-full bg-gradient-to-b from-blue-500 to-blue-700 text-white font-semibold shadow-lg px-10 w-full max-w-md"
              >
                {selectedKeywords && selectedKeywords.length > 0 
                  ? `Seçili ${selectedKeywords.length} Kelimeyle Devam Et` 
                  : 'Devam Etmek İçin Seçim Yapın'}
              </Button>
            </div>
          </>
          ) : (
            <div className="text-center py-5 mt-8">
              <div className="flex justify-center items-center gap-4 mb-4">
                <Button 
                  size="lg" 
                  onClick={() => changeStep(0, true)} 
                  className="glossy-btn rounded-full bg-gradient-to-b from-gray-400 to-gray-200 text-gray-900 font-semibold shadow-md px-10"
                >
                  Ürün Bilgileri
                </Button>
                <Button 
                  onClick={handleKeywordAnalysis} 
                  size="lg"
                  className="glossy-btn rounded-full bg-gradient-to-b from-blue-500 to-blue-700 text-white font-semibold shadow-lg px-10"
                >
                  Analizi Başlat
                </Button>
              </div>
              <p className="text-gray-600 mb-4">Ürün için anahtar kelime ve trend analizi yapmak için butona tıklayın.</p>
            </div>
          )}
        </div>
      )}


    </div>
  );



  const Step3ContentGeneration = () => {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-gray-50 to-indigo-50 rounded-2xl shadow-lg p-8 border border-gray-200/80">
         <style jsx>{`
            .glossy-btn {
              position: relative;
              border: 1px solid rgba(0, 0, 0, 0.25);
              text-shadow: 0 1px 1px rgba(0,0,0,0.3);
              transition: all 0.15s ease-out;
              overflow: hidden;
            }
            .glossy-btn::before {
              content: '';
              position: absolute;
              top: 1px;
              left: 5%;
              width: 90%;
              height: 50%;
              border-radius: 9999px;
              background: linear-gradient(to bottom, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.15));
            }
            .glossy-btn:active {
              transform: translateY(1px);
              box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
            }
            .glossy-btn:disabled::before {
              display: none;
            }
          `}</style>
          
          <InfoPanel productInfo={productInfo} keywords={selectedKeywords} />

          <div className="my-8 border-t border-b border-gray-200/80 py-6">
            <div className="flex justify-center items-center flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => changeStep(1, true)}
                className="glossy-btn rounded-full bg-gradient-to-b from-gray-400 to-gray-200 text-gray-900 font-semibold shadow-md px-8"
              >
                Anahtar Kelime Analizi
              </Button>
              
              <Button 
                size="lg" 
                onClick={handleGenerateContent} 
                disabled={isGenerating} 
                className="glossy-btn rounded-full bg-gradient-to-b from-blue-500 to-blue-700 text-white font-semibold shadow-lg px-8"
              >
                {isGenerating ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <span>İçerik Üretiliyor...</span>
                  </div>
                ) : 'İçerik Üret'}
              </Button>
              
              {generatedContent && (
                <Button
                  size="lg"
                  onClick={() => {
                    if (!generatedContent || !productInfo) return;
                    const html = `<!DOCTYPE html><html><head><meta charset='utf-8'></head><body><h1 style='font-size:2em;font-weight:bold;margin-bottom:1em;'>${productInfo.name}</h1>${generatedContent}</body></html>`;
                    const blob = new Blob([html], { type: "application/msword" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${productInfo.name}.doc`;
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => {
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }, 0);
                  }}
                  className="glossy-btn rounded-full bg-gradient-to-b from-green-500 to-green-700 text-white font-semibold shadow-lg px-8 flex items-center"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Word Olarak İndir
                </Button>
              )}
            </div>
          </div>

          {isGenerating && (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              <p className="mt-4 text-lg font-semibold text-gray-600">İçeriğiniz hazırlanıyor...</p>
              <p className="text-sm text-gray-500">Bu işlem birkaç dakika sürebilir.</p>
            </div>
          )}

          {generatedContent && !isGenerating && (
            <div className="mt-8">
              <div className="pb-4 mb-4 border-b border-gray-200">
                <h2 className="text-2xl md:text-3xl font-bold break-words text-center bg-gradient-to-r from-blue-600 to-indigo-500 text-transparent bg-clip-text">
                  {productInfo?.name}
                </h2>
              </div>
              <div
                className="prose max-w-none prose-h3:font-bold prose-p:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: generatedContent.replace(/\n/g, '<br />') }}
              />
            </div>
          )}
      </div>
    );
  };

  function Step4FinalTouches() {
    return (
      <div className="bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-2xl shadow-lg p-8 border border-blue-100">
        {/* Son Vuruş InfoPanel - ürün ismi yerine Son Vuruş başlığı */}
        <div className="mb-8 relative max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-2xl shadow-lg p-8 border border-blue-100 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-400/20 to-blue-500/20 rounded-full -ml-12 -mb-12"></div>
            
            <div className="relative z-10">
              {/* Header - Son Vuruş başlığı */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-lg mb-4">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-white">
                    <path stroke="currentColor" strokeWidth="2" d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 bg-clip-text text-transparent break-words mb-2 drop-shadow-sm">
                  Son Vuruş
                </h3>
                <p className="text-gray-600 text-sm font-medium">Metni düzenleyin, AI oranını kontrol edin ve içeriğinizi mükemmelleştirin</p>
              </div>

              {/* Content Grid - Standart Ürün Bilgileri Kartı */}
              {productInfo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sol: Ürün Bilgileri Card */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-shadow duration-300 text-center">
                    {/* Büyük Kullanıcı İkonu */}
                    <div className="text-blue-500 mx-auto mb-4">
                      <svg width="64" height="64" fill="none" viewBox="0 0 24 24" className="mx-auto">
                        <path stroke="currentColor" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                    
                    {/* Ürün Adı */}
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 font-medium mb-1">Ürün Adı</div>
                      <div className="text-lg font-bold text-gray-800 break-words">{productInfo.name}</div>
                    </div>

                    {/* Marka */}
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 font-medium mb-1">Marka</div>
                      <div className="text-lg font-bold text-gray-800">{productInfo.brand}</div>
                    </div>

                    {/* Kategori */}
                    <div>
                      <div className="text-sm text-gray-500 font-medium mb-1">Kategori</div>
                      <div className="text-lg font-bold text-gray-800">{productInfo.category}</div>
                    </div>
                  </div>

                  {/* Sağ: Anahtar Kelimeler Card */}
                  {selectedKeywords && selectedKeywords.length > 0 && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-white">
                            <path stroke="currentColor" strokeWidth="2" d="M15 7a8 8 0 11-16 0 8 8 0 0116 0zM9 12l2 2 4-4"/>
                          </svg>
                        </div>
                        <h4 className="text-lg font-bold text-gray-800">Seçili Anahtar Kelimeler</h4>
                      </div>
                      <div className="flex flex-wrap gap-3 justify-center">
                        {selectedKeywords.map((kw, i) => (
                          <span 
                            key={i} 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm hover:shadow-md transition-shadow duration-200 cursor-default"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-3 font-medium text-center">{selectedKeywords.length} anahtar kelime seçildi</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Butonları yukarı taşıdık */}
        <div className="my-8 border-t border-b border-gray-200/80 py-6">
          <div className="flex justify-center items-center flex-wrap gap-4">
            <Button 
              size="lg" 
              onClick={() => changeStep(2, true)} 
              className="glossy-btn rounded-full bg-gradient-to-b from-gray-400 to-gray-200 text-gray-900 font-semibold shadow-md px-8"
            >
              Geri
            </Button>
            <Button 
              size="lg"
              onClick={handleAiCheck} 
              disabled={aiCheckLoading || (!humanizedContent && !finalContent)}
              className="glossy-btn rounded-full bg-gradient-to-b from-blue-500 to-blue-700 text-white font-semibold shadow-lg px-6"
            >
              {aiCheckLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Kontrol...</> : 'AI Kontrolü Yap'}
            </Button>
            <Button 
              size="lg"
              onClick={handleHumanize} 
              disabled={humanizeLoading || !finalContent || !aiCheckResult}
              className="glossy-btn rounded-full bg-gradient-to-b from-purple-500 to-purple-700 text-white font-semibold shadow-lg px-6"
            >
              {humanizeLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Doğallaştırılıyor...</> : 'Doğallaştır'}
            </Button>
          </div>
          
          {/* Humanize Error Mesajı */}
          {humanizeError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700 font-medium">{humanizeError}</p>
              </div>
            </div>
          )}

          {/* AI Kontrolü gerekli uyarısı */}
          {!aiCheckResult && finalContent && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-blue-700 font-medium">
                  Doğallaştırmadan önce AI kontrolü yapın. Sarı ve kırmızı renkli paragraflar doğallaştırılacak.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* İçerik Gösterimi - AI Highlight ile */}
        {(humanizedContent || finalContent) && (
          <div className="mt-8">
            <div className="pb-4 mb-4 border-b border-gray-200">
              <h2 className="text-2xl md:text-3xl font-bold break-words text-center bg-gradient-to-r from-blue-600 to-indigo-500 text-transparent bg-clip-text">
                {productInfo?.name}
              </h2>
            </div>
            <div className="bg-white rounded-lg p-6 border shadow-sm">
              <div className="prose max-w-none prose-h3:font-bold prose-p:leading-relaxed">
                {aiCheckResult && aiCheckResult.sentence_results && aiCheckResult.sentence_results.length > 0 ? (
                  // AI sonuçları varsa highlight'lanmış içerik göster
                  <div>
                    {aiCheckResult.sentence_results.map((item: any, index: number) => (
                      <div key={index}>
                        <div 
                          className={`mb-4 p-3 rounded-lg transition-all duration-200 ${
                            item.ai_prob > 0.7 
                              ? 'bg-red-100 border-l-4 border-red-500 text-red-900' 
                              : item.ai_prob > 0.4 
                              ? 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900'
                              : 'bg-green-100 border-l-4 border-green-500 text-green-900'
                          }`}
                          dangerouslySetInnerHTML={{ 
                            __html: item.sentence.replace(/\n/g, '<br />') 
                          }}
                        />
                        <div className="text-xs text-gray-500 mb-2">
                          AI Olasılığı: <span className="font-semibold">{Math.round(item.ai_prob * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // AI sonuçları yoksa normal içerik göster
                  <div dangerouslySetInnerHTML={{ 
                    __html: (humanizedContent || finalContent).replace(/\n/g, '<br />') 
                  }} />
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Yuvarlak AI Analiz Paneli */}
        <div className="max-w-sm mx-auto mt-8">
          <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">AI Analiz Sonucu</h3>
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            {aiCheckLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                <p className="text-gray-600">İçerik analiz ediliyor...</p>
              </div>
            ) : aiCheckResult ? (
              <div>
                {aiCheckResult.error ? (
                  <p className="text-red-500 text-center">{aiCheckResult.error}</p>
                ) : (
                  <>
                    {/* Yuvarlak Grafik */}
                    <div className="flex items-center justify-center mb-6">
                      <div className="relative">
                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                          {/* Background circle */}
                          <circle
                            cx="60"
                            cy="60"
                            r="54"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            className="text-gray-200"
                          />
                          {/* Progress circle */}
                          <circle
                            cx="60"
                            cy="60"
                            r="54"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 54}`}
                            strokeDashoffset={`${2 * Math.PI * 54 * (1 - aiCheckResult.ai_probability)}`}
                            className={`transition-all duration-1000 ${
                              aiCheckResult.ai_probability > 0.7 ? 'text-red-500' :
                              aiCheckResult.ai_probability > 0.4 ? 'text-yellow-500' : 'text-green-500'
                            }`}
                            strokeLinecap="round"
                          />
                        </svg>
                        {/* Percentage in center */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${
                              aiCheckResult.ai_probability > 0.7 ? 'text-red-600' :
                              aiCheckResult.ai_probability > 0.4 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {Math.round(aiCheckResult.ai_probability * 100)}%
                            </div>
                            <div className="text-xs text-gray-500 font-medium">AI</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-700 mb-2">
                        {aiCheckResult.ai_probability > 0.7 ? '🔴 Yüksek AI Riski' :
                         aiCheckResult.ai_probability > 0.4 ? '🟡 Orta AI Riski' : '🟢 Düşük AI Riski'}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                        {aiCheckResult.ai_probability > 0.7 ? 'İçerik büyük oranda AI tarafından üretilmiş görünüyor' :
                         aiCheckResult.ai_probability > 0.4 ? 'İçerik kısmen AI tarafından üretilmiş olabilir' : 
                         'İçerik büyük oranda insan tarafından yazılmış görünüyor'}
                      </p>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">
                          💡 Yukarıdaki içerikte renkli bölümler AI olasılığını gösterir
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ): (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-gray-600">AI içeriğini tespit etmek için kontrolü başlatın.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <ProductForm onSubmit={handleProductSubmit} initialData={productInfo} key={productInfo ? 'filled' : 'empty'} />;
      case 1:
        return <Step2KeywordAnalysis />;
      case 2:
        return <Step3ContentGeneration />;
      // case 3: Step4FinalTouches - GEÇİCİ OLARAK KAPALI
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
        {/* Adım Sekmeleri */}
        <div className="mb-8">
            <div className="flex items-center justify-center space-x-2 sm:space-x-4">
                {steps.map((step, index) => (
                    <div key={step.key} className="flex items-center">
                  <button
                            className={`flex items-center space-x-2 focus:outline-none`}
                            onClick={() => {
                                // Adımlar arası geçiş kontrolü
                                if (index < activeStep || (index === 1 && productInfo) || (index === 2 && selectedKeywords.length > 0) || (index === 3 && generatedContent)) {
                                    changeStep(index)
                                }
                            }}
                        >
                            <span className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-sm sm:text-base font-bold transition-all duration-300 ${activeStep >= index ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                {index + 1}
                            </span>
                            <span className={`hidden md:inline-block font-medium ${activeStep >= index ? 'text-blue-700' : 'text-gray-500'}`}>
                                {step.label}
                            </span>
                  </button>
                        {index < steps.length - 1 && (
                            <div className={`w-12 h-1 mx-2 rounded-full ${activeStep > index ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                  )}
                </div>
                ))}
            </div>
          </div>

      <div className="mt-8">
        {renderStepContent()}
      </div>
    </div>
  );
} 
