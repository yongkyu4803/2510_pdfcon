import { getDatabaseStats } from '@/lib/db';
import { DatabaseStatsView } from '@/components/database-stats';
import { Database, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function StatsPage() {
  const stats = await getDatabaseStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  홈으로
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">데이터베이스 통계</h1>
                  <p className="text-sm text-gray-600">PDF 변환 서비스 데이터 분석</p>
                </div>
              </div>
            </div>
            <Link href="/history">
              <Button variant="outline">변환 히스토리</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DatabaseStatsView stats={stats} />
      </div>
    </div>
  );
}
