"use client";
import { useRouter } from "next/navigation";

export function Breadcrumb() {
  const router = useRouter();
  return (
    <nav className="text-sm text-white flex items-center gap-2">
      <button
        onClick={() => router.back()}
        aria-label="Geri dön"
        className="mr-2 p-1 rounded hover:bg-white/20 transition-colors"
        style={{ lineHeight: 0 }}
      >
        <span style={{ fontSize: 22, display: 'inline-block', verticalAlign: 'middle' }}>&larr;</span>
      </button>
      <a href="/" className="text-white/90 hover:underline">Anasayfa</a>
      <span className="mx-2">&gt;</span>
      <span className="text-white/90">İçerik Üretimi</span>
    </nav>
  );
} 