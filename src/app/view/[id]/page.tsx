import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HTMLViewer } from '@/components/html-viewer';
import { ArrowLeft, FileJson } from 'lucide-react';
import { getConversion } from '@/lib/db';
import { getFromLocalStorage } from '@/lib/storage';

interface ViewPageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewPage({ params }: ViewPageProps) {
  const { id } = await params;
  const conversion = await getConversion(id);

  if (!conversion || conversion.status !== 'completed' || !conversion.outputUrl) {
    notFound();
  }

  // Fetch HTML content
  let htmlContent: string;

  // 로컬 개발 환경: 파일 시스템에서 직접 읽기
  if (conversion.outputUrl.startsWith('/api/storage/')) {
    const fileName = conversion.outputUrl.replace('/api/storage/', '');
    const buffer = await getFromLocalStorage(fileName);
    if (!buffer) {
      notFound();
    }
    htmlContent = buffer.toString('utf-8');
  } else {
    // 프로덕션 환경: Vercel Blob URL에서 fetch
    const htmlResponse = await fetch(conversion.outputUrl);
    htmlContent = await htmlResponse.text();
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
            {conversion.hasStructuredData && (
              <Link href={`/view/${id}/json`}>
                <Button variant="outline">
                  <FileJson className="h-4 w-4 mr-2" />
                  JSON 뷰
                </Button>
              </Link>
            )}
          </div>
        </header>

        {/* HTML Viewer */}
        <div className="max-w-6xl mx-auto">
          <HTMLViewer
            htmlContent={htmlContent}
            fileName={conversion.fileName.replace('.pdf', '')}
            shareUrl={conversion.outputUrl}
          />
        </div>
      </div>
    </div>
  );
}
