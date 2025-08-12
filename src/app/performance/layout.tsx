export default function PerformanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-start space-x-2">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Ana Sayfa
            </a>
            <span className="text-gray-400 text-sm">/</span>
            <span className="text-gray-700 text-sm">Performans Analizi</span>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
} 