'use client';

import Link from 'next/link';
import { FileText, Globe, Building2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100">
      {/* Official header bar */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-1 border-b-4 border-blue-700">
        <div className="container mx-auto px-4">
          <p className="text-xs text-center tracking-wider opacity-90">
            MINISTRY OF FOREIGN AFFAIRS & POLICY RESEARCH INSTITUTE
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Official header section */}
        <div className="max-w-6xl mx-auto mb-12">
          {/* Government emblem area */}
          <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
            <div className="inline-flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  브리핑 자료 관리 시스템
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Daily Briefing Document Management System
                </p>
              </div>
            </div>

            {/* Date and classification */}
            <div className="flex justify-center gap-8 text-sm mt-6">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">발행일:</span>
                <span className="text-gray-600">
                  {new Date().toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">분류:</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                  대외비
                </span>
              </div>
            </div>
          </div>

          {/* Document type notice */}
          <div className="bg-blue-50 border-l-4 border-blue-700 p-4 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-700 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-blue-900">
                  시스템 안내
                </h3>
                <p className="mt-1 text-sm text-blue-800">
                  외신 브리핑 및 정책 보도 자료를 HTML 형식으로 자동 변환하는 시스템입니다.
                  해당 문서 유형을 선택하여 진행하십시오.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Document type selection */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-300">
            □ 문서 유형 선택
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 외신 브리핑 */}
            <Link href="/gemini" className="group">
              <div className="bg-white border-2 border-gray-300 hover:border-blue-600 transition-all duration-200 shadow-sm hover:shadow-md">
                {/* Header strip */}
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-3 border-b-2 border-blue-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold text-lg">
                      외신 브리핑
                    </h3>
                    <div className="px-3 py-1 bg-blue-700 text-white text-xs font-semibold rounded">
                      Foreign Press
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="flex items-start gap-6">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center border-2 border-blue-300">
                        <Globe className="h-8 w-8 text-blue-700" />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-2">일일 외신 보도 동향</h4>
                      <ul className="space-y-1 text-sm text-gray-600 mb-4">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                          해외 주요 언론사 보도 자료
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                          국제 정세 및 외교 동향
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                          PDF → HTML 자동 변환
                        </li>
                      </ul>

                      {/* Action */}
                      <div className="flex items-center gap-2 text-blue-700 group-hover:text-blue-800 font-semibold text-sm">
                        <span>문서 변환 시작</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    담당: 외교부 브리핑팀 | 최종 업데이트: {new Date().toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
            </Link>

            {/* 국내 정책 보도 */}
            <Link href="/domestic" className="group">
              <div className="bg-white border-2 border-gray-300 hover:border-blue-600 transition-all duration-200 shadow-sm hover:shadow-md">
                {/* Header strip */}
                <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-6 py-3 border-b-2 border-slate-600">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold text-lg">
                      정책 보도
                    </h3>
                    <div className="px-3 py-1 bg-slate-600 text-white text-xs font-semibold rounded">
                      Policy News
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="flex items-start gap-6">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-slate-300">
                        <Building2 className="h-8 w-8 text-slate-700" />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-2">정책 보도 일일 종합</h4>
                      <ul className="space-y-1 text-sm text-gray-600 mb-4">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-slate-600 rounded-full"></span>
                          국내 정책 관련 주요 보도
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-slate-600 rounded-full"></span>
                          정부 정책 및 사설 분석
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-slate-600 rounded-full"></span>
                          PDF → HTML 자동 변환
                        </li>
                      </ul>

                      {/* Action */}
                      <div className="flex items-center gap-2 text-slate-700 group-hover:text-slate-800 font-semibold text-sm">
                        <span>문서 변환 시작</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    담당: 정책연구원 브리핑팀 | 최종 업데이트: {new Date().toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* System information */}
        <div className="max-w-6xl mx-auto mt-12">
          <div className="bg-white border border-gray-300 shadow-sm">
            <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
              <h3 className="font-bold text-gray-900">□ 시스템 정보</h3>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">지원 형식</h4>
                  <p className="text-gray-600">PDF 문서 (최대 50MB)</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">변환 시간</h4>
                  <p className="text-gray-600">평균 30초 ~ 2분</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">출력 형식</h4>
                  <p className="text-gray-600">HTML5 구조화 문서</p>
                </div>
              </div>

              {/* Quick links */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex gap-4 text-sm">
                  <Link href="/history" className="text-blue-700 hover:text-blue-800 hover:underline">
                    → 변환 히스토리
                  </Link>
                  <Link href="/stats" className="text-blue-700 hover:text-blue-800 hover:underline">
                    → 통계 보기
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-gray-300 text-center text-xs text-gray-500">
          <p>본 시스템은 외교부 및 정책연구원의 브리핑 자료 관리를 위한 내부 시스템입니다.</p>
          <p className="mt-1">문의사항은 담당 부서로 연락하시기 바랍니다.</p>
        </div>
      </div>
    </div>
  );
}
