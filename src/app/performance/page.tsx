'use client';

import { useState } from 'react';

export default function PerformanceAnalysis() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);
  const [performanceData, setPerformanceData] = useState<any>(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    // TODO: Gerçek veri entegrasyonu burada yapılacak
    // Şimdilik örnek veri
    setTimeout(() => {
      setPerformanceData({
        totalViews: 12500,
        organicTraffic: 8500,
        conversionRate: 3.2,
        averageTimeOnPage: 245,
        topKeywords: [
          { keyword: 'akıllı telefon', position: 3, traffic: 2500 },
          { keyword: 'iphone 15', position: 5, traffic: 1800 },
          { keyword: 'android telefon', position: 4, traffic: 1500 },
        ],
        contentPerformance: [
          { title: 'iPhone 15 İncelemesi', views: 4500, conversion: 4.5 },
          { title: 'Android vs iOS Karşılaştırması', views: 3800, conversion: 3.8 },
          { title: 'En İyi Akıllı Telefonlar', views: 3200, conversion: 3.2 },
        ],
      });
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Performans Analizi
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-2">
              Analiz Periyodu
            </label>
            <select
              id="period"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">Son 7 Gün</option>
              <option value="30d">Son 30 Gün</option>
              <option value="90d">Son 90 Gün</option>
            </select>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className={`px-6 py-2 rounded-md text-white font-medium ${
              isLoading ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {isLoading ? 'Analiz Yapılıyor...' : 'Analiz Et'}
          </button>
        </div>
      </div>

      {performanceData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Genel Metrikler */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Genel Metrikler
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm text-gray-500">Toplam Görüntülenme</div>
                <div className="text-2xl font-semibold text-gray-900">
                  {performanceData.totalViews.toLocaleString()}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm text-gray-500">Organik Trafik</div>
                <div className="text-2xl font-semibold text-gray-900">
                  {performanceData.organicTraffic.toLocaleString()}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm text-gray-500">Dönüşüm Oranı</div>
                <div className="text-2xl font-semibold text-gray-900">
                  %{performanceData.conversionRate}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm text-gray-500">Ortalama Süre</div>
                <div className="text-2xl font-semibold text-gray-900">
                  {performanceData.averageTimeOnPage} sn
                </div>
              </div>
            </div>
          </div>

          {/* En İyi Anahtar Kelimeler */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              En İyi Anahtar Kelimeler
            </h2>
            <div className="space-y-4">
              {performanceData.topKeywords.map((keyword: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                  <div>
                    <div className="font-medium text-gray-900">{keyword.keyword}</div>
                    <div className="text-sm text-gray-500">Sıralama: {keyword.position}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {keyword.traffic.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Görüntülenme</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* İçerik Performansı */}
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              İçerik Performansı
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İçerik Başlığı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Görüntülenme
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dönüşüm Oranı
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {performanceData.contentPerformance.map((content: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {content.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {content.views.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        %{content.conversion}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 