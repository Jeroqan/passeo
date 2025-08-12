"use client";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/authOptions";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  const handleNavigation = (route: string, routeName: string) => {
    setSelectedRoute(routeName);
    setIsNavigating(true);
    
    // 2 saniye sonra sayfaya yönlendir
    setTimeout(() => {
      router.push(route);
    }, 2000);
  };

  // Geçiş ekranı bileşeni
  const NavigationScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center">
        {/* Animasyonlu harita ve rota görseli */}
        <div className="relative mb-8">
          {/* Ana harita container */}
          <div className="w-96 h-56 mx-auto relative bg-gradient-to-br from-blue-200 via-green-100 to-yellow-50 rounded-2xl shadow-xl border-2 border-blue-200 overflow-hidden">
            
            {/* Deniz alanları */}
            <div className="absolute top-0 left-0 w-32 h-24 bg-gradient-to-br from-blue-400 to-blue-300 rounded-br-3xl opacity-70"></div>
            <div className="absolute bottom-0 right-0 w-28 h-20 bg-gradient-to-tl from-blue-400 to-blue-300 rounded-tl-3xl opacity-70"></div>
            <div className="absolute top-8 right-8 w-20 h-16 bg-gradient-to-br from-blue-300 to-blue-200 rounded-full opacity-60"></div>
            
            {/* Dağ silsileleri */}
            <div className="absolute top-4 left-1/3 w-24 h-16 bg-gradient-to-t from-gray-300 to-gray-500 opacity-60" 
                 style={{clipPath: 'polygon(0% 100%, 20% 30%, 40% 60%, 60% 20%, 80% 50%, 100% 100%)'}}></div>
            <div className="absolute bottom-8 left-8 w-20 h-12 bg-gradient-to-t from-gray-400 to-gray-600 opacity-50" 
                 style={{clipPath: 'polygon(0% 100%, 25% 40%, 50% 10%, 75% 45%, 100% 100%)'}}></div>
            <div className="absolute top-12 right-1/4 w-16 h-10 bg-gradient-to-t from-gray-300 to-gray-500 opacity-55" 
                 style={{clipPath: 'polygon(0% 100%, 30% 25%, 70% 35%, 100% 100%)'}}></div>
            
            {/* Orman alanları */}
            <div className="absolute bottom-4 left-1/2 w-20 h-14 bg-gradient-to-t from-green-400 to-green-600 opacity-50 rounded-t-full"></div>
            <div className="absolute top-1/3 left-12 w-16 h-12 bg-gradient-to-t from-green-300 to-green-500 opacity-45 rounded-full"></div>
            <div className="absolute bottom-12 right-12 w-14 h-10 bg-gradient-to-t from-green-400 to-green-600 opacity-40 rounded-t-2xl"></div>
            
            {/* Çöl/kum alanları */}
            <div className="absolute top-1/2 right-1/3 w-16 h-12 bg-gradient-to-br from-yellow-200 to-yellow-300 opacity-60 rounded-full"></div>
            <div className="absolute bottom-1/3 left-1/4 w-16 h-10 bg-gradient-to-br from-yellow-100 to-yellow-200 opacity-50 rounded-2xl"></div>
            
            {/* Harita arka plan grid (ince) */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '24px 24px'
              }}></div>
            </div>
            
            {/* Şehir işaretleri */}
            <div className="absolute top-8 left-16 w-3 h-3 bg-red-500 rounded-sm shadow-sm border border-white">
              <div className="absolute -top-1 -left-1 w-5 h-5 bg-red-300 rounded-sm opacity-30"></div>
            </div>
            <div className="absolute top-16 right-20 w-3 h-3 bg-red-500 rounded-sm shadow-sm border border-white">
              <div className="absolute -top-1 -left-1 w-5 h-5 bg-red-300 rounded-sm opacity-30"></div>
            </div>
            <div className="absolute bottom-20 left-24 w-3 h-3 bg-red-500 rounded-sm shadow-sm border border-white">
              <div className="absolute -top-1 -left-1 w-5 h-5 bg-red-300 rounded-sm opacity-30"></div>
            </div>
            <div className="absolute bottom-12 right-16 w-3 h-3 bg-red-500 rounded-sm shadow-sm border border-white">
              <div className="absolute -top-1 -left-1 w-5 h-5 bg-red-300 rounded-sm opacity-30"></div>
            </div>
            
            {/* Nehir */}
            <div className="absolute top-1/2 left-0 w-full h-2 bg-gradient-to-r from-blue-300 via-blue-200 to-blue-300 opacity-50"
                 style={{clipPath: 'polygon(0% 0%, 100% 100%, 100% 0%, 0% 100%)', transform: 'rotate(-5deg)'}}></div>
            
            {/* Ana rota çizgisi (animasyonlu) */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 384 224">
              <defs>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="50%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
              
              {/* Rota yolu */}
              <path
                d="M 60 180 Q 120 90 190 130 Q 260 170 320 70"
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="350"
                strokeDashoffset="350"
                className="animate-pulse"
                style={{
                  animation: 'drawRoute 2s ease-in-out infinite'
                }}
              />
            </svg>

            {/* Başlangıç noktası */}
            <div className="absolute bottom-10 left-14 w-4 h-4 bg-green-500 rounded-full shadow-lg animate-pulse border-2 border-white">
              <div className="absolute -top-1 -left-1 w-6 h-6 bg-green-400 rounded-full opacity-30 animate-ping"></div>
            </div>

            {/* Hedef noktası */}
            <div className="absolute top-12 right-20 w-4 h-4 bg-red-500 rounded-full shadow-lg animate-pulse border-2 border-white" style={{animationDelay: '0.5s'}}>
              <div className="absolute -top-1 -left-1 w-6 h-6 bg-red-400 rounded-full opacity-30 animate-ping" style={{animationDelay: '0.5s'}}></div>
            </div>

            {/* Ara durak noktaları */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full animate-pulse border border-white" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-16 left-28 w-3 h-3 bg-purple-500 rounded-full animate-pulse border border-white" style={{animationDelay: '1.5s'}}></div>

            {/* Hareket eden nokta (rota boyunca) */}
            <div className="absolute w-3 h-3 bg-yellow-400 rounded-full shadow-lg border border-white" 
                 style={{
                   animation: 'moveAlongRoute 2s ease-in-out infinite'
                 }}>
            </div>

            {/* Harita üst katman efektleri */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10 pointer-events-none"></div>
            
            {/* Köşe koordinat işaretleri */}
            <div className="absolute top-2 left-2 text-xs text-gray-400 font-mono">N</div>
            <div className="absolute bottom-2 right-2 text-xs text-gray-400 font-mono">GPS</div>
          </div>
        </div>

        {/* Ana başlık */}
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Rota oluşturuluyor...
        </h1>
        
        {/* Alt başlık */}
        <p className="text-xl text-gray-600 mb-2">
          <span className="font-semibold text-blue-600">{selectedRoute}</span> rotasına yönlendiriliyorsunuz
        </p>
        
        {/* İlerleme çubuğu */}
        <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto mt-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" 
               style={{
                 animation: 'progress 2s ease-in-out forwards',
               }}>
          </div>
        </div>
        
        {/* Animasyon keyframes */}
        <style jsx>{`
          @keyframes progress {
            0% { width: 0%; }
            100% { width: 100%; }
          }
          
          @keyframes drawRoute {
            0% { 
              stroke-dashoffset: 350; 
              opacity: 0.3;
            }
            50% { 
              stroke-dashoffset: 175; 
              opacity: 1;
            }
            100% { 
              stroke-dashoffset: 0; 
              opacity: 0.8;
            }
          }
          
          @keyframes moveAlongRoute {
            0% { 
              left: 60px; 
              top: 180px; 
              opacity: 0;
            }
            25% { 
              left: 120px; 
              top: 90px; 
              opacity: 1;
            }
            50% { 
              left: 190px; 
              top: 130px; 
              opacity: 1;
            }
            75% { 
              left: 260px; 
              top: 170px; 
              opacity: 1;
            }
            100% { 
              left: 320px; 
              top: 70px; 
              opacity: 0;
            }
          }
        `}</style>
      </div>
    </div>
  );

  if (isNavigating) {
    return <NavigationScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4 py-12">
      {/* Ana Başlık */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm leading-tight py-2">
          Hangi yoldan gidiyoruz kaptan?
        </h1>
      </div>

      {/* Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {/* İçerik Üretme - Aktif */}
        <button
          onClick={() => handleNavigation("/content-generation", "İçerik Üretme")}
          className="group relative bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 overflow-hidden w-full"
        >
          {/* Arka plan gradient efekti */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 via-emerald-400/10 to-teal-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* İkon */}
          <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          
          {/* İçerik */}
          <div className="relative z-10 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-green-600 transition-colors">
              İçerik Üretme
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Seçtiğiniz anahtar kelimelerle SEO uyumlu ürün içeriği oluşturun
            </p>
            <div className="inline-flex items-center text-green-600 font-semibold group-hover:text-green-700">
              <span>Başlayın</span>
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>

        {/* Makale Üretme - Aktif */}
        <button
          onClick={() => handleNavigation("/article-generation", "Makale Üretme")}
          className="group relative bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 overflow-hidden w-full"
        >
          {/* Çok yakında badge */}
          <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-400 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            Çok Yakında
          </div>
          
          {/* Arka plan gradient efekti */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-indigo-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* İkon */}
          <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          
          {/* İçerik */}
          <div className="relative z-10 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
              Makale Üretme
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Uzun ve detaylı ürün makaleleri oluşturun
            </p>
            <div className="inline-flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
              <span>Başlayın</span>
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>

        {/* Yorum Analizi - Aktif */}
        <button
          onClick={() => handleNavigation("/review-analysis", "Yorum Analizi")}
          className="group relative bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 overflow-hidden w-full"
        >
          {/* Çok yakında badge */}
          <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-400 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            Çok Yakında
          </div>
          
          {/* Arka plan gradient efekti */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-pink-400/10 to-rose-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* İkon */}
          <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          
          {/* İçerik */}
          <div className="relative z-10 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-purple-600 transition-colors">
              Yorum Analizi
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Ürün yorumlarını analiz ederek içgörü elde edin
            </p>
            <div className="inline-flex items-center text-purple-600 font-semibold group-hover:text-purple-700">
              <span>Başlayın</span>
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
        </div>
        </button>
        </div>

      {/* Alt bilgi */}
      <div className="mt-16 text-center">
        <p className="text-gray-500 text-sm">
          Daha fazla özellik yakında geliyor...
        </p>
      </div>
    </div>
  );
}
