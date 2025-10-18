'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { FileText, Sparkles, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function GeminiPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast.error('PDF 파일만 업로드 가능합니다.');
        return;
      }

      const maxSize = 50 * 1024 * 1024; // 50MB
      if (selectedFile.size > maxSize) {
        toast.error('파일 크기는 50MB를 초과할 수 없습니다.');
        return;
      }

      setFile(selectedFile);
      toast.success(`${selectedFile.name} 선택됨`);
    }
  };

  const handleConvert = async () => {
    if (!file) {
      toast.error('파일을 선택해주세요.');
      return;
    }

    setIsConverting(true);
    setProgress(0);
    setStatus('PDF 업로드 중...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      // 진행률 시뮬레이션
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 1000);

      setStatus('Gemini AI가 PDF를 분석하는 중...');

      const response = await fetch('/api/convert-gemini', {
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

      toast.success('PDF가 성공적으로 변환되었습니다!');

      // HTML 파일 다운로드
      const downloadUrl = data.outputUrl;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.name.replace('.pdf', '.html');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 초기화
      setTimeout(() => {
        setIsConverting(false);
        setProgress(0);
        setStatus('');
        setFile(null);
      }, 1000);
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error(error instanceof Error ? error.message : '변환 중 오류가 발생했습니다.');
      setIsConverting(false);
      setProgress(0);
      setStatus('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-12 h-12 text-purple-600 dark:text-purple-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Gemini PDF Converter
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Google Gemini AI가 PDF를 읽고 구조화된 HTML로 변환합니다
            </p>
          </div>

          {/* 메인 카드 */}
          <Card className="shadow-xl border-2 border-purple-100 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                PDF 업로드
              </CardTitle>
              <CardDescription>
                PDF 파일을 선택하면 Gemini AI가 자동으로 분석하여 아름다운 HTML로 변환합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 파일 선택 */}
              <div className="space-y-2">
                <Label htmlFor="pdf-file">PDF 파일 선택</Label>
                <Input
                  id="pdf-file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={isConverting}
                  className="cursor-pointer"
                />
                {file && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    선택된 파일: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {/* 진행률 */}
              {isConverting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{status}</span>
                    <span className="font-medium text-purple-600 dark:text-purple-400">
                      {progress}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* 변환 버튼 */}
              <Button
                onClick={handleConvert}
                disabled={!file || isConverting}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-6 text-lg"
              >
                {isConverting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    변환 중...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Gemini로 변환하기
                  </>
                )}
              </Button>

              {/* 기능 설명 */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Gemini AI의 특별한 기능
                </h3>
                <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1 ml-6 list-disc">
                  <li>PDF를 직접 읽고 이해하는 AI 분석</li>
                  <li>요지 섹션 자동 추출 및 강조</li>
                  <li>계층 구조 (□ → ○ → -) 파싱</li>
                  <li>반응형 디자인 & 다크모드 지원</li>
                  <li>원본 텍스트 100% 보존</li>
                </ul>
              </div>

              {/* 홈으로 */}
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full"
              >
                Adobe 변환으로 돌아가기
              </Button>
            </CardContent>
          </Card>

          {/* 비교 */}
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-sm text-blue-900 dark:text-blue-100">
                  Adobe PDF Extract
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <p>✓ 정확한 텍스트 추출</p>
                <p>✓ 빠른 처리 속도</p>
                <p>✓ 구조화된 JSON 데이터</p>
                <p>✗ AI 분석 없음</p>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-sm text-purple-900 dark:text-purple-100">
                  Gemini AI
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                <p>✓ AI 기반 문서 이해</p>
                <p>✓ 지능적 구조 분석</p>
                <p>✓ 즉시 사용 가능한 HTML</p>
                <p>✓ 컨텍스트 이해</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
