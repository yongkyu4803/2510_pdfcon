'use client';

import { useState } from 'react';
import { FileUploader } from '@/components/file-uploader';
import { ConversionProgress } from '@/components/conversion-progress';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Building2, History, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DomesticPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    setIsConverting(true);
    setProgress(5);
    setStatus('변환 시작...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', 'domestic'); // 국내 정책 보도 타입

      // Progress simulation
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 90) return prev + 5;
          return prev;
        });
      }, 500);

      setStatus('PDF 분석 중...');

      const response = await fetch('/api/convert-domestic', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '변환 실패');
      }

      const data = await response.json();

      setProgress(100);
      setStatus('변환 완료!');

      toast.success('HTML 변환이 완료되었습니다!');

      // Redirect to view page
      if (data.conversionId) {
        window.location.href = `/view/${data.conversionId}`;
      }
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error(error instanceof Error ? error.message : '변환 중 오류가 발생했습니다.');
      setProgress(0);
      setStatus('');
    } finally {
      setIsConverting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setProgress(0);
    setStatus('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/landing">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                돌아가기
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">정책 보도 일일 종합</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/history">
              <Button variant="outline">
                <History className="h-4 w-4 mr-2" />
                히스토리
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Upload Section */}
          <FileUploader
            onFileSelect={handleFileSelect}
            onError={(error) => toast.error(error)}
          />

          {selectedFile && !isConverting && (
            <div className="flex justify-center">
              <Button size="lg" onClick={handleConvert} className="px-12 bg-red-600 hover:bg-red-700">
                HTML로 변환하기
              </Button>
            </div>
          )}

          {/* Progress Section */}
          {isConverting && <ConversionProgress progress={progress} status={status} />}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-gray-600">
          <p>정책 보도 일일 종합 문서를 HTML로 빠르게 변환하세요</p>
          <p className="mt-2">최대 50MB, PDF 형식만 지원</p>
        </footer>
      </div>
    </div>
  );
}
