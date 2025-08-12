import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../app/api/auth/[...nextauth]/authOptions";
import Image from "next/image";
import { headers } from "next/headers";
import dynamic from "next/dynamic";
import PanelHeader from "@/components/PanelHeader";
import { SessionProvider } from "next-auth/react";
import ClientLayout from "./client-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SEO İçerik Yönetim Paneli",
  description: "E-ticaret sitesi için SEO odaklı içerik yönetim paneli",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <ClientLayout>
          <main className="min-h-screen bg-gray-50">
            <PanelHeader />
            {children}
          </main>
        </ClientLayout>
      </body>
    </html>
  );
}
