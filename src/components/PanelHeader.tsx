"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DynamicUserDropdown from "@/components/DynamicUserDropdown";
import { useSession } from "next-auth/react";

export default function PanelHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  // Hide header on /login
  if (pathname === "/login") return null;

  return (
    <>
      <header className="bg-white shadow-sm w-full">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-8 w-full">
            <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
              <img
                src="/pasajbot-logo.svg"
                alt="PasajBot Logo"
                className="w-10 h-10 object-contain"
              />
              <span className="text-gray-700 font-semibold text-lg group-hover:text-blue-700 transition">Pasaj SEO Paneli</span>
            </Link>
            <nav className="flex space-x-8 pl-32">
              <a 
                href="/content-generation" 
                className="text-gray-600 font-semibold transition hover:text-blue-700 hover:border-b-2 hover:border-blue-700 border-b-2 border-transparent pb-1"
              >
                İçerik Üretme
              </a>
              <Link href="/article-generation" className="text-gray-600 font-semibold transition hover:text-blue-700 hover:border-b-2 hover:border-blue-700 border-b-2 border-transparent pb-1">Makale Üretme</Link>
              <Link href="/review-analysis" className="text-gray-600 font-semibold transition hover:text-blue-700 hover:border-b-2 hover:border-blue-700 border-b-2 border-transparent pb-1">Yorum Analizi</Link>
              <Link href="/ai-content-tools" className="text-gray-600 font-semibold transition hover:text-blue-700 hover:border-b-2 hover:border-blue-700 border-b-2 border-transparent pb-1">AI Araçları</Link>
            </nav>
            <div className="flex-1" />
            <div className="w-40 flex justify-end items-center">
              {session?.user ? (
                <DynamicUserDropdown user={session.user} />
              ) : (
                <Link href="/login" className="text-blue-600 font-medium hover:underline">Giriş Yap</Link>
              )}
            </div>
          </div>
        </div>
      </header>
      {/* Gradient Bar */}
      <div className="w-full bg-gradient-to-r from-blue-400 to-blue-700 py-3"></div>
    </>
  );
} 