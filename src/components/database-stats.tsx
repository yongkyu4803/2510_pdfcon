'use client';

import { DatabaseStats } from '@/lib/db';
import { Database, FileText, Clock, HardDrive, Cpu, TrendingUp } from 'lucide-react';

interface DatabaseStatsProps {
  stats: DatabaseStats;
}

export function DatabaseStatsView({ stats }: DatabaseStatsProps) {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('ko-KR');
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-700 border-green-200',
      failed: 'bg-red-100 text-red-700 border-red-200',
      processing: 'bg-blue-100 text-blue-700 border-blue-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getMethodColor = (method: string): string => {
    const colors: Record<string, string> = {
      gemini: 'bg-purple-100 text-purple-700 border-purple-200',
      adobe: 'bg-blue-100 text-blue-700 border-blue-200',
    };
    return colors[method] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* 전체 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 총 변환 수 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalConversions)}</span>
          </div>
          <p className="text-sm text-gray-600">총 변환 수</p>
        </div>

        {/* 완료된 변환 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{formatNumber(stats.completedConversions)}</span>
          </div>
          <p className="text-sm text-gray-600">완료된 변환</p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.totalConversions > 0
              ? `${Math.round((stats.completedConversions / stats.totalConversions) * 100)}% 성공률`
              : '0% 성공률'}
          </p>
        </div>

        {/* 구조화된 문서 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <HardDrive className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalDocuments)}</span>
          </div>
          <p className="text-sm text-gray-600">구조화된 문서</p>
        </div>

        {/* 총 토큰 사용량 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Cpu className="h-5 w-5 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalTokens)}</span>
          </div>
          <p className="text-sm text-gray-600">총 토큰 사용량</p>
        </div>
      </div>

      {/* 파일 크기 통계 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <HardDrive className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">파일 크기 통계</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">총 파일 크기</p>
            <p className="text-2xl font-bold text-gray-900">{formatBytes(stats.totalFileSize)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">평균 파일 크기</p>
            <p className="text-2xl font-bold text-gray-900">{formatBytes(stats.averageFileSize)}</p>
          </div>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">최근 활동</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">최근 24시간</p>
            <p className="text-2xl font-bold text-blue-700">{formatNumber(stats.recentActivity.last24h)}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 mb-1">최근 7일</p>
            <p className="text-2xl font-bold text-green-700">{formatNumber(stats.recentActivity.last7days)}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-gray-600 mb-1">최근 30일</p>
            <p className="text-2xl font-bold text-purple-700">{formatNumber(stats.recentActivity.last30days)}</p>
          </div>
        </div>
      </div>

      {/* 상태별 분류 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">상태별 분류</h3>
        </div>
        <div className="space-y-3">
          {Object.entries(stats.statusBreakdown).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
                  {status}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${getStatusColor(status).split(' ')[0]} transition-all duration-300`}
                    style={{ width: `${(count / stats.totalConversions) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-700 ml-4 min-w-[80px] text-right">
                {formatNumber(count)} ({Math.round((count / stats.totalConversions) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 변환 방법별 분류 */}
      {Object.keys(stats.methodBreakdown).length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">변환 방법별 분류</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(stats.methodBreakdown).map(([method, count]) => (
              <div key={method} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getMethodColor(method)}`}>
                    {method}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${getMethodColor(method).split(' ')[0]} transition-all duration-300`}
                      style={{ width: `${(count / stats.totalConversions) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-700 ml-4 min-w-[80px] text-right">
                  {formatNumber(count)} ({Math.round((count / stats.totalConversions) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
