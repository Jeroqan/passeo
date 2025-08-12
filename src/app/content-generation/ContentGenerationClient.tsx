"use client";
import { useEffect, useState } from "react";
import categories from "@/data/categories";
import { useRouter } from "next/navigation";

interface ProductInfo {
  name: string;
  brand: string;
  category: string;
}

export default function ContentGenerationClient() {
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const info = localStorage.getItem("productInfo");
      const kw = localStorage.getItem("selectedKeywords");
      if (info && kw) {
        setProductInfo(JSON.parse(info));
        setKeywords(JSON.parse(kw));
      }
    } catch (e) {
      setError("Ürün veya anahtar kelime bilgisi bulunamadı.");
    }
  }, []);

  const handleGenerate = async () => {
    if (!productInfo || !keywords.length) {
      setError("Ürün ve anahtar kelime bilgisi eksik.");
      return;
    }
    setLoading(true);
    setError(null);
    setContent("");
    try {
      const contentRes = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productInfo, keywords, categoryUrl: (categories as any)[productInfo.category] || "" }),
      });
      const contentData = await contentRes.json();
      if (!contentRes.ok || !contentData.content) {
        throw new Error(contentData.error || "İçerik üretilemedi");
      }
      setContent(contentData.content);
    } catch (e: any) {
      setError(e.message || "İçerik üretiminde hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadWord = () => {
    if (!content) return;
    const html = `<!DOCTYPE html><html><head><meta charset='utf-8'></head><body><h1 style='font-size:2em;font-weight:bold;margin-bottom:1em;'>${productInfo?.name || ''}</h1>${content}</body></html>`;
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${productInfo?.name || "icerik"}.doc`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  if (!productInfo || !keywords.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Ürün veya anahtar kelime bilgisi bulunamadı.</h2>
        <p className="text-gray-600">Lütfen önce anahtar kelime analizi yapın.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Ürün Bilgileri</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-500">Ürün Adı</div>
            <div className="font-medium">{productInfo.name}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Marka</div>
            <div className="font-medium">{productInfo.brand}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Kategori</div>
            <div className="font-medium">{productInfo.category}</div>
          </div>
        </div>
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-1">Seçili Anahtar Kelimeler</div>
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw, i) => (
              <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{kw}</span>
            ))}
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-4 px-6 py-3 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "İçerik Üretiliyor..." : "İçerik Üret"}
        </button>
        {error && <div className="mt-4 text-red-600 font-semibold">{error}</div>}
      </div>
      {content && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">{productInfo.name}</h3>
            <button
              onClick={handleDownloadWord}
              className="px-6 py-2 rounded-md text-white font-medium bg-green-600 hover:bg-green-700"
            >
              Word olarak indir
            </button>
          </div>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
          <button
            type="button"
            className="mt-4 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
            onClick={() => router.push('/keyword-analysis')}
          >
            Geri Dön
          </button>
        </div>
      )}
    </div>
  );
} 