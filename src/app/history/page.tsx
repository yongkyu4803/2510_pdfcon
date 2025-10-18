'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, ArrowLeft, ExternalLink, Clock } from 'lucide-react';
import type { Conversion } from '@/lib/db';

export default function HistoryPage() {
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversions();
  }, []);

  const fetchConversions = async () => {
    try {
      const response = await fetch('/api/conversions');
      if (response.ok) {
        const data = await response.json();
        setConversions(data);
      }
    } catch (error) {
      console.error('Failed to fetch conversions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800',
    };

    const labels = {
      completed: '완료',
      processing: '처리 중',
      failed: '실패',
      pending: '대기',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles] || styles.pending
        }`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              돌아가기
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">변환 히스토리</h1>
          </div>
          <p className="mt-2 text-gray-600">최근 30개의 변환 작업</p>
        </header>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500">로딩 중...</p>
            </Card>
          ) : conversions.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">아직 변환된 파일이 없습니다.</p>
              <Link href="/">
                <Button className="mt-4">첫 변환 시작하기</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {conversions.map((conversion) => (
                <Card key={conversion.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <FileText className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-lg truncate">{conversion.fileName}</h3>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                          <span>{formatFileSize(conversion.fileSize)}</span>
                          <span>{formatDate(conversion.createdAt)}</span>
                          {conversion.method && (
                            <span className="text-blue-600">{conversion.method}</span>
                          )}
                          {conversion.tokens && (
                            <span className="text-purple-600">{conversion.tokens} tokens</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-4">
                      {getStatusBadge(conversion.status)}
                      {conversion.status === 'completed' && conversion.outputUrl && (
                        <Link href={`/view/${conversion.id}`}>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            보기
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
