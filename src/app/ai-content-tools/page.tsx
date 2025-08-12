'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AiBlock, clusterAiBlocks } from '@/lib/textUtils';
import AiBlockClusters from '@/components/AiBlockClusters';

// Match the updated API response structure
interface AiDetectionApiResponse {
  paragraphs: string[];
  scores: number[];
  overall_ai_probability: number;
  results: {
    label: 'Yapay Zeka' | 'İnsan';
    score: number;
  }[];
}

export default function AiContentToolsPage() {
  const [textInput, setTextInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AiDetectionApiResponse | null>(null);
  const [isLoadingDetect, setIsLoadingDetect] = useState(false);
  const [isLoadingHumanize, setIsLoadingHumanize] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedParagraphs, setSelectedParagraphs] = useState<Set<string>>(new Set());
  const [threshold, setThreshold] = useState(0.1);

  // Dynamically calculate clusters on the client-side
  const clusters = useMemo(() => {
    if (!analysisResult) return [];
    const { paragraphs, scores } = analysisResult;
    return clusterAiBlocks(paragraphs, scores, threshold);
  }, [analysisResult, threshold]);

  // Create a set of AI paragraph texts for quick lookup based on dynamic clusters
  const aiParagraphs = useMemo(() => 
    new Set(clusters.flatMap(c => c.texts)),
    [clusters]
  );

  const handleDetect = async (textToAnalyze: string) => {
    if (!textToAnalyze.trim()) {
      setError('Lütfen analiz edilecek bir metin girin.');
      return;
    }
    setIsLoadingDetect(true);
    setError(null);
    setAnalysisResult(null);
    setSelectedParagraphs(new Set());

    try {
      const response = await fetch('/api/ai-content-tools/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToAnalyze }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? 'Bilinmeyen bir sunucu hatası oluştu.');
      }
      
      setAnalysisResult(data as AiDetectionApiResponse);
    } catch (err: any) {
      setError(err.message || 'Analiz sırasında bir hata oluştu.');
    } finally {
      setIsLoadingDetect(false);
    }
  };

  const handleParagraphSelection = (paragraphText: string, isChecked: boolean) => {
    setSelectedParagraphs(prev => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(paragraphText);
      } else {
        newSet.delete(paragraphText);
      }
      return newSet;
    });
  };

  const handleBlockSelect = (block: AiBlock, select: boolean) => {
    setSelectedParagraphs(prev => {
      const newSet = new Set(prev);
      block.texts.forEach(text => {
        if (select) {
          newSet.add(text);
        } else {
          newSet.delete(text);
        }
      });
      return newSet;
    });
  };

  const handleSelectAll = () => setSelectedParagraphs(new Set(aiParagraphs));
  const handleClearSelection = () => setSelectedParagraphs(new Set());

  const handleHumanize = async () => {
    if (selectedParagraphs.size === 0) {
      setError('Lütfen doğallaştırılacak en az bir paragraf seçin.');
      return;
    }

    setIsLoadingHumanize(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-content-tools/humanize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullText: textInput, selected: Array.from(selectedParagraphs) }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Doğallaştırma sırasında bilinmeyen bir sunucu hatası oluştu.');
      }

      const { humanizedText } = data;
      setTextInput(humanizedText);
      await handleDetect(humanizedText);

    } catch (err: any) {
      setError(err.message || 'Metin doğallaştırılırken bir hata oluştu.');
    } finally {
        setIsLoadingHumanize(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Gelişmiş AI İçerik Tespit ve Doğallaştırma Aracı</h1>
      </div>
      {error && (
        <div role="alert" className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <p className="font-bold">Bir Hata Oluştu</p>
          <p>{error}</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Metin Girişi</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="text-input-area"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Metni buraya yapıştırın..."
                className="w-full h-96"
              />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Analiz Sonucu</CardTitle>
            </CardHeader>
            <CardContent className="min-h-[400px] relative">
              {isLoadingDetect && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <p>Analiz ediliyor...</p>
                </div>
              )}
              {!isLoadingDetect && analysisResult && (
                <div>
                  <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                    <h3 className="text-lg font-semibold text-center">
                      AI Tarafından Yazılma Oranı: <span className="text-2xl font-bold text-red-500">
                        {Math.round(analysisResult.overall_ai_probability * 100)}%
                      </span>
                    </h3>
                  </div>
                  <div className="my-4">
                    <Label htmlFor="threshold-slider" className="block mb-2 text-sm font-medium text-gray-900">
                      AI Tespit Hassasiyeti: {threshold.toFixed(2)}
                    </Label>
                    <input
                      id="threshold-slider"
                      type="range"
                      min="0.01"
                      max="0.99"
                      step="0.01"
                      value={threshold}
                      onChange={e => setThreshold(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  {aiParagraphs.size > 0 && (
                    <div className="flex items-center gap-4 my-4">
                      <Button onClick={handleSelectAll} size="sm" variant="outline">Tüm AI Paragraflarını Seç</Button>
                      <Button onClick={handleClearSelection} size="sm" variant="outline">Seçimi Temizle</Button>
                      <p className="text-sm text-gray-500">{selectedParagraphs.size} paragraf seçildi.</p>
                    </div>
                  )}
                  <div className="text-base leading-relaxed space-y-4 max-h-60 overflow-y-auto pr-2 border p-2 rounded-md">
                    {analysisResult.paragraphs.map((p, index) => {
                      const isAi = aiParagraphs.has(p);
                      const checkboxId = `cb-${index}`;
                      if (isAi) {
                        return (
                           <div key={index} className="ai-paragraph-highlight flex items-start gap-2 bg-yellow-100 p-2 rounded-md">
                            <Checkbox
                              id={checkboxId}
                              checked={selectedParagraphs.has(p)}
                              onCheckedChange={(checked: boolean) => handleParagraphSelection(p, !!checked)}
                            />
                            <Label htmlFor={checkboxId} className="flex-1 cursor-pointer">{p}</Label>
                          </div>
                        )
                      }
                      return <p key={index}>{p}</p>
                    })}
                  </div>
                   <AiBlockClusters 
                    clusters={clusters}
                    selectedParagraphs={selectedParagraphs}
                    onBlockSelect={handleBlockSelect}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
       <div className="mt-8 flex justify-center gap-4">
        <Button onClick={() => handleDetect(textInput)} disabled={isLoadingDetect || !textInput.trim()}>
          {isLoadingDetect ? 'Analiz Ediliyor...' : 'AI Tespit Et'}
        </Button>
        <Button 
          onClick={handleHumanize} 
          disabled={isLoadingHumanize || isLoadingDetect || selectedParagraphs.size === 0} 
          className="w-56"
          variant="secondary"
        >
          {isLoadingHumanize ? 'Doğallaştırılıyor...' : `Seçili ${selectedParagraphs.size} Paragrafı Doğallaştır`}
        </Button>
      </div>
    </div>
  );
} 