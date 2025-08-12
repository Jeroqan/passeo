'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

// API'den dönen yanıtın tipini tanımlıyoruz
interface AnalysisResult {
  sentiment: 'Pozitif' | 'Nötr' | 'Negatif';
  categories: string[];
}

export default function ReviewAnalysisPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/review-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu.');
      }
      
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Yorum Analizi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Analiz edilecek yorumu buraya girin..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
          />
          <Button
            onClick={handleAnalysis}
            disabled={isLoading || text.trim().length < 5}
          >
            {isLoading ? 'Analiz Ediliyor...' : 'Analiz Et'}
          </Button>

          {error && (
            <div className="text-red-500 p-4 border border-red-500 rounded-md">
              <p>Hata: {error}</p>
            </div>
          )}

          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Analiz Sonucu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold">
                    Duygu Durumu: <Badge variant={result.sentiment === 'Pozitif' ? 'default' : result.sentiment === 'Negatif' ? 'destructive' : 'secondary'}>{result.sentiment}</Badge>
                  </p>
                  <div className="font-semibold">
                    Kategoriler:
                    <div className="flex flex-wrap gap-2 mt-2">
                      {result.categories.map((cat) => (
                        <Badge key={cat} variant="outline">{cat}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 