import Breadcrumb from './Breadcrumb';

export default function KeywordAnalysisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full bg-gradient-to-r from-blue-400 to-blue-700 py-3">
        <div className="container mx-auto px-4">
          <Breadcrumb />
        </div>
      </div>
      {children}
    </div>
  );
} 