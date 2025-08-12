"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function UserDropdown({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Menüden çıkınca hemen değil, kısa bir gecikmeyle kapat
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 120);
  };
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="flex items-center space-x-2 focus:outline-none">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-lg">
          {user.name?.[0]?.toUpperCase() || 'U'}
        </span>
        <span className="text-gray-700 font-medium hidden md:inline">{user.name}</span>
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-50"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Şifre Değiştir</Link>
          {user.role === 'admin' && (
            <Link href="/admin/users" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Kullanıcı Yönetimi</Link>
          )}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
          >
            Çıkış Yap
          </button>
        </div>
      )}
    </div>
  );
} 