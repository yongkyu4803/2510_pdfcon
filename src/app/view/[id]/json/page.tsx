import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { JsonViewer } from '@/components/json-viewer';
import { ArrowLeft } from 'lucide-react';
import { getConversion, getDocumentDataByConversionId } from '@/lib/db';

interface JsonViewPageProps {
  params: Promise<{ id: string }>;
}

export default async function JsonViewPage({ params }: JsonViewPageProps) {
  const { id } = await params;
  const conversion = await getConversion(id);

  if (!conversion || conversion.status !== 'completed') {
    notFound();
  }

  // 구조화된 JSON 데이터 조회
  const documentData = await getDocumentDataByConversionId(id);

  if (!documentData || !conversion.hasStructuredData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              홈으로
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{conversion.fileName}</h1>
              <p className="mt-1 text-sm text-gray-600">
                {new Date(conversion.createdAt).toLocaleString('ko-KR')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                JSON 구조화
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                {conversion.method}
              </span>
            </div>
          </div>
        </header>

        {/* JSON Viewer */}
        <div className="max-w-6xl mx-auto">
          <JsonViewer
            data={documentData.data}
            conversionId={id}
            fileName={conversion.fileName.replace('.pdf', '')}
          />
        </div>
      </div>
    </div>
  );
}
