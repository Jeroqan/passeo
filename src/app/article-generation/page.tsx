'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CATEGORIES from '@/data/categories';

// Kategori tipi tanımı
interface Category {
  id: string;
  name: string;
}

export default function ArticleGenerationPage() {
  const [formData, setFormData] = useState({
    productName: '',
    brand: '',
    category: '',
    keyword: '',
  });
  const [generatedArticle, setGeneratedArticle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;

    setIsLoading(true);
    setError(null);
    setGeneratedArticle('');

    try {
      // API'ye gönderirken kategori adını URL'ye çevir
      const categoryUrl = CATEGORIES[formData.category as keyof typeof CATEGORIES] || formData.category;
      
      const response = await fetch('/api/generate-content/article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          category: categoryUrl
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('API yanıt vermiyor veya gövde boş.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        const parts = buffer.split('\\n\\n');
        
        // Son, muhtemelen tamamlanmamış parçayı buffer'da sakla
        buffer = parts.pop() || ''; 
        
        for (const part of parts) {
          if (part.startsWith('data:')) {
            const jsonStr = part.substring(5).trim();
            if (jsonStr === '[DONE]') {
              break; 
            }
            try {
              const parsed = JSON.parse(jsonStr);

              // Test mock'undan gelen {type: 'content', value: '...'} formatını işle
              if (parsed.type === 'content') {
                 setGeneratedArticle(prev => prev + parsed.value);
              }
              // Vercel AI SDK'dan gelen '0:"<chunk>"' formatını işle
              else if (typeof parsed === 'string' && parsed.startsWith('0:')) {
                const content = JSON.parse(parsed.substring(2));
                setGeneratedArticle(prev => prev + content);
              }
            } catch (err) {
              console.error('SSE JSON parse hatası:', err, 'Gelen veri:', jsonStr);
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const isFormValid = formData.productName.trim() !== '' &&
    formData.brand.trim() !== '' &&
    formData.category.trim() !== '' &&
    formData.keyword.trim() !== '';

  return (
    <div className="flex flex-col h-full p-4">
       <div className="mb-4">
        <h1 className="text-2xl font-bold">Makale Üretme</h1>
        <p className="text-muted-foreground">Ürün bilgilerini girerek SEO uyumlu makaleler oluşturun.</p>
      </div>
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Makale Detayları</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="productName">Ürün Adı</Label>
                <Input
                  id="productName"
                  name="productName"
                  placeholder="Ürün Adı (Örn: iPhone 15 Pro Max)"
                  value={formData.productName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="brand">Marka</Label>
                <Input
                  id="brand"
                  name="brand"
                  placeholder="Marka (Örn: Apple)"
                  value={formData.brand}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="category">Kategori</Label>
                 <Select onValueChange={handleCategoryChange} value={formData.category}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORIES).map(([name, url]) => (
                        <SelectItem key={url} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
              <div>
                <Label htmlFor="keyword">Anahtar Kelime</Label>
                <Input
                  id="keyword"
                  name="keyword"
                  placeholder="Anahtar Kelime (Örn: en iyi kamera)"
                  value={formData.keyword}
                  onChange={handleInputChange}
                />
              </div>
              <Button type="submit" disabled={!isFormValid || isLoading}>
                {isLoading ? 'Üretiliyor...' : 'Makale Üret'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Oluşturulan Makale</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            {isLoading && !generatedArticle && <p>Makale oluşturuluyor, lütfen bekleyin...</p>}
            {error && <p className="text-red-500">{error}</p>}
            <div
              id="article-result"
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: generatedArticle }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 