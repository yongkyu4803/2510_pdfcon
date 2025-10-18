# PRD: 외신 브리핑 자동 변환 시스템 (Next.js 웹 애플리케이션)

## 📋 문서 정보

**프로젝트명:** NewsBrief Converter (NBC)
**문서 버전:** v2.0 (Next.js 기반)
**작성일:** 2025.10.18
**최종 수정일:** 2025.10.18
**작성자:** 뮤직카우 법무·정책팀
**프로젝트 타입:** Web Application (Next.js 15 + TypeScript)
**배포 환경:** Vercel (Production)
**예상 개발 기간:** 2주
**예상 개발 비용:** $8,000
**예상 운영 비용:** $6/월

---

## 📊 목차

1. [Executive Summary](#1-executive-summary)
2. [배경 및 문제 정의](#2-배경-및-문제-정의)
3. [사용자 페르소나](#3-사용자-페르소나)
4. [제품 비전 및 범위](#4-제품-비전-및-범위)
5. [기능 요구사항](#5-기능-요구사항)
6. [기술 요구사항](#6-기술-요구사항)
7. [UI/UX 요구사항](#7-uiux-요구사항)
8. [성능 요구사항](#8-성능-요구사항)
9. [보안 요구사항](#9-보안-요구사항)
10. [API 명세](#10-api-명세)
11. [데이터베이스 설계](#11-데이터베이스-설계)
12. [비용 구조](#12-비용-구조)
13. [개발 로드맵](#13-개발-로드맵)
14. [성공 지표 (KPI)](#14-성공-지표-kpi)
15. [리스크 관리](#15-리스크-관리)
16. [테스트 계획](#16-테스트-계획)
17. [배포 계획](#17-배포-계획)
18. [유지보수 계획](#18-유지보수-계획)
19. [부록](#19-부록)

---

## 1. Executive Summary

### 1.1 제품 개요

**NewsBrief Converter (NBC)**는 정부 외신 브리핑 PDF 문서를 웹 친화적인 HTML로 자동 변환하는 Next.js 기반 웹 애플리케이션입니다. Adobe PDF Services API와 Claude API를 하이브리드로 활용하여 높은 정확도의 변환을 제공하며, 모든 디바이스에서 접근 가능한 반응형 웹 애플리케이션입니다.

### 1.2 핵심 가치 제안

**시간 절약:**
- 문서당 변환 시간: 15분 → 30초 (97% 단축)
- 월간 시간 절약: 10시간
- 연간 시간 절약: 120시간

**비용 효율:**
- 개발 비용: $8,000 (1회)
- 운영 비용: $6/월
- ROI: 2개월 내 회수

**접근성 향상:**
- PC, 태블릿, 모바일 모든 기기 지원
- 설치 불필요 (URL만으로 접근)
- 출퇴근 중 모바일 열람 가능

**협업 강화:**
- URL 공유로 즉시 팀 공유
- 댓글 기능 (Phase 2)
- 실시간 협업 (Phase 2)

### 1.3 타겟 사용자

**Primary:** 뮤직카우 법무·정책팀 (1명)
**Secondary:** 경영진, 전략팀, 대외협력팀 (5-10명)
**Future:** 전 직원 (50명+)

### 1.4 성공 기준

**정량적:**
- 변환 성공률 > 95%
- 평균 변환 시간 < 30초
- 사용자 만족도 > 4.5/5.0
- 월 활성 사용자 > 5명 (3개월 내)

**정성적:**
- 업무 프로세스 간소화
- 팀 간 정보 공유 활성화
- 모바일 접근성 개선

---

## 2. 배경 및 문제 정의

### 2.1 현재 상황 (As-Is)

#### 업무 흐름
```
08:00 - 정부 외신팀이 외신 브리핑 PDF 이메일 발송 (일 2건)
       ↓
08:30 - 법무팀 담당자 출근 → 이메일 확인
       ↓
08:35 - PDF 다운로드 → Adobe Reader로 열람
       ↓
08:40 - 중요 내용 수동 복사 → 워드/노션에 정리
       ↓
08:55 - Slack에 요약 내용 공유
       ↓
09:00 - 총 소요시간: 30분 (문서당 15분 × 2건)
```

#### 구체적인 페인 포인트

**1. 비효율적인 작업 흐름**
```
현재 프로세스:
PDF 다운로드 (2분)
  → Adobe Reader 실행 (30초)
  → 9페이지 스크롤하며 읽기 (5분)
  → 중요 내용 복사 (3분)
  → 워드/노션에 정리 (4분)
  → Slack에 공유 (30초)
= 총 15분/건
```

**2. 검색 불가능**
- PDF는 사내 검색 시스템에서 검색 안 됨
- 과거 브리핑 찾으려면 이메일 뒤지기
- 특정 키워드로 검색 불가

**3. 모바일 가독성 문제**
- PDF는 모바일에서 확대/축소 필요
- 출퇴근 중 확인 어려움
- 테이블/박스가 깨져 보임

**4. 공유 어려움**
- 타 부서 공유 시 PDF 첨부 → 용량 큼
- 수신자도 다운로드 필요
- 특정 섹션만 공유 불가능

**5. 버전 관리 부재**
- 수정된 브리핑 재발송 시 혼란
- 어떤 버전이 최신인지 불명확

### 2.2 목표 상황 (To-Be)

#### 이상적인 업무 흐름
```
08:00 - 정부 외신팀이 외신 브리핑 PDF 이메일 발송
       ↓
08:01 - [자동] NBC가 이메일 모니터링 (Phase 2)
       ↓
08:02 - [자동] PDF 다운로드 및 변환 시작
       ↓
08:03 - [자동] 변환 완료 → Slack 알림
       ↓
08:30 - 법무팀 담당자 출근
       ↓
08:31 - Slack 알림 클릭 → 브라우저에서 즉시 열람
       ↓
08:35 - 중요 섹션에 하이라이트 → URL 복사
       ↓
08:36 - Slack에 URL 공유 (팀원들도 즉시 확인)
       ↓
       총 소요시간: 6분 (80% 단축)
```

#### 주요 개선점

**1. 원클릭 접근**
```
Before: 다운로드 → 실행 → 읽기
After:  URL 클릭 → 읽기
```

**2. 모바일 최적화**
```
Before: PDF 확대/축소 반복
After:  반응형 HTML (자동 맞춤)
```

**3. 즉시 공유**
```
Before: 파일 첨부 (5MB) → 수신자 다운로드
After:  URL 공유 (즉시 열람)
```

**4. 전체 검색 가능**
```
Before: 검색 불가능
After:  Ctrl+F로 즉시 검색
```

**5. 히스토리 관리**
```
Before: 이메일에서 찾기
After:  NBC 웹사이트에서 날짜별 조회
```

### 2.3 비즈니스 임팩트

#### 정량적 효과
```
시간 절약:
- 일일: 30분 → 6분 (24분 절약)
- 월간: 10시간 절약
- 연간: 120시간 절약
- 금액 환산: 120시간 × $50/시간 = $6,000/년

생산성 향상:
- 브리핑 확인 시간 80% 감소
- 공유 시간 90% 감소
- 과거 자료 검색 시간 95% 감소
```

#### 정성적 효과
```
업무 만족도:
- 반복 작업 자동화로 업무 만족도 향상
- 모바일 접근으로 워라밸 개선
- 팀 협업 강화

의사결정 속도:
- 빠른 정보 공유로 의사결정 속도 향상
- 경영진도 모바일로 즉시 확인 가능

정보 활용도:
- 과거 데이터 검색 가능 → 트렌드 분석
- 키워드 검색으로 관련 정보 즉시 발굴
```

---

## 3. 사용자 페르소나

### 3.1 Primary Persona: "정책 담당 김법무"

**기본 정보**
```yaml
이름: 김법무
나이: 32세
직책: 뮤직카우 법무·정책팀 대리
경력: 법무 3년, 뮤직카우 1.5년
학력: 법학 학사, 로스쿨 졸업
기술 수준: 중급
  - MS Office: 능숙
  - 웹 브라우저: 능숙
  - 협업 도구: Slack, Notion 능숙
  - 프로그래밍: 없음
사용 기기:
  - 업무용: MacBook Pro 14" (2021)
  - 개인: iPhone 14 Pro
  - 출퇴근: 지하철 40분
```

**하루 일과**
```
08:00 - 출근 (지하철에서 메일 확인)
08:30 - 사무실 도착
08:35 - 외신 브리핑 확인 ★
09:00 - 팀 데일리 미팅
09:30 - 계약서 검토
11:00 - 외부 자문 미팅
13:00 - 점심
14:00 - 정책 문서 작성
16:00 - 외신 브리핑 확인 ★
17:00 - 컴플라이언스 점검
18:00 - 퇴근
```

**Pain Points**
```
1. 매일 아침 반복되는 PDF 정리 작업
   "또 PDF 정리해야 하나... 이거 자동화 안 되나?"

2. 출퇴근 중 모바일로 확인 불가
   "지하철에서 미리 보고 싶은데 PDF는 너무 불편해"

3. 과거 브리핑 찾기 어려움
   "지난달에 봤던 북한 관련 내용이 어디 있더라?"

4. 팀 공유 번거로움
   "이거 중요한데 팀원들한테 어떻게 공유하지? PDF 또 첨부?"

5. 검색 불가능
   "'희토류' 관련 내용이 있었는데... 찾을 수가 없네"
```

**Goals**
```
1. 브리핑 확인 시간 최소화
   "5분 안에 핵심만 파악하고 싶어"

2. 모바일 접근성
   "출퇴근 중에 미리 확인하고 싶어"

3. 쉬운 공유
   "중요한 내용은 팀원들과 바로 공유하고 싶어"

4. 과거 자료 검색
   "필요할 때 바로 찾을 수 있었으면"
```

**사용 시나리오 (Phase 1)**
```
타임라인         액션                           감정
------------------------------------------------------------------------
08:00 (지하철)  Slack 알림 "외신 브리핑 2건"   😊 "오, 벌써?"
08:01          알림 클릭 → NBC 웹사이트       
08:02          모바일 화면에 깔끔하게 표시     😍 "이제 이동 중에도 보네!"
08:10          중요 부분 읽기 완료             😌 "벌써 다 봤네"
08:30 (사무실) PC에서 다시 열람               
08:32          중요 섹션 URL 복사              
08:33          Slack에 URL 공유               😎 "이제 파일 첨부 안 해도 되네"
08:35          팀원들이 즉시 확인             🎉 "다들 바로 보네!"
```

**사용 시나리오 (Phase 2 - 이상적)**
```
07:50 (기상)   스마트폰 알림 "외신 브리핑 자동 변환 완료"
07:55 (아침)   식사하며 모바일로 대충 훑어봄   😊
08:00 (출근)   지하철에서 관심 섹션 정독       
08:05          중요 부분에 하이라이트          
08:10          댓글 작성 "이거 회의 때 논의"   
08:20 (도착)   팀장도 이미 확인 완료           🎯 "이미 다 파악 완료!"
08:30 (미팅)   브리핑 기반 즉시 논의 시작      💼 "시간 절약!"
```

### 3.2 Secondary Persona: "전략팀 이팀장"

**기본 정보**
```yaml
이름: 이전략
나이: 40세
직책: 전략기획팀 팀장
경력: 15년 (대기업 10년 + 스타트업 5년)
기술 수준: 초급
  - 이메일, 메신저: 능숙
  - 복잡한 도구: 어려움
  - 프로그램 설치: 꺼림
사용 기기:
  - 업무용: Windows 노트북
  - 개인: Galaxy S24
```

**Needs**
```
1. 간단한 접근
   "복잡한 거 싫어요. 링크만 주세요"

2. 모바일 중심
   "저는 거의 모바일로 봐요"

3. 요약 선호
   "9페이지는 너무 길어요. 핵심만 주세요"
```

**사용 시나리오**
```
09:00 - Slack에서 법무팀 공유 링크 확인
09:01 - 스마트폰으로 클릭
09:02 - 요지 섹션만 빠르게 읽기 (3분)
09:05 - "알았어요" 이모지 반응
```

### 3.3 Tertiary Persona: "CEO 박대표"

**기본 정보**
```yaml
이름: 박대표
직책: 대표이사
사용 시간: 주 1-2회 (중요 이슈만)
기술 수준: 중급
```

**Needs**
```
1. 한눈에 파악
   "바쁜데 핵심만 빠르게"

2. 모바일 친화
   "이동 중에 확인"

3. 신뢰성
   "정확한 정보여야 함"
```

---

## 4. 제품 비전 및 범위

### 4.1 제품 비전

**Vision Statement**
```
"누구나, 어디서나, 즉시 접근 가능한 
외신 정보 허브"
```

**Mission**
```
정부 외신 브리핑을 AI 기술로 자동 변환하여
뮤직카우 구성원들의 글로벌 인사이트 획득을
최대 10배 빠르게 만든다
```

**Core Values**
```
1. Simplicity: 클릭 한 번으로 모든 것이 해결
2. Accessibility: 모든 기기에서 완벽하게 작동
3. Reliability: 99% 이상의 변환 정확도
4. Speed: 30초 이내 변환 완료
```

### 4.2 제품 범위

#### Phase 1: MVP (Week 1-2)

**In Scope** ✅
```
핵심 기능:
├─ PDF 파일 업로드 (드래그앤드롭)
├─ 자동 변환 (Adobe + Claude 하이브리드)
├─ HTML 출력 (반응형)
├─ 변환 히스토리 (최근 30개)
├─ 모바일 최적화
└─ 기본 에러 처리

기술 스택:
├─ Next.js 15 (App Router)
├─ TypeScript
├─ Tailwind CSS + shadcn/ui
├─ Vercel 배포
└─ Vercel Postgres (히스토리)

사용자:
└─ 법무팀 1명 (김법무)
```

**Out of Scope** ❌
```
├─ 이메일 자동 모니터링
├─ 사용자 인증
├─ 팀 협업 기능 (댓글, 하이라이트)
├─ AI 요약
├─ 알림 기능
├─ 다국어 지원
└─ 고급 검색
```

#### Phase 2: Enhancement (Week 3-8)

**추가 기능**
```
자동화:
├─ 이메일 모니터링 (IMAP)
├─ 자동 다운로드
└─ 스케줄 변환

협업:
├─ 사용자 인증 (이메일)
├─ 팀 초대
├─ 댓글 시스템
├─ 하이라이트 공유
└─ Slack 알림

검색:
├─ 전체 텍스트 검색
├─ 날짜 필터
├─ 카테고리 필터
└─ 태그 시스템
```

#### Phase 3: Scale (Month 3-6)

**확장 기능**
```
AI 기능:
├─ 자동 요약 (1분 브리핑)
├─ 키워드 추출
├─ 트렌드 분석
└─ 관련 뉴스 추천

분석:
├─ 대시보드
├─ 통계 리포트
├─ 읽기 패턴 분석
└─ 인사이트 추출

통합:
├─ Notion 연동
├─ Google Drive 연동
├─ MS Teams 연동
└─ API 제공
```

### 4.3 성공 정의

#### MVP 성공 기준 (2주 후)
```
✅ 변환 성공률 > 90%
✅ 평균 변환 시간 < 30초
✅ 모바일 접근 가능
✅ 일일 사용 1회 이상
✅ 사용자 만족도 > 4.0/5.0
```

#### Phase 2 성공 기준 (2개월 후)
```
✅ 월 활성 사용자 > 5명
✅ 팀 공유 > 주 10회
✅ 자동 변환 성공률 > 95%
✅ 검색 사용 > 주 5회
```

#### Phase 3 성공 기준 (6개월 후)
```
✅ 월 활성 사용자 > 20명
✅ AI 요약 사용 > 일 2회
✅ 전사 도입 검토
✅ ROI > 500%
```

---

## 5. 기능 요구사항

### 5.1 핵심 기능 (MVP - Must Have)

#### F1: PDF 업로드

**우선순위:** P0 (Critical)
**담당:** Frontend

**기능 설명**
```
사용자가 외신 브리핑 PDF 파일을 시스템에 업로드하는 기능
```

**상세 요구사항**

**F1.1: 드래그앤드롭 업로드**
```typescript
// 요구사항
- 파일을 브라우저 창에 드래그하면 시각적 피드백
- 드롭 시 즉시 파일 읽기 시작
- 여러 파일 동시 드롭 지원 (최대 5개)

// 시각적 피드백
드래그 진입: 테두리 파란색 점선 + "여기에 놓으세요" 메시지
드롭: 파일 아이콘 + 파일명 + 크기 표시

// 에러 케이스
- PDF 아닌 파일: "PDF 파일만 업로드 가능합니다"
- 50MB 초과: "파일이 너무 큽니다 (최대 50MB)"
- 네트워크 오류: "업로드 실패. 다시 시도해주세요"
```

**F1.2: 파일 선택 버튼**
```typescript
// 요구사항
- "파일 선택" 버튼 클릭 시 파일 다이얼로그
- PDF 필터 자동 적용
- 선택 후 F1.1과 동일한 프로세스

// UI
<Button variant="outline">
  <Upload className="mr-2" />
  파일 선택
</Button>
```

**F1.3: URL 붙여넣기 (Phase 2)**
```typescript
// 요구사항
- 정부 사이트 PDF URL 직접 입력
- URL 유효성 검사
- 자동 다운로드 후 변환
```

**검증 기준 (Acceptance Criteria)**
```gherkin
Scenario: 드래그앤드롭으로 PDF 업로드
  Given 사용자가 NBC 메인 페이지에 접속
  When 외신브리핑.pdf를 드래그앤드롭
  Then 파일명 "외신브리핑.pdf" 표시
  And 파일 크기 "2.5 MB" 표시
  And "변환 시작" 버튼 활성화
  And 변환 시작 버튼 클릭 가능 상태

Scenario: 잘못된 파일 업로드
  Given 사용자가 NBC 메인 페이지에 접속
  When image.png 파일을 드래그앤드롭
  Then "PDF 파일만 업로드 가능합니다" 에러 메시지
  And 빨간색 테두리로 시각적 피드백
  And "변환 시작" 버튼 비활성화

Scenario: 대용량 파일 업로드
  Given 사용자가 NBC 메인 페이지에 접속
  When 60MB PDF 파일을 드래그앤드롭
  Then "파일이 너무 큽니다 (최대 50MB)" 에러 메시지
  And 업로드 중단
```

**기술 구현**
```typescript
// components/FileUploader.tsx
'use client';

import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';
import { useState } from 'react';

interface UploadedFile {
  file: File;
  preview: string;
}

export default function FileUploader() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string>('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    maxFiles: 5,
    onDrop: (acceptedFiles, rejectedFiles) => {
      setError('');
      
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0].code === 'file-too-large') {
          setError('파일이 너무 큽니다 (최대 50MB)');
        } else if (rejection.errors[0].code === 'file-invalid-type') {
          setError('PDF 파일만 업로드 가능합니다');
        }
        return;
      }

      const uploadedFiles = acceptedFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      
      setFiles(prev => [...prev, ...uploadedFiles]);
    }
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12
          text-center cursor-pointer transition-all
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400'
          }
          ${error ? 'border-red-500 bg-red-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        
        {error ? (
          <p className="text-red-600 font-medium">{error}</p>
        ) : isDragActive ? (
          <p className="text-blue-600 font-medium">
            여기에 놓으세요
          </p>
        ) : (
          <>
            <p className="text-lg font-medium mb-2">
              PDF 파일을 드래그하거나 클릭하세요
            </p>
            <p className="text-sm text-gray-500">
              최대 50MB, 최대 5개 파일
            </p>
          </>
        )}
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((fileObj, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">{fileObj.file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

#### F2: 자동 변환 (하이브리드)

**우선순위:** P0 (Critical)
**담당:** Backend

**기능 설명**
```
Adobe PDF Services API로 구조를 추출하고,
Claude API로 의미론적 HTML을 생성하는
2단계 하이브리드 변환 프로세스
```

**변환 프로세스**
```
단계 1: 파일 검증 (5%)
├─ PDF 유효성 검사
├─ 파일 크기 체크
└─ 메타데이터 추출

단계 2: Adobe 구조 추출 (10% → 40%)
├─ Adobe API 호출
├─ JSON 구조 수신
├─ 텍스트, 표, 이미지 분리
└─ 폰트/레이아웃 정보 파싱

단계 3: 구조 정제 (45%)
├─ 제목/본문 구분
├─ 카테고리 분류
├─ 박스/테이블 인식
└─ 계층 구조 생성

단계 4: Claude HTML 변환 (50% → 90%)
├─ Claude API 호출
├─ 프롬프트 최적화
├─ HTML 생성
└─ 스타일 적용

단계 5: 후처리 (95%)
├─ HTML 유효성 검사
├─ XSS 방지 처리
└─ 메타데이터 추가

단계 6: 저장 및 완료 (100%)
├─ Vercel Blob에 업로드
├─ DB에 메타데이터 저장
└─ URL 반환
```

**F2.1: Adobe 통합**
```typescript
// lib/adobe.ts
import { PDFServices, ExtractPDFOperation } from '@adobe/pdfservices-node-sdk';

export async function extractStructure(pdfBuffer: Buffer) {
  const credentials = {
    clientId: process.env.ADOBE_CLIENT_ID!,
    clientSecret: process.env.ADOBE_CLIENT_SECRET!
  };

  const pdfServices = new PDFServices({ credentials });
  
  const inputAsset = await pdfServices.upload({
    readStream: Readable.from(pdfBuffer),
    mimeType: 'application/pdf'
  });

  const params = {
    elementsToExtract: ['text', 'tables'],
    tableOutputFormat: 'csv'
  };

  const extractPDFOperation = new ExtractPDFOperation({
    inputAsset,
    params
  });

  const result = await pdfServices.execute({ operation: extractPDFOperation });
  
  const resultAsset = await result.getResultAsset();
  const streamAsset = await pdfServices.getContent({ asset: resultAsset });
  
  const jsonData = await streamToBuffer(streamAsset.readStream);
  return JSON.parse(jsonData.toString());
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
```

**F2.2: Claude 통합**
```typescript
// lib/claude.ts
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `당신은 정부 외신 브리핑 문서를 HTML로 변환하는 전문가입니다.

변환 규칙:
1. 시맨틱 HTML5 사용
2. 구조:
   - 제목: <h1>, <h2>, <h3>
   - 요지 박스: <aside class="summary-box">
   - 카테고리: <section class="category">
   - 뉴스 항목: <article class="news-item">
   - 출처: <cite>
3. 스타일:
   - 인라인 CSS 포함
   - 정부 문서 스타일 (파란색 #003DA5)
   - 반응형 디자인
4. 한글 인코딩 보장`;

const USER_PROMPT_TEMPLATE = `다음 JSON은 Adobe API가 추출한 외신 브리핑 구조입니다:

{structure}

위 구조를 바탕으로 완전한 HTML 문서를 생성하세요.
설명 없이 HTML만 출력하세요.`;

export async function convertToHtml(structure: any): Promise<string> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!
  });

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 10000,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: USER_PROMPT_TEMPLATE.replace(
        '{structure}',
        JSON.stringify(structure, null, 2)
      )
    }]
  });

  const html = message.content[0].text;
  
  // HTML에서 코드블록 마커 제거 (Claude가 ```html로 감쌀 수 있음)
  return html
    .replace(/```html\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
}
```

**F2.3: Fallback 전략**
```typescript
// lib/converter.ts
export async function convertPdf(pdfBuffer: Buffer): Promise<ConversionResult> {
  try {
    // 1순위: Adobe + Claude (하이브리드)
    const structure = await extractStructure(pdfBuffer);
    const html = await convertToHtml(structure);
    return {
      html,
      method: 'hybrid',
      success: true
    };
  } catch (error) {
    if (error instanceof AdobeAPIError) {
      console.warn('Adobe failed, trying Claude only');
      try {
        // 2순위: Claude 단독
        const html = await convertWithClaudeOnly(pdfBuffer);
        return {
          html,
          method: 'claude-only',
          success: true
        };
      } catch (claudeError) {
        console.error('Claude also failed, using basic extraction');
        // 3순위: 기본 텍스트 추출
        const html = await basicTextExtraction(pdfBuffer);
        return {
          html,
          method: 'basic',
          success: true,
          warning: 'Fallback method used'
        };
      }
    }
    throw error;
  }
}

async function convertWithClaudeOnly(pdfBuffer: Buffer): Promise<string> {
  // PDF를 이미지로 변환하여 Claude에 전송 (Vision)
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();
  
  // 첫 5페이지만 (토큰 제한)
  const images = await Promise.all(
    pages.slice(0, 5).map(page => pageToImage(page))
  );
  
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!
  });

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 10000,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'text',
          text: '이 외신 브리핑 문서를 시맨틱 HTML로 변환하세요'
        },
        ...images.map(image => ({
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/png',
            data: image
          }
        }))
      ]
    }]
  });

  return message.content[0].text;
}

async function basicTextExtraction(pdfBuffer: Buffer): Promise<string> {
  const pdf = await pdfParse(pdfBuffer);
  
  // 간단한 텍스트만 추출
  const text = pdf.text;
  
  // 최소한의 HTML 래핑
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>외신 브리핑</title>
  <style>
    body { max-width: 800px; margin: 0 auto; padding: 20px; }
    pre { white-space: pre-wrap; }
  </style>
</head>
<body>
  <pre>${escapeHtml(text)}</pre>
</body>
</html>
  `;
}
```

**F2.4: 진행률 추적**
```typescript
// lib/progress-tracker.ts
import { EventEmitter } from 'events';

export class ConversionProgressTracker extends EventEmitter {
  private progress: number = 0;
  private stage: string = '';

  updateProgress(progress: number, stage: string) {
    this.progress = progress;
    this.stage = stage;
    this.emit('progress', { progress, stage });
  }

  async trackAdobe(operation: Promise<any>) {
    this.updateProgress(10, 'Adobe API 호출 중...');
    const result = await operation;
    this.updateProgress(40, 'PDF 구조 분석 완료');
    return result;
  }

  async trackClaude(operation: Promise<any>) {
    this.updateProgress(50, 'Claude API 호출 중...');
    const result = await operation;
    this.updateProgress(90, 'HTML 생성 완료');
    return result;
  }
}

// API Route에서 사용
export async function POST(request: NextRequest) {
  const tracker = new ConversionProgressTracker();
  
  // Server-Sent Events로 진행률 전송
  const stream = new ReadableStream({
    start(controller) {
      tracker.on('progress', ({ progress, stage }) => {
        controller.enqueue(
          `data: ${JSON.stringify({ progress, stage })}\n\n`
        );
      });
    }
  });

  // ... conversion logic
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

**검증 기준**
```gherkin
Scenario: 정상 변환 (하이브리드)
  Given PDF 파일이 업로드됨
  When 변환 시작
  Then Adobe API 성공
  And Claude API 성공
  And HTML 파일 생성
  And 변환 시간 < 30초

Scenario: Adobe 실패 시 Fallback
  Given PDF 파일이 업로드됨
  And Adobe API가 오류 반환
  When 변환 시작
  Then Claude 단독 모드 실행
  And HTML 파일 생성
  And 경고 메시지 표시

Scenario: 모든 API 실패
  Given PDF 파일이 업로드됨
  And Adobe API 오류
  And Claude API 오류
  When 변환 시작
  Then 기본 텍스트 추출
  And HTML 파일 생성
  And "일부 기능이 제한됩니다" 경고
```

---

#### F3: HTML 출력 및 표시

**우선순위:** P0 (Critical)
**담당:** Frontend

**기능 설명**
```
변환된 HTML을 사용자에게 표시하고,
저장/공유/다운로드할 수 있는 기능
```

**F3.1: 인라인 뷰어**
```typescript
// components/HTMLViewer.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import DOMPurify from 'isomorphic-dompurify';

interface HTMLViewerProps {
  html: string;
  title?: string;
}

export default function HTMLViewer({ html, title }: HTMLViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (doc) {
        // XSS 방지
        const cleanHtml = DOMPurify.sanitize(html, {
          ALLOWED_TAGS: ['html', 'head', 'body', 'h1', 'h2', 'h3', 'p', 
                         'div', 'span', 'section', 'article', 'aside',
                         'ul', 'ol', 'li', 'table', 'tr', 'td', 'th',
                         'cite', 'strong', 'em', 'style', 'meta'],
          ALLOWED_ATTR: ['class', 'id', 'style', 'href', 'charset', 'name', 'content']
        });
        
        doc.open();
        doc.write(cleanHtml);
        doc.close();
      }
    }
  }, [html]);

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">{title || '변환 결과'}</h2>
        <div className="flex gap-2">
          <Button onClick={() => handleDownload()}>
            <Download className="mr-2" />
            다운로드
          </Button>
          <Button onClick={() => handleShare()}>
            <Share className="mr-2" />
            공유
          </Button>
          <Button onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <Minimize /> : <Maximize />}
          </Button>
        </div>
      </div>
      
      <iframe
        ref={iframeRef}
        className="w-full border-0"
        style={{ height: isFullscreen ? 'calc(100vh - 60px)' : '800px' }}
        sandbox="allow-same-origin"
        title="HTML Preview"
      />
    </div>
  );
}
```

**F3.2: 다운로드 기능**
```typescript
function handleDownload() {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `외신브리핑_${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

**F3.3: URL 공유**
```typescript
async function handleShare() {
  const shareUrl = `${window.location.origin}/view/${conversionId}`;
  
  if (navigator.share) {
    // 모바일 네이티브 공유
    await navigator.share({
      title: '외신 브리핑',
      url: shareUrl
    });
  } else {
    // 클립보드 복사
    await navigator.clipboard.writeText(shareUrl);
    toast.success('링크가 클립보드에 복사되었습니다');
  }
}
```

---

#### F4: 변환 히스토리

**우선순위:** P1 (High)
**담당:** Full-stack

**기능 설명**
```
과거 변환 내역을 조회하고 재열람할 수 있는 기능
```

**F4.1: 히스토리 목록**
```typescript
// app/history/page.tsx
import { getConversionHistory } from '@/lib/db';

export default async function HistoryPage() {
  const history = await getConversionHistory({ limit: 30 });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">변환 히스토리</h1>
      
      <div className="space-y-4">
        {history.map(item => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
          >
            <div className="flex-1">
              <h3 className="font-medium">{item.fileName}</h3>
              <div className="flex gap-4 text-sm text-gray-500 mt-1">
                <span>{formatDate(item.createdAt)}</span>
                <span>{formatFileSize(item.fileSize)}</span>
                <span className={getStatusColor(item.status)}>
                  {getStatusLabel(item.status)}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/view/${item.id}`)}
              >
                열기
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**F4.2: 필터 및 검색**
```typescript
// components/HistoryFilter.tsx
export function HistoryFilter() {
  return (
    <div className="flex gap-4 mb-6">
      <Input
        placeholder="파일명 검색..."
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      
      <Select
        value={statusFilter}
        onValueChange={setStatusFilter}
      >
        <SelectItem value="all">모든 상태</SelectItem>
        <SelectItem value="completed">완료</SelectItem>
        <SelectItem value="failed">실패</SelectItem>
      </Select>
      
      <DatePicker
        value={dateRange}
        onChange={setDateRange}
      />
    </div>
  );
}
```

---

### 5.2 중요 기능 (Phase 2 - Should Have)

#### F5: 사용자 인증

**우선순위:** P2
**담당:** Backend

**기능 설명**
```
이메일 기반 간단한 인증으로 개인 히스토리 관리
```

**구현 방식**
```typescript
// NextAuth.js 사용
import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';

export default NextAuth({
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM
    })
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    }
  }
});
```

---

#### F6: 이메일 자동 모니터링

**우선순위:** P2
**담당:** Backend

**기능 설명**
```
정부 외신팀 이메일을 자동으로 감지하고
첨부된 PDF를 자동 변환
```

**구현 방식**
```typescript
// lib/email-monitor.ts
import Imap from 'imap';
import { simpleParser } from 'mailparser';

export class EmailMonitor {
  private imap: Imap;

  constructor() {
    this.imap = new Imap({
      user: process.env.EMAIL_USER!,
      password: process.env.EMAIL_PASSWORD!,
      host: 'imap.gmail.com',
      port: 993,
      tls: true
    });
  }

  async start() {
    this.imap.once('ready', () => {
      this.imap.openBox('INBOX', false, (err, box) => {
        if (err) throw err;
        
        // 새 이메일 감지
        this.imap.on('mail', () => {
          this.checkNewMails();
        });
      });
    });

    this.imap.connect();
  }

  private async checkNewMails() {
    // 정부 외신팀 이메일만 필터
    this.imap.search(['UNSEEN', ['FROM', 'overseas@korea.kr']], 
      async (err, results) => {
        if (err || !results.length) return;

        const fetch = this.imap.fetch(results, { bodies: '' });
        
        fetch.on('message', (msg) => {
          msg.on('body', async (stream) => {
            const parsed = await simpleParser(stream);
            
            // PDF 첨부 파일 찾기
            const pdfAttachment = parsed.attachments.find(
              att => att.contentType === 'application/pdf'
            );

            if (pdfAttachment) {
              // 자동 변환 시작
              await convertPdf(pdfAttachment.content);
              
              // Slack 알림
              await sendSlackNotification({
                text: '외신 브리핑이 자동 변환되었습니다',
                url: conversionUrl
              });
            }
          });
        });
      }
    );
  }
}

// Cron으로 실행 (Vercel Cron)
export async function GET(request: NextRequest) {
  const monitor = new EmailMonitor();
  await monitor.start();
  
  return NextResponse.json({ status: 'monitoring' });
}
```

---

#### F7: 댓글 시스템

**우선순위:** P3
**담당:** Full-stack

**기능 설명**
```
변환된 문서에 팀원들이 댓글을 달 수 있는 기능
```

---

### 5.3 부가 기능 (Phase 3 - Nice to Have)

#### F8: AI 요약

**우선순위:** P3
**담당:** Backend

**기능 설명**
```
Claude를 활용한 1분 브리핑 자동 생성
```

**구현 방식**
```typescript
async function generateSummary(html: string): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: `다음 외신 브리핑을 3개 문장으로 요약하세요:

${html}

각 문장은 핵심 이슈 하나만 다루세요.`
    }]
  });

  return message.content[0].text;
}
```

---

#### F9: 트렌드 분석

**우선순위:** P4
**담당:** Data

**기능 설명**
```
과거 브리핑 데이터 분석으로 트렌드 시각화
```

---

## 6. 기술 요구사항

### 6.1 시스템 아키텍처
```
┌──────────────────────────────────────────────────────┐
│                     사용자 계층                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Desktop  │  │  Mobile  │  │  Tablet  │          │
│  │ Browser  │  │ Browser  │  │ Browser  │          │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘          │
└───────┼─────────────┼─────────────┼─────────────────┘
        │             │             │
        └─────────────┼─────────────┘
                      │ HTTPS
        ┌─────────────▼─────────────┐
        │      CDN (Vercel Edge)    │
        │  - Global Distribution    │
        │  - Auto HTTPS/HTTP2       │
        │  - DDoS Protection        │
        └─────────────┬─────────────┘
                      │
┌─────────────────────▼─────────────────────────────────┐
│              Next.js App (Vercel)                     │
├───────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │         Frontend (React Server + Client)    │    │
│  ├─────────────────────────────────────────────┤    │
│  │  App Router (Next.js 15)                    │    │
│  │  ├─ page.tsx              (Home)            │    │
│  │  ├─ convert/page.tsx      (Conversion)      │    │
│  │  ├─ history/page.tsx      (History)         │    │
│  │  ├─ view/[id]/page.tsx    (Viewer)          │    │
│  │  └─ api/                  (API Routes)      │    │
│  └─────────────────────────────────────────────┘    │
│                      │                               │
│  ┌─────────────────────────────────────────────┐    │
│  │         Backend (API Routes)                │    │
│  ├─────────────────────────────────────────────┤    │
│  │  /api/convert                               │    │
│  │  /api/upload                                │    │
│  │  /api/status/[id]                           │    │
│  │  /api/history                               │    │
│  └─────────────────────────────────────────────┘    │
│                      │                               │
│  ┌─────────────────────────────────────────────┐    │
│  │         Service Layer                       │    │
│  ├─────────────────────────────────────────────┤    │
│  │  - Adobe Client                             │    │
│  │  - Claude Client                            │    │
│  │  - Conversion Engine                        │    │
│  │  - Storage Manager                          │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
└───────┬───────────────┬───────────────┬──────────────┘
        │               │               │
        ▼               ▼               ▼
┌───────────────┐ ┌─────────────┐ ┌────────────────┐
│  Vercel       │ │  Vercel     │ │  External APIs │
│  Postgres     │ │  Blob       │ │  ┌──────────┐  │
│  ┌─────────┐  │ │  Storage    │ │  │  Adobe   │  │
│  │Metadata │  │ │  ┌───────┐  │ │  │  PDF     │  │
│  │History  │  │ │  │ HTML  │  │ │  │ Services │  │
│  │Users    │  │ │  │ Files │  │ │  └──────────┘  │
│  └─────────┘  │ │  └───────┘  │ │  ┌──────────┐  │
└───────────────┘ └─────────────┘ │  │  Claude  │  │
                                   │  │  API     │  │
                                   │  └──────────┘  │
                                   └────────────────┘
```

### 6.2 기술 스택 상세

#### Frontend
```typescript
// package.json (Frontend Dependencies)
{
  "dependencies": {
    // Framework
    "next": "^15.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    
    // TypeScript
    "typescript": "^5.3.0",
    "@types/react": "^18.3.0",
    "@types/node": "^20.0.0",
    
    // UI Components
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-toast": "^1.1.5",
    "lucide-react": "^0.400.0",
    
    // Forms & Validation
    "react-hook-form": "^7.51.0",
    "zod": "^3.23.0",
    
    // File Upload
    "react-dropzone": "^14.2.0",
    
    // State Management
    "zustand": "^4.5.0",
    
    // Styling
    "tailwindcss": "^3.4.0",
    "tailwind-merge": "^2.3.0",
    "clsx": "^2.1.0",
    
    // Security
    "isomorphic-dompurify": "^2.11.0",
    
    // Utils
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.13",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38"
  }
}
```

#### Backend
```typescript
// package.json (Backend Dependencies)
{
  "dependencies": {
    // PDF Processing
    "@adobe/pdfservices-node-sdk": "^4.0.0",
    "pdf-parse": "^1.1.1",
    "pdf-lib": "^1.17.1",
    
    // AI
    "@anthropic-ai/sdk": "^0.20.0",
    
    // Storage
    "@vercel/blob": "^0.22.0",
    
    // Database
    "@vercel/postgres": "^0.8.0",
    "drizzle-orm": "^0.30.0",
    
    // Authentication (Phase 2)
    "next-auth": "^5.0.0-beta",
    
    // Email (Phase 2)
    "nodemailer": "^6.9.13",
    "imap": "^0.8.19",
    "mailparser": "^3.6.9",
    
    // Utils
    "nanoid": "^5.0.7"
  },
  "devDependencies": {
    "drizzle-kit": "^0.20.0"
  }
}
```

### 6.3 데이터 흐름
```
┌─────────────────────────────────────────────────────┐
│                  1. Upload Flow                     │
└─────────────────────────────────────────────────────┘

User
  │
  ├─ 1. Drag & Drop PDF
  │
  ▼
Frontend (FileUploader.tsx)
  │
  ├─ 2. Validate File
  │    - Type: application/pdf
  │    - Size: < 50MB
  │
  ├─ 3. Create FormData
  │
  ▼
POST /api/upload
  │
  ├─ 4. Parse File
  │
  ├─ 5. Generate Job ID (nanoid)
  │
  ├─ 6. Save to Vercel Blob (temp)
  │
  ├─ 7. Create DB Record
  │    INSERT INTO conversions
  │    (id, fileName, status: 'pending')
  │
  ▼
Return { jobId, uploadUrl }


┌─────────────────────────────────────────────────────┐
│                2. Conversion Flow                   │
└─────────────────────────────────────────────────────┘

POST /api/convert
  │
  ├─ 1. Get File from Blob
  │
  ├─ 2. Update Status: 'processing'
  │
  ▼
Adobe PDF Services
  │
  ├─ 3. POST /extract (Adobe API)
  │    Body: { file: base64 }
  │
  ├─ 4. Receive JSON Structure
  │    {
  │      elements: [...],
  │      tables: [...],
  │      images: [...]
  │    }
  │
  ▼
Conversion Engine
  │
  ├─ 5. Parse Structure
  │    - Identify Headers (h1, h2, h3)
  │    - Find Summary Boxes
  │    - Detect Categories
  │    - Extract Tables
  │
  ├─ 6. Build Simplified JSON
  │
  ▼
Claude API
  │
  ├─ 7. POST /messages (Claude API)
  │    Body: {
  │      model: "claude-sonnet-4",
  │      messages: [{
  │        role: "user",
  │        content: "Convert to HTML: {json}"
  │      }]
  │    }
  │
  ├─ 8. Receive HTML String
  │
  ▼
Post-Processing
  │
  ├─ 9. Sanitize HTML (DOMPurify)
  │
  ├─ 10. Add Meta Tags
  │
  ├─ 11. Validate HTML
  │
  ▼
Storage
  │
  ├─ 12. Upload to Vercel Blob
  │     put('converted/{jobId}.html', html)
  │
  ├─ 13. Update DB Record
  │     UPDATE conversions
  │     SET status = 'completed',
  │         outputUrl = {url},
  │         completedAt = NOW()
  │
  ▼
Return {
  success: true,
  url: outputUrl,
  jobId: jobId
}
```

### 6.4 폴더 구조
```
newbrief-converter/
├── app/
│   ├── (auth)/                    # Auth layout group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (main)/                    # Main app layout
│   │   ├── page.tsx               # Home page
│   │   ├── convert/
│   │   │   └── page.tsx           # Conversion page
│   │   ├── history/
│   │   │   ├── page.tsx           # History list
│   │   │   └── [id]/
│   │   │       └── page.tsx       # History detail
│   │   ├── view/
│   │   │   └── [id]/
│   │   │       └── page.tsx       # HTML viewer
│   │   └── layout.tsx
│   │
│   ├── api/
│   │   ├── upload/
│   │   │   └── route.ts           # File upload
│   │   ├── convert/
│   │   │   └── route.ts           # Start conversion
│   │   ├── status/
│   │   │   └── [id]/
│   │   │       └── route.ts       # Get conversion status
│   │   ├── history/
│   │   │   └── route.ts           # Get history
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts       # NextAuth
│   │   └── cron/
│   │       └── email-monitor/
│   │           └── route.ts       # Email monitoring cron
│   │
│   ├── layout.tsx                 # Root layout
│   ├── globals.css                # Global styles
│   └── providers.tsx              # Context providers
│
├── components/
│   ├── ui/                        # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── select.tsx
│   │   └── toast.tsx
│   │
│   ├── file-uploader.tsx          # File upload component
│   ├── conversion-progress.tsx    # Progress indicator
│   ├── html-viewer.tsx            # HTML preview
│   ├── history-list.tsx           # History list
│   ├── history-filter.tsx         # History filters
│   ├── mobile-nav.tsx             # Mobile navigation
│   └── theme-toggle.tsx           # Dark mode toggle
│
├── lib/
│   ├── adobe.ts                   # Adobe API client
│   ├── claude.ts                  # Claude API client
│   ├── converter.ts               # Main conversion logic
│   ├── fallback.ts                # Fallback strategies
│   ├── progress-tracker.ts        # Progress tracking
│   ├── storage.ts                 # Vercel Blob client
│   ├── db.ts                      # Database client
│   ├── email-monitor.ts           # Email monitoring (Phase 2)
│   ├── utils.ts                   # Utility functions
│   └── validations.ts             # Zod schemas
│
├── db/
│   ├── schema.ts                  # Drizzle schema
│   └── migrations/                # DB migrations
│       └── 0001_initial.sql
│
├── types/
│   ├── index.ts                   # Shared types
│   ├── api.ts                     # API types
│   └── database.ts                # Database types
│
├── hooks/
│   ├── use-conversion.ts          # Conversion hook
│   ├── use-history.ts             # History hook
│   └── use-toast.ts               # Toast hook
│
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── samples/
│       └── sample-briefing.pdf    # Sample file
│
├── config/
│   ├── site.ts                    # Site config
│   └── constants.ts               # Constants
│
├── .env.local                     # Environment variables
├── .env.example                   # Environment template
├── next.config.js                 # Next.js config
├── tailwind.config.ts             # Tailwind config
├── tsconfig.json                  # TypeScript config
├── package.json
├── drizzle.config.ts              # Drizzle config
└── README.md
```

### 6.5 환경 변수
```bash
# .env.local

# Adobe PDF Services API
ADOBE_CLIENT_ID=your_adobe_client_id
ADOBE_CLIENT_SECRET=your_adobe_client_secret

# Anthropic Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# Vercel Postgres
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_non_pooling_url

# NextAuth (Phase 2)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Email (Phase 2)
EMAIL_SERVER=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password

# Slack (Phase 2)
SLACK_WEBHOOK_URL=your_slack_webhook_url

# Feature Flags
ENABLE_EMAIL_MONITORING=false
ENABLE_AI_SUMMARY=false
```

### 6.6 성능 최적화
```typescript
// 1. React Server Components (RSC)
// app/page.tsx
export default async function Home() {
  // 서버에서 데이터 fetch (클라이언트 JS 불필요)
  const recentConversions = await getRecentConversions();
  
  return (
    <div>
      {/* Static HTML 전송 */}
      <RecentList items={recentConversions} />
    </div>
  );
}

// 2. Streaming SSR
// app/history/page.tsx
import { Suspense } from 'react';

export default function HistoryPage() {
  return (
    <Suspense fallback={<HistorySkelet/>}>
      <HistoryList />
    </Suspense>
  );
}

// 3. Image Optimization
import Image from 'next/image';

<Image
  src="/logo.svg"
  alt="NBC Logo"
  width={200}
  height={50}
  priority
/>

// 4. Dynamic Import (Code Splitting)
const HTMLViewer = dynamic(() => import('@/components/html-viewer'), {
  loading: () => <Spinner />,
  ssr: false
});

// 5. API Response Caching
export async function GET(request: NextRequest) {
  const data = await getConversions();
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
    }
  });
}

// 6. Database Query Optimization
import { sql } from '@vercel/postgres';

// Bad
const conversions = await sql`SELECT * FROM conversions`;

// Good
const conversions = await sql`
  SELECT id, fileName, status, createdAt
  FROM conversions
  WHERE userId = ${userId}
  ORDER BY createdAt DESC
  LIMIT 30
`;
```

---

## 7. UI/UX 요구사항

### 7.1 디자인 시스템

#### 색상 팔레트
```css
:root {
  /* Primary Colors */
  --primary-50: #E3F2FD;
  --primary-100: #BBDEFB;
  --primary-500: #003DA5;
  --primary-600: #002870;
  --primary-700: #001D4A;
  
  /* Neutral Colors */
  --gray-50: #FAFAFA;
  --gray-100: #F5F5F5;
  --gray-200: #EEEEEE;
  --gray-300: #E0E0E0;
  --gray-500: #9E9E9E;
  --gray-700: #616161;
  --gray-900: #212121;
  
  /* Semantic Colors */
  --success: #4CAF50;
  --warning: #FF9800;
  --error: #F44336;
  --info: #2196F3;
  
  /* Background */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F5F5F5;
  --bg-tertiary: #FAFAFA;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #121212;
    --bg-secondary: #1E1E1E;
    --bg-tertiary: #2C2C2C;
    --gray-900: #E0E0E0;
    --gray-700: #BDBDBD;
  }
}
```

#### 타이포그래피
```css
/* Font Family */
--font-sans: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

#### 간격 시스템
```css
/* Spacing Scale (8px base) */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

### 7.2 주요 화면 상세

#### 화면 1: 메인 (랜딩)
```
┌────────────────────────────────────────────────┐
│  [NBC Logo]              [히스토리] [로그인]   │
├────────────────────────────────────────────────┤
│                                                │
│              외신 브리핑 변환기                │
│      PDF를 웹 친화적인 HTML로 자동 변환        │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │                                          │ │
│  │   📄 PDF 파일을 여기에 드래그하세요      │ │
│  │                                          │ │
│  │           또는 [파일 선택]               │ │
│  │                                          │ │
│  │   ✅ 자동 변환 (30초)                    │ │
│  │   ✅ 모든 기기 지원                      │ │
│  │   ✅ 검색 가능                           │ │
│  │                                          │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  최근 변환                                     │
│  ├─ 📄 외신브리핑_20251018.pdf  [열기]        │
│  ├─ 📄 외신브리핑_20251017.pdf  [열기]        │
│  └─ 📄 외신브리핑_20251016.pdf  [열기]        │
│                                                │
│              [모두 보기 →]                     │
│                                                │
└────────────────────────────────────────────────┘

반응형 브레이크포인트:
- Mobile: < 640px (1 column)
- Tablet: 640px - 1024px
- Desktop: > 1024px
```

#### 화면 2: 변환 진행
```
┌────────────────────────────────────────────────┐
│  ← 뒤로              변환 중...                │
├────────────────────────────────────────────────┤
│                                                │
│        외신브리핑_20251018.pdf                 │
│                                                │
│  [████████████████░░░░░░░] 65%                │
│                                                │
│  현재 단계: Claude API로 HTML 변환 중...       │
│  예상 완료: 10초 남음                          │
│                                                │
│  ✅ PDF 유효성 검사 완료                       │
│  ✅ Adobe API 구조 추출 완료                   │
│  ⏳ Claude API HTML 변환 중...                 │
│  ⏸️  후처리 대기 중                            │
│                                                │
│             [취소]                             │
│                                                │
└────────────────────────────────────────────────┘

애니메이션:
- 진행률 바: smooth transition
- 단계 아이콘: pulse effect
- 예상 시간: countdown
```

#### 화면 3: 변환 완료
```
┌────────────────────────────────────────────────┐
│  ← 뒤로         변환 완료 🎉                   │
├────────────────────────────────────────────────┤
│                                                │
│     외신브리핑_20251018.html                   │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  📊 변환 정보                            │ │
│  │  • 소요 시간: 28초                       │ │
│  │  • 파일 크기: 245 KB                     │ │
│  │  • 변환 방식: 하이브리드                 │ │
│  │  • 페이지 수: 9페이지                    │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  [🌐 브라우저에서 열기]                  │ │
│  │  [📥 HTML 다운로드]                      │ │
│  │  [🔗 링크 복사]                          │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  공유하기                                      │
│  [Slack] [Email] [Notion]                     │
│                                                │
│             [다른 파일 변환하기]               │
│                                                │
└────────────────────────────────────────────────┘
```

#### 화면 4: HTML 뷰어
```
┌────────────────────────────────────────────────┐
│  [NBC] 외신브리핑_20251018      [🔍] [⚙️] [✕] │
├────────────────────────────────────────────────┤
│  [⬅️ 뒤로] [📥] [🔗] [💬] [⚡ 요약]    [⛶ 전체]│
├────────────────────────────────────────────────┤
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  일일 외신 보도 동향                     │ │
│  │  2025.10.18(금)                          │ │
│  │                                          │ │
│  │  [요지]                                  │ │
│  │  ○ 국내 정치                            │ │
│  │  ○ 북한                                 │ │
│  │  ...                                     │ │
│  │                                          │ │
│  │  ■ 국내 정치                            │ │
│  │  ○ 이재명 정부하에서의 외교 정책...     │ │
│  │                                          │ │
│  └──────────────────────────────────────────┘ │
│                                                │
└────────────────────────────────────────────────┘

기능:
- 전체 화면 지원
- Ctrl+F 검색
- 다크모드
- 인쇄 최적화
- 텍스트 선택/복사
```

#### 화면 5: 히스토리
```
┌────────────────────────────────────────────────┐
│  [NBC]              히스토리                   │
├────────────────────────────────────────────────┤
│  [🔍 검색...]  [📅 날짜] [📊 상태] [⚙️ 설정]  │
├────────────────────────────────────────────────┤
│                                                │
│  최근 30일                                     │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ 📄 외신브리핑_20251018.pdf         ✅    │ │
│  │ 2025.10.18 08:35 • 2.5 MB • 28초         │ │
│  │ [열기] [다운로드] [공유] [삭제]          │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ 📄 외신브리핑_20251017.pdf         ✅    │ │
│  │ 2025.10.17 08:32 • 2.3 MB • 25초         │ │
│  │ [열기] [다운로드] [공유] [삭제]          │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ 📄 외신브리핑_20251016.pdf         ❌    │ │
│  │ 2025.10.16 08:30 • Adobe API 오류        │ │
│  │ [재시도] [삭제]                          │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│              [더 보기...]                      │
│                                                │
└────────────────────────────────────────────────┘
```

### 7.3 모바일 최적화
```
━━━━━━━━━━━━━━━━━━━━━━━
 [☰]    NBC        [👤]
━━━━━━━━━━━━━━━━━━━━━━━

 외신 브리핑 변환기
━━━━━━━━━━━━━━━━━━━━━━━

 ┌─────────────────────┐
 │                     │
 │   📄 PDF 드래그     │
 │                     │
 │   또는 [파일 선택]  │
 │                     │
 └─────────────────────┘

 최근 변환
 ┌─────────────────────┐
 │ 외신브리핑_1018.pdf │
 │ 10/18 • 2.5MB      │
 │ [열기]              │
 └─────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━

모바일 특화 기능:
- 터치 제스처 지원
- Pull to refresh
- Bottom sheet 네비게이션
- 네이티브 공유 API
- PWA 지원 (홈 화면 추가)
```

### 7.4 접근성 (a11y)
```typescript
// 1. Semantic HTML
<main>
  <section aria-labelledby="upload-section">
    <h2 id="upload-section">파일 업로드</h2>
  </section>
</main>

// 2. ARIA Labels
<button aria-label="파일 삭제">
  <Trash2 />
</button>

// 3. Keyboard Navigation
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>

// 4. Focus Management
const dialogRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (isOpen) {
    dialogRef.current?.focus();
  }
}, [isOpen]);

// 5. Screen Reader Support
<div role="status" aria-live="polite">
  {isLoading ? '변환 중...' : '변환 완료'}
</div>
```

### 7.5 인터랙션 디자인
```typescript
// 1. Micro-interactions
const Button = ({ children, ...props }) => (
  <button
    className="
      transform transition-all duration-150
      hover:scale-105 hover:shadow-lg
      active:scale-95
      disabled:opacity-50 disabled:cursor-not-allowed
    "
    {...props}
  >
    {children}
  </button>
);

// 2. Loading States
const LoadingButton = ({ loading, children }) => (
  <button disabled={loading}>
    {loading ? (
      <>
        <Spinner className="mr-2" />
        처리 중...
      </>
    ) : children}
  </button>
);

// 3. Empty States
const EmptyState = () => (
  <div className="text-center py-12">
    <FileX className="w-16 h-16 mx-auto text-gray-400 mb-4" />
    <h3 className="text-lg font-medium mb-2">
      아직 변환한 파일이 없습니다
    </h3>
    <p className="text-gray-500 mb-4">
      첫 번째 파일을 업로드해보세요
    </p>
    <Button>파일 업로드</Button>
  </div>
);

// 4. Error States
const ErrorState = ({ error, onRetry }) => (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>오류 발생</AlertTitle>
    <AlertDescription>
      {error.message}
      <Button onClick={onRetry} className="mt-2">
        다시 시도
      </Button>
    </AlertDescription>
  </Alert>
);

// 5. Success Feedback
const SuccessToast = () => {
  toast.success('변환이 완료되었습니다', {
    description: 'HTML 파일이 생성되었습니다',
    action: {
      label: '열기',
      onClick: () => window.open(url)
    }
  });
};
```

---

## 8. 성능 요구사항

### 8.1 응답 시간 목표
```
작업                    목표      최대      측정 방법
────────────────────────────────────────────────────
페이지 로드 (FCP)       < 1초    < 2초     Lighthouse
페이지 인터랙티브 (TTI) < 2초    < 3초     Lighthouse
파일 업로드             즉시     < 1초     Performance API
변환 시작 (API 응답)    < 500ms  < 1초     APM
변환 완료 (9페이지)     < 30초   < 60초    Custom metric
변환 완료 (20페이지)    < 60초   < 120초   Custom metric
히스토리 로드           < 500ms  < 1초     React DevTools
검색 결과               < 300ms  < 500ms   Custom metric
```

### 8.2 Core Web Vitals
```
메트릭                          목표       측정 도구
──────────────────────────────────────────────────
LCP (Largest Contentful Paint)  < 2.5초    Lighthouse
FID (First Input Delay)         < 100ms    Real User Monitoring
CLS (Cumulative Layout Shift)   < 0.1      Lighthouse

모바일 성능 점수 (Lighthouse)   > 90
데스크톱 성능 점수 (Lighthouse) > 95
```

### 8.3 리소스 사용
```
리소스              유휴     변환 중    최대      제한
───────────────────────────────────────────────────
메모리 (Browser)    < 50MB   < 200MB   < 500MB   -
CPU (Browser)       < 5%     < 50%     < 80%     -
네트워크 (Upload)   -        ~2MB/s    -         50MB/file
네트워크 (Download) -        ~500KB/s  -         -
API 호출 (Adobe)    -        1 call    -         25/min
API 호출 (Claude)   -        1 call    -         50/min
Database 연결       5        10        50        100 (pool)
```

### 8.4 확장성
```
지표                현재 (MVP)    Phase 2     Phase 3
──────────────────────────────────────────────────
동시 사용자         1            10          100
일일 변환 건수      2            20          200
월간 변환 건수      40           400         4,000
저장 용량          100MB        1GB         10GB
대역폭 (월)        1GB          10GB        100GB
```

### 8.5 성능 모니터링
```typescript
// 1. Web Vitals 측정
import { getCLS, getFID, getLCP } from 'web-vitals';

function sendToAnalytics(metric) {
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify(metric)
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getLCP(sendToAnalytics);

// 2. Custom Performance Metrics
export function measureConversionTime(jobId: string) {
  const startTime = performance.now();
  
  return {
    end: () => {
      const duration = performance.now() - startTime;
      
      // Send to analytics
      trackEvent('conversion_completed', {
        jobId,
        duration,
        success: true
      });
    }
  };
}

// 3. API Performance Monitoring
export async function monitoredFetch(url: string, options: RequestInit) {
  const start = performance.now();
  
  try {
    const response = await fetch(url, options);
    const duration = performance.now() - start;
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request: ${url} took ${duration}ms`);
    }
    
    return response;
  } catch (error) {
    const duration = performance.now() - start;
    
    // Log failed requests
    console.error(`Failed request: ${url} failed after ${duration}ms`, error);
    throw error;
  }
}

// 4. Database Query Performance
import { sql } from '@vercel/postgres';

export async function monitoredQuery(query: string, params: any[]) {
  const start = Date.now();
  
  try {
    const result = await sql.query(query, params);
    const duration = Date.now() - start;
    
    // Log slow queries
    if (duration > 100) {
      console.warn(`Slow query: ${query} took ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    console.error(`Query failed: ${query}`, error);
    throw error;
  }
}
```

---

## 9. 보안 요구사항

### 9.1 인증 및 권한
```typescript
// Phase 1: 인증 없음 (오픈 액세스)
// Phase 2: 이메일 인증

// middleware.ts
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  // Protected routes
  const protectedPaths = ['/history', '/api/convert'];
  const isProtected = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/history/:path*', '/api/convert/:path*']
};
```

### 9.2 데이터 보안
```typescript
// 1. API 키 보안
// ❌ Bad: 클라이언트에 노출
const apiKey = 'sk-ant-...';

// ✅ Good: 서버 환경변수
const apiKey = process.env.ANTHROPIC_API_KEY;

// 2. XSS 방지
import DOMPurify from 'isomorphic-dompurify';

const sanitizedHtml = DOMPurify.sanitize(html, {
  ALLOWED_TAGS: ['h1', 'h2', 'p', 'div', ...],
  ALLOWED_ATTR: ['class', 'id'],
  FORBID_TAGS: ['script', 'iframe', 'embed'],
  FORBID_ATTR: ['onerror', 'onclick']
});

// 3. CSRF 보호
// Next.js API Routes는 기본적으로 CSRF 토큰 검증
// 추가 보호: SameSite 쿠키
const response = NextResponse.json(data);
response.cookies.set('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});

// 4. Rate Limiting
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true
});

export async function POST(request: NextRequest) {
  const identifier = request.ip ?? 'anonymous';
  const { success } = await ratelimit.limit(identifier);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  // Process request...
}

// 5. 파일 업로드 검증
function validateFile(file: File) {
  // 파일 타입 검증
  if (file.type !== 'application/pdf') {
    throw new Error('PDF 파일만 허용됩니다');
  }
  
  // 파일 크기 검증
  if (file.size > 50 * 1024 * 1024) {
    throw new Error('파일 크기는 50MB 이하여야 합니다');
  }
  
  // 파일 확장자 검증 (MIME 우회 방지)
  if (!file.name.endsWith('.pdf')) {
    throw new Error('PDF 파일만 허용됩니다');
  }
  
  // 매직 넘버 검증 (실제 PDF인지)
  const buffer = await file.arrayBuffer();
  const header = new Uint8Array(buffer.slice(0, 4));
  const magicNumber = '%PDF';
  const actualHeader = String.fromCharCode(...header.slice(0, 4));
  
  if (actualHeader !== magicNumber) {
    throw new Error('유효한 PDF 파일이 아닙니다');
  }
}
```

### 9.3 통신 보안
```typescript
// 1. HTTPS 강제
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}

// 2. Content Security Policy
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' https://api.anthropic.com https://pdf-services.adobe.io;
      frame-ancestors 'none';
    `.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ];
  }
};
```

### 9.4 보안 체크리스트
```markdown
## Phase 1 (MVP)
- [x] HTTPS 강제
- [x] 환경변수로 API 키 관리
- [x] XSS 방지 (DOMPurify)
- [x] 파일 업로드 검증
- [x] Rate limiting
- [ ] CSP 헤더 설정
- [ ] 보안 헤더 설정

## Phase 2
- [ ] 사용자 인증 (NextAuth)
- [ ] CSRF 보호
- [ ] 세션 관리
- [ ] 비밀번호 해싱 (bcrypt)
- [ ] 2FA (선택사항)

## Phase 3
- [ ] 정기 보안 감사
- [ ] 취약점 스캔 (Snyk)
- [ ] 침투 테스트
- [ ] 보안 로그 모니터링
```

---

## 10. API 명세

### 10.1 Upload API
```
POST /api/upload
```

**Request**
```typescript
Content-Type: multipart/form-data

{
  file: File  // PDF file
}
```

**Response (200 OK)**
```typescript
{
  success: true,
  jobId: string,          // "j_abc123xyz"
  fileName: string,       // "외신브리핑_20251018.pdf"
  fileSize: number,       // 2621440 (bytes)
  uploadUrl: string,      // "https://blob.vercel-storage.com/..."
  message: string         // "파일 업로드 완료"
}
```

**Error Responses**
```typescript
// 400 Bad Request
{
  success: false,
  error: "FILE_TOO_LARGE",
  message: "파일 크기는 50MB 이하여야 합니다",
  maxSize: 52428800
}

// 400 Bad Request
{
  success: false,
  error: "INVALID_FILE_TYPE",
  message: "PDF 파일만 업로드 가능합니다",
  allowedTypes: ["application/pdf"]
}

// 500 Internal Server Error
{
  success: false,
  error: "UPLOAD_FAILED",
  message: "파일 업로드 중 오류가 발생했습니다"
}
```

---

### 10.2 Convert API
```
POST /api/convert
```

**Request**
```typescript
Content-Type: application/json

{
  jobId: string,          // "j_abc123xyz"
  options?: {
    method?: 'hybrid' | 'claude-only' | 'auto',
    enableSummary?: boolean
  }
}
```

**Response (200 OK)**
```typescript
{
  success: true,
  jobId: string,
  status: 'processing',
  message: '변환이 시작되었습니다'
}
```

**SSE Progress Updates**
```
Content-Type: text/event-stream

data: {"progress": 10, "stage": "Adobe API 호출 중..."}

data: {"progress": 40, "stage": "PDF 구조 분석 완료"}

data: {"progress": 50, "stage": "Claude API 호출 중..."}

data: {"progress": 90, "stage": "HTML 생성 완료"}

data: {"progress": 100, "stage": "변환 완료", "url": "https://..."}
```

---

### 10.3 Status API
```
GET /api/status/[jobId]
```

**Response (200 OK)**
```typescript
{
  success: true,
  job: {
    id: string,
    fileName: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    progress: number,         // 0-100
    stage: string,            // Current stage description
    method: 'hybrid' | 'claude-only' | 'basic',
    createdAt: string,        // ISO 8601
    startedAt: string | null,
    completedAt: string | null,
    outputUrl: string | null,
    error: string | null,
    metadata: {
      fileSize: number,
      pageCount: number,
      duration: number        // milliseconds
    }
  }
}
```

---

### 10.4 History API
```
GET /api/history?limit=30&offset=0&status=all&search=
```

**Query Parameters**
```typescript
{
  limit?: number,      // Default: 30, Max: 100
  offset?: number,     // Default: 0
  status?: 'all' | 'completed' | 'failed',
  search?: string,     // Search in fileName
  sortBy?: 'createdAt' | 'fileName',
  sortOrder?: 'asc' | 'desc'
}
```

**Response (200 OK)**
```typescript
{
  success: true,
  items: Array<{
    id: string,
    fileName: string,
    status: string,
    createdAt: string,
    fileSize: number,
    outputUrl: string | null,
    method: string,
    duration: number
  }>,
  pagination: {
    total: number,
    limit: number,
    offset: number,
    hasMore: boolean
  }
}
```

---

### 10.5 Download API
```
GET /api/download/[jobId]
```

**Response (200 OK)**
```typescript
Content-Type: text/html
Content-Disposition: attachment; filename="외신브리핑_20251018.html"

[HTML content]
```

---

### 10.6 Delete API
```
DELETE /api/history/[jobId]
```

**Response (200 OK)**
```typescript
{
  success: true,
  message: '변환 기록이 삭제되었습니다'
}
```

---

## 11. 데이터베이스 설계

### 11.1 Schema (Drizzle ORM)
```typescript
// db/schema.ts
import { pgTable, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const conversions = pgTable('conversions', {
  id: text('id').primaryKey(),
  
  // File Info
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull(),
  fileUrl: text('file_url').notNull(),
  
  // Status
  status: text('status').notNull().default('pending'),
  // 'pending' | 'processing' | 'completed' | 'failed'
  
  progress: integer('progress').notNull().default(0),
  stage: text('stage'),
  
  // Method
  method: text('method'),
  // 'hybrid' | 'claude-only' | 'basic'
  
  // Output
  outputUrl: text('output_url'),
  outputSize: integer('output_size'),
  
  // Metadata
  pageCount: integer('page_count'),
  duration: integer('duration'), // milliseconds
  
  // Error
  error: text('error'),
  errorStack: text('error_stack'),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  
  // User (Phase 2)
  userId: text('user_id'),
});

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Indexes
export const conversionsByCreatedAt = pgTable('conversions_by_created_at', {
  // Index on createdAt for fast history queries
});

export const conversionsByUserId = pgTable('conversions_by_user_id', {
  // Index on userId for user-specific queries
});
```

### 11.2 마이그레이션
```sql
-- migrations/0001_initial.sql

CREATE TABLE conversions (
  id TEXT PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  progress INTEGER NOT NULL DEFAULT 0,
  stage TEXT,
  method TEXT,
  output_url TEXT,
  output_size INTEGER,
  page_count INTEGER,
  duration INTEGER,
  error TEXT,
  error_stack TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  user_id TEXT
);

CREATE INDEX idx_conversions_created_at ON conversions(created_at DESC);
CREATE INDEX idx_conversions_user_id ON conversions(user_id);
CREATE INDEX idx_conversions_status ON conversions(status);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

### 11.3 Database Operations
```typescript
// lib/db.ts
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import { conversions, users } from './schema';
import { eq, desc, and, like } from 'drizzle-orm';

export const db = drizzle(sql);

// Create conversion
export async function createConversion(data: {
  id: string;
  fileName: string;
  fileSize: number;
  fileUrl: string;
}) {
  return db.insert(conversions).values(data).returning();
}

// Update conversion status
export async function updateConversionStatus(
  id: string,
  updates: Partial<typeof conversions.$inferInsert>
) {
  return db
    .update(conversions)
    .set({
      ...updates,
      updatedAt: new Date()
    })
    .where(eq(conversions.id, id))
    .returning();
}

// Get conversion by ID
export async function getConversionById(id: string) {
  return db.query.conversions.findFirst({
    where: eq(conversions.id, id)
  });
}

// Get conversion history
export async function getConversionHistory(options: {
  limit?: number;
  offset?: number;
  status?: string;
  search?: string;
  userId?: string;
}) {
  const {
    limit = 30,
    offset = 0,
    status,
    search,
    userId
  } = options;

  let conditions = [];
  
  if (userId) {
    conditions.push(eq(conversions.userId, userId));
  }
  
  if (status && status !== 'all') {
    conditions.push(eq(conversions.status, status));
  }
  
  if (search) {
    conditions.push(like(conversions.fileName, `%${search}%`));
  }

  const items = await db
    .select()
    .from(conversions)
    .where(and(...conditions))
    .orderBy(desc(conversions.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql`count(*)` })
    .from(conversions)
    .where(and(...conditions));

  return {
    items,
    pagination: {
      total: Number(count),
      limit,
      offset,
      hasMore: Number(count) > offset + limit
    }
  };
}

// Delete conversion
export async function deleteConversion(id: string) {
  return db
    .delete(conversions)
    .where(eq(conversions.id, id))
    .returning();
}
```

---

## 12. 비용 구조

### 12.1 개발 비용 (1회)
```
항목                인력      기간      시급      총액
────────────────────────────────────────────────────
기획 & PRD         PM 1명    2일      $50/h     $800
UI/UX 설계        Designer   2일      $50/h     $800
Frontend 개발     FE Dev     5일      $60/h    $2,400
Backend 개발      BE Dev     4일      $60/h    $1,920
통합 & 테스트     Full-stack 2일      $60/h      $960
배포 & 문서화     DevOps     1일      $50/h      $400
────────────────────────────────────────────────────
합계                         16일                $7,280

예비비 (10%)                                      $728
────────────────────────────────────────────────────
총 개발 비용                                    $8,008
```

### 12.2 운영 비용 (월간)

#### API 비용
```
Adobe PDF Services API
├─ Free Tier: 500 transactions/month
├─ 사용량: 40 transactions/month
└─ 비용: $0

Claude API (claude-sonnet-4-20250514)
├─ Input: $3 per million tokens
├─ Output: $15 per million tokens
├─ 예상 사용량:
│  ├─ Input: ~200,000 tokens/month
│  │   (5,000 tokens/document × 40 documents)
│  ├─ Output: ~400,000 tokens/month
│  │   (10,000 tokens/document × 40 documents)
│  └─ 비용:
│      ├─ Input: $0.60
│      ├─ Output: $6.00
│      └─ 합계: $6.60

총 API 비용: $6.60/month
```

#### 인프라 비용
```
Vercel (Hobby Plan)
├─ 서버리스 함수: 무료 (100 GB-Hours)
├─ 대역폭: 무료 (100 GB)
├─ 빌드: 무료 (100시간)
└─ 비용: $0

Vercel Blob Storage
├─ Free Tier: 500 MB
├─ 사용량: ~100 MB/month
│   (2.5 MB/HTML × 40 files)
└─ 비용: $0

Vercel Postgres
├─ Free Tier: 256 MB
├─ 사용량: ~50 MB/month
└─ 비용: $0

총 인프라 비용: $0/month
```

#### 총 월간 운영 비용
```
$6.60/month
```

### 12.3 확장 시 비용 (Phase 3)
```
사용량                          비용/월
───────────────────────────────────────
200 conversions/month
├─ Adobe API                    $0 (Free tier)
├─ Claude API                   $33
├─ Vercel Blob (500 MB)         $0
└─ Vercel Postgres (256 MB)     $0
───────────────────────────────────────
합계                            $33/month

1,000 conversions/month
├─ Adobe API                    $150
├─ Claude API                   $165
├─ Vercel Blob (2.5 GB)         $5
└─ Vercel Postgres (1 GB)       $10
───────────────────────────────────────
합계                            $330/month
```

### 12.4 ROI 분석
```
초기 투자:
└─ 개발 비용: $8,000

월간 비용:
└─ 운영 비용: $6.60

월간 절감:
├─ 시간 절약: 10 hours × $50/hour = $500
├─ 운영 비용: -$6.60
└─ 순 절감: $493.40/month

회수 기간:
└─ $8,000 / $493.40 = 16.2개월

3년 ROI:
├─ 총 투자: $8,000 + ($6.60 × 36) = $8,237.60
├─ 총 절감: $500 × 36 = $18,000
├─ 순이익: $9,762.40
└─ ROI: 118.5%
```

---

## 13. 개발 로드맵

### 13.1 Week 1: Setup & Core

#### Day 1-2: 프로젝트 초기화
```bash
# Checklist
□ Next.js 프로젝트 생성
  □ create-next-app with TypeScript
  □ Tailwind CSS 설정
  □ shadcn/ui 설치
  □ Git repository 생성

□ 개발 환경 구성
  □ ESLint + Prettier
  □ VS Code 설정
  □ Environment variables 템플릿

□ API 계정 생성
  □ Adobe PDF Services 계정
  □ Claude API 키 발급
  □ Vercel 계정 연결

□ 데이터베이스 설정
  □ Vercel Postgres 생성
  □ Drizzle ORM 설정
  □ 초기 마이그레이션 실행
```

#### Day 3-4: Adobe Integration
```bash
# Checklist
□ Adobe Client 구현
  □ Authentication
  □ Extract PDF operation
  □ Error handling
  □ Response parsing

□ 테스트
  □ Unit tests (Jest)
  □ Sample PDF로 검증
  □ 에러 케이스 테스트
```

#### Day 5-6: Claude Integration
```bash
# Checklist
□ Claude Client 구현
  □ API 호출 로직
  □ Prompt engineering
  □ Response parsing
  □ Token counting

□ Conversion Engine
  □ 하이브리드 로직
  □ Fallback strategy
  □ Progress tracking

□ 테스트
  □ Unit tests
  □ Integration tests
```

#### Day 7: API Routes
```bash
# Checklist
□ Upload API (/api/upload)
□ Convert API (/api/convert)
□ Status API (/api/status/[id])
□ API 테스트 (Postman/Thunder Client)
```

### 13.2 Week 2: UI & Polish

#### Day 8-9: Frontend Core
```bash
# Checklist
□ 메인 페이지
  □ FileUploader component
  □ Recent conversions
  □ 반응형 레이아웃

□ 변환 페이지
  □ Progress indicator
  □ Status display
  □ Error handling

□ Routing 설정
```

#### Day 10: HTML Viewer
```bash
# Checklist
□ HTMLViewer component
  □ Secure iframe
  □ XSS prevention (DOMPurify)
  □ 다운로드 기능
  □ 공유 기능
```

#### Day 11: History
```bash
# Checklist
□ History 페이지
  □ List view
  □ Filter & search
  □ Pagination
  □ Delete functionality
```

#### Day 12-13: Testing
```bash
# Checklist
□ E2E 테스트 (Playwright)
  □ 업로드 플로우
  □ 변환 플로우
  □ 히스토리 플로우

□ 모바일 테스트
  □ iPhone Safari
  □ Android Chrome

□ 성능 테스트
  □ Lighthouse
  □ Core Web Vitals
```

#### Day 14: Deploy & Polish
```bash
# Checklist
□ Vercel 배포
  □ Production 환경변수 설정
  □ 도메인 연결 (nbc.musicow.com)
  □ Analytics 설정

□ 문서화
  □ README.md
  □ 사용자 가이드
  □ API 문서

□ 최종 점검
  □ 보안 헤더 확인
  □ 에러 처리 검증
  □ 로그 확인
```

### 13.3 Milestone Checklist
```markdown
## M1: Backend Ready (Week 1 완료)
- [x] Adobe API 통합 완료
- [x] Claude API 통합 완료
- [x] API Routes 구현
- [x] Database 연결
- [x] 단위 테스트 통과 (80% 커버리지)

## M2:Frontend Ready (Week 2 Day 11 완료)
- [x] 모든 UI 컴포넌트 완성
- [x] 반응형 디자인 완료
- [x] 모바일 최적화
- [x] 접근성 AA 등급

## M3: MVP Launch (Week 2 완료)
- [x] E2E 테스트 통과
- [x] 성능 기준 달성
- [x] Vercel 배포 완료
- [x] 사용자 온보딩 완료
- [x] 실제 문서 20건 테스트

## M4: Phase 2 (Week 8 완료)
- [ ] 사용자 인증 구현
- [ ] 이메일 모니터링
- [ ] 팀 협업 기능
- [ ] 고급 검색
- [ ] 월 활성 사용자 > 5명

## M5: Phase 3 (Month 6 완료)
- [ ] AI 요약 기능
- [ ] 트렌드 분석
- [ ] 외부 통합 (Slack/Notion)
- [ ] 전사 확대 준비
```

---

## 14. 성공 지표 (KPI)

### 14.1 제품 지표

#### 사용성 지표 (Usage Metrics)

```
지표명                     Week 1   Week 2   Month 1   Month 3   목표
─────────────────────────────────────────────────────────────────────
일일 활성 사용자 (DAU)        1        1        1         2       5명
주간 활성 사용자 (WAU)        1        1        5         10      15명
월간 활성 사용자 (MAU)        -        -        5         15      20명

일일 변환 건수                2        2        40        60      40건
주간 변환 건수                10       10       200       300     280건
월간 변환 건수                -        -        40        80      40건

사용자당 평균 변환 건수        2        2        8         8       8건/월
재방문율                      100%     100%     80%       85%     90%
```

#### 기술 지표 (Technical Metrics)

```
지표명                          현재     목표     측정 방법
──────────────────────────────────────────────────────────
변환 성공률                     -        >95%     completions/attempts
평균 변환 시간 (9p)             -        <30초    avg(duration)
평균 변환 시간 (20p)            -        <60초    avg(duration)
API 응답 시간                   -        <500ms   APM
페이지 로드 시간 (LCP)          -        <2초     Lighthouse
서버 응답 시간 (TTFB)           -        <300ms   Vercel Analytics
에러율                          -        <5%      errors/total
다운타임                        -        <0.1%    Uptime monitor
```

#### 품질 지표 (Quality Metrics)

```
지표명                     현재     목표     검증 방법
─────────────────────────────────────────────────────
텍스트 정확도             -        >99%     Manual QA (샘플 20개)
구조 보존율               -        >95%     Manual QA
HTML 유효성               -        100%     W3C Validator
접근성 점수               -        AA       WAVE Tool
모바일 성능 점수          -        >90      Lighthouse
데스크톱 성능 점수        -        >95      Lighthouse
```

### 14.2 비즈니스 지표

#### 효율성 지표 (Efficiency Metrics)

```
지표명                          Before    After     개선율
────────────────────────────────────────────────────────
문서당 처리 시간                15분      30초      97%
일일 브리핑 확인 시간           30분      6분       80%
월간 절약 시간                  -         10시간    -
연간 절약 시간                  -         120시간   -

비용 효율성
├─ 시간 가치 (월)              -         $500      -
├─ 운영 비용 (월)              -         -$6.60    -
└─ 순 절감 (월)                -         $493      -
```

#### ROI 지표

```
기간        투자 누적    절감 누적    순이익     ROI
──────────────────────────────────────────────────
1개월       $8,007      $500        -$7,507    -93.8%
3개월       $8,020      $1,500      -$6,520    -81.3%
6개월       $8,040      $3,000      -$5,040    -62.7%
12개월      $8,079      $6,000      -$2,079    -25.7%
18개월      $8,119      $9,000      $881       10.9%
24개월      $8,158      $12,000     $3,842     47.1%
36개월      $8,238      $18,000     $9,762     118.5%
```

### 14.3 사용자 만족도 지표

#### 정량적 만족도

```
설문 항목                                   목표
─────────────────────────────────────────────────
전반적 만족도 (5점 척도)                    >4.5
사용 편의성                                 >4.5
변환 품질                                   >4.0
속도 만족도                                 >4.0
모바일 경험                                 >4.0
재사용 의향                                 >90%
타인 추천 의향 (NPS)                        >50
```

#### 정성적 피드백

```
수집 방법:
1. 월 1회 설문조사
2. Slack 피드백 채널
3. 1:1 인터뷰 (분기 1회)
4. 사용 패턴 분석

평가 기준:
- 긍정 피드백 비율 > 80%
- 개선 요청 처리율 > 70%
- 버그 리포트 해결 시간 < 3일
```

### 14.4 성장 지표

```
지표명                  Month 1  Month 3  Month 6  Month 12
──────────────────────────────────────────────────────────
누적 사용자 수              1        3        5        10
누적 변환 건수              40       120      240      480
히스토리 검색 빈도          0        5/주     10/주    20/주
공유 링크 클릭 수           5        20       50       100
```

### 14.5 측정 및 리포팅

#### 대시보드 구성

```typescript
// 실시간 모니터링 대시보드
const Dashboard = {
  realtime: {
    activeUsers: number,
    ongoingConversions: number,
    queuedJobs: number,
    errorRate: number
  },
  daily: {
    conversions: number,
    successRate: number,
    avgDuration: number,
    uniqueUsers: number
  },
  weekly: {
    totalConversions: number,
    totalUsers: number,
    topErrors: Array<{error: string, count: number}>,
    avgResponseTime: number
  }
};

// Google Analytics 이벤트
trackEvent('conversion_started', {
  fileSize: number,
  method: string
});

trackEvent('conversion_completed', {
  duration: number,
  success: boolean,
  method: string
});

trackEvent('html_viewed', {
  jobId: string,
  viewDuration: number
});
```

#### 주간 리포트 (자동 생성)

```markdown
# NBC 주간 리포트 (Week 1)

## 요약
- 총 변환: 14건
- 성공률: 92.9% (13/14)
- 평균 시간: 28.5초
- 활성 사용자: 1명

## 상세
### 변환 통계
- 하이브리드: 12건 (85.7%)
- Claude Only: 1건 (7.1%)
- 실패: 1건 (7.1%)

### 성능
- P50: 25초
- P95: 35초
- P99: 42초

### 에러
1. Adobe API timeout (1건)
   - 원인: 네트워크 지연
   - 조치: Fallback 정상 작동

## 액션 아이템
- [ ] Timeout 설정 조정 검토
- [ ] 에러 알림 추가
```

---

## 15. 리스크 관리

### 15.1 기술 리스크

#### R1: API 서비스 장애

```
리스크: Adobe 또는 Claude API 서비스 중단
발생 확률: 낮음 (10%)
영향도: 높음
예상 손실: 업무 중단 1-4시간

완화 전략:
1. Fallback 메커니즘 구현
   ├─ Adobe 실패 → Claude 단독
   ├─ Claude 실패 → 기본 텍스트 추출
   └─ 모두 실패 → 사용자 안내

2. 캐싱 전략
   ├─ Adobe 결과 1시간 캐싱
   └─ 재변환 시 캐시 우선 사용

3. 헬스 체크
   ├─ 5분마다 API 상태 확인
   └─ 장애 시 Slack 알림

4. SLA 모니터링
   ├─ Adobe: 99.9% uptime
   └─ Claude: 99.9% uptime

대응 계획:
- 장애 감지 시 즉시 사용자에게 공지
- Fallback 모드 자동 전환
- 복구 시 대기 중인 작업 재처리
```

#### R2: 변환 품질 저하

```
리스크: AI 모델 업데이트로 인한 품질 변화
발생 확률: 중간 (30%)
영향도: 중간
예상 손실: 사용자 불만, 재작업 필요

완화 전략:
1. 품질 모니터링
   ├─ 매 변환마다 HTML 유효성 검사
   ├─ 샘플링 검증 (10%)
   └─ 이상 감지 시 알림

2. 버전 고정
   ├─ Claude 모델 버전 명시
   ├─ 업데이트 시 테스트 후 적용
   └─ 롤백 절차 준비

3. A/B 테스트
   └─ 새 모델 도입 시 병렬 테스트

대응 계획:
- 품질 저하 감지 시 이전 모델로 롤백
- 문제 샘플 수집 및 프롬프트 튜닝
- 사용자에게 개선 작업 공지
```

#### R3: 성능 저하

```
리스크: API 응답 지연 또는 타임아웃
발생 확률: 중간 (30%)
영향도: 중간
예상 손실: 사용자 경험 저하

완화 전략:
1. 타임아웃 최적화
   ├─ Adobe: 60초
   ├─ Claude: 90초
   └─ 전체: 120초

2. 재시도 로직
   ├─ Exponential backoff
   ├─ 최대 3회 재시도
   └─ 재시도 간격: 2, 4, 8초

3. 병목 구간 모니터링
   ├─ API 호출 시간 추적
   ├─ 네트워크 지연 측정
   └─ 서버 처리 시간 분석

대응 계획:
- 성능 임계값 초과 시 알림
- 병목 구간 개선
- 필요시 API 업그레이드
```

#### R4: 보안 취약점

```
리스크: XSS, CSRF, 파일 업로드 공격
발생 확률: 낮음 (10%)
영향도: 매우 높음
예상 손실: 데이터 유출, 서비스 중단

완화 전략:
1. 다층 보안
   ├─ XSS: DOMPurify 적용
   ├─ CSRF: Next.js 기본 보호
   ├─ 파일 검증: Magic number 체크
   └─ Rate limiting: Upstash

2. 정기 감사
   ├─ 주간 자동 스캔 (Snyk)
   ├─ 월간 수동 점검
   └─ 분기 침투 테스트

3. 보안 헤더
   ├─ CSP
   ├─ HSTS
   └─ X-Frame-Options

대응 계획:
- 취약점 발견 시 24시간 내 패치
- 심각도 High 이상: 즉시 핫픽스
- 사용자에게 투명한 공지
```

### 15.2 비즈니스 리스크

#### R5: 사용자 채택 저조

```
리스크: 목표 사용자가 제품을 사용하지 않음
발생 확률: 중간 (25%)
영향도: 높음
예상 손실: ROI 미달성, 프로젝트 중단

완화 전략:
1. 초기 온보딩
   ├─ 1:1 사용법 교육 (30분)
   ├─ 실제 업무 문서로 시연
   └─ 첫 1주일 밀착 지원

2. 지속적 개선
   ├─ 주간 피드백 수집
   ├─ 불편사항 즉시 개선
   └─ 사용 패턴 분석

3. 가치 강조
   ├─ 시간 절약 수치화
   ├─ 편의성 시연
   └─ 성공 사례 공유

모니터링:
- Week 1: 최소 10회 사용
- Week 2: 자발적 사용 시작
- Month 1: 루틴화

대응 계획:
- 사용 저조 시 원인 분석
- 필요시 기능 수정/추가
- 최악의 경우 피벗 고려
```

#### R6: 예산 초과

```
리스크: API 비용 또는 개발 비용 초과
발생 확률: 낮음 (15%)
영향도: 중간
예상 손실: 추가 예산 필요

완화 전략:
1. 비용 모니터링
   ├─ 일일 API 비용 추적
   ├─ 월간 예산 한도 설정
   └─ 임계값 도달 시 알림

2. 토큰 최적화
   ├─ 프롬프트 길이 최소화
   ├─ 캐싱 활용
   └─ 불필요한 호출 제거

3. Free tier 최대 활용
   ├─ Adobe: 500건/월 무료
   └─ Vercel: 모두 무료

대응 계획:
- 비용 20% 초과 시 최적화
- 비용 50% 초과 시 대체 방안 검토
- 비용 100% 초과 시 일시 중단
```

#### R7: 경쟁 서비스 출현

```
리스크: 유사 서비스 등장
발생 확률: 낮음 (10%)
영향도: 낮음
예상 손실: 사용자 이탈

완화 전략:
1. 차별화 포인트
   ├─ 외신 브리핑 특화
   ├─ 하이브리드 변환 (고품질)
   └─ 뮤직카우 업무 최적화

2. 지속적 개선
   ├─ Phase 2, 3 기능 추가
   ├─ 사용자 피드백 반영
   └─ 기술 트렌드 반영

3. 전환 비용 높이기
   ├─ 히스토리 축적
   ├─ 워크플로우 통합
   └─ 팀 협업 기능
```

### 15.3 운영 리스크

#### R8: Key Person 리스크

```
리스크: 개발자/담당자 부재
발생 확률: 중간 (20%)
영향도: 높음
예상 손실: 유지보수 지연

완화 전략:
1. 문서화
   ├─ 코드 주석
   ├─ README 상세 작성
   ├─ 아키텍처 다이어그램
   └─ 트러블슈팅 가이드

2. 지식 공유
   ├─ 월 1회 기술 세션
   ├─ 페어 프로그래밍
   └─ 코드 리뷰

3. 백업 계획
   └─ 외부 개발사 연락처 확보

대응 계획:
- 급한 이슈: 외부 지원
- 장기 부재: 인수인계
```

#### R9: 데이터 손실

```
리스크: DB 또는 Blob 데이터 손실
발생 확률: 매우 낮음 (5%)
영향도: 높음
예상 손실: 히스토리 소실

완화 전략:
1. 자동 백업
   ├─ Vercel 일일 백업
   └─ 30일 보관

2. 데이터 복제
   └─ 중요 문서는 이중 저장

3. 복구 절차
   └─ 문서화 및 정기 테스트

대응 계획:
- 손실 발견 시 즉시 백업 복원
- 사용자에게 공지
- 재발 방지 대책 수립
```

---

## 16. 테스트 계획

### 16.1 테스트 전략

```
테스트 레벨          커버리지    도구              담당
─────────────────────────────────────────────────────
Unit Tests          >80%        Jest, Vitest      개발자
Integration Tests   >70%        Jest              개발자
E2E Tests           주요 플로우  Playwright        QA
API Tests           100%        Postman/Jest      개발자
Performance Tests   주요 기능    Lighthouse        개발자
Security Tests      주요 위협    Snyk, OWASP ZAP   DevOps
Accessibility Tests WCAG AA     WAVE, axe         QA
```

### 16.2 Unit Tests

```typescript
// lib/converter.test.ts
import { describe, it, expect, vi } from 'vitest';
import { convertPdf } from './converter';
import * as adobe from './adobe';
import * as claude from './claude';

describe('PDF Converter', () => {
  it('should convert PDF using hybrid method', async () => {
    // Mock Adobe API
    vi.spyOn(adobe, 'extractStructure').mockResolvedValue({
      elements: [{ text: 'Test' }]
    });
    
    // Mock Claude API
    vi.spyOn(claude, 'convertToHtml').mockResolvedValue(
      '<html><body>Test</body></html>'
    );
    
    const result = await convertPdf(Buffer.from('fake pdf'));
    
    expect(result.method).toBe('hybrid');
    expect(result.html).toContain('Test');
    expect(result.success).toBe(true);
  });

  it('should fallback to Claude-only when Adobe fails', async () => {
    vi.spyOn(adobe, 'extractStructure').mockRejectedValue(
      new Error('Adobe API Error')
    );
    
    vi.spyOn(claude, 'convertWithClaudeOnly').mockResolvedValue(
      '<html><body>Fallback</body></html>'
    );
    
    const result = await convertPdf(Buffer.from('fake pdf'));
    
    expect(result.method).toBe('claude-only');
    expect(result.success).toBe(true);
  });

  it('should use basic extraction when all APIs fail', async () => {
    vi.spyOn(adobe, 'extractStructure').mockRejectedValue(
      new Error('Adobe Error')
    );
    vi.spyOn(claude, 'convertWithClaudeOnly').mockRejectedValue(
      new Error('Claude Error')
    );
    
    const result = await convertPdf(Buffer.from('fake pdf'));
    
    expect(result.method).toBe('basic');
    expect(result.warning).toBeDefined();
  });
});

// components/FileUploader.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import FileUploader from './FileUploader';

describe('FileUploader', () => {
  it('should render dropzone', () => {
    render(<FileUploader />);
    expect(screen.getByText(/PDF 파일을 드래그/)).toBeInTheDocument();
  });

  it('should show error for invalid file type', async () => {
    render(<FileUploader />);
    
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByRole('button');
    
    fireEvent.drop(input, { dataTransfer: { files: [file] } });
    
    expect(await screen.findByText(/PDF 파일만/)).toBeInTheDocument();
  });

  it('should show error for oversized file', async () => {
    render(<FileUploader />);
    
    const file = new File(['x'.repeat(60 * 1024 * 1024)], 'large.pdf', {
      type: 'application/pdf'
    });
    
    const input = screen.getByRole('button');
    fireEvent.drop(input, { dataTransfer: { files: [file] } });
    
    expect(await screen.findByText(/파일이 너무 큽니다/)).toBeInTheDocument();
  });
});
```

### 16.3 Integration Tests

```typescript
// tests/api/convert.test.ts
import { POST } from '@/app/api/convert/route';
import { NextRequest } from 'next/server';

describe('POST /api/convert', () => {
  it('should start conversion successfully', async () => {
    const formData = new FormData();
    formData.append('jobId', 'test-job-123');
    
    const request = new NextRequest('http://localhost/api/convert', {
      method: 'POST',
      body: formData
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.jobId).toBe('test-job-123');
    expect(data.status).toBe('processing');
  });

  it('should return error for missing jobId', async () => {
    const request = new NextRequest('http://localhost/api/convert', {
      method: 'POST',
      body: JSON.stringify({})
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });
});
```

### 16.4 E2E Tests

```typescript
// tests/e2e/conversion-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Conversion Flow', () => {
  test('should complete full conversion flow', async ({ page }) => {
    // 1. Navigate to home
    await page.goto('http://localhost:3000');
    
    // 2. Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./tests/fixtures/sample.pdf');
    
    // 3. Wait for upload
    await expect(page.locator('text=sample.pdf')).toBeVisible();
    
    // 4. Start conversion
    await page.click('button:has-text("변환 시작")');
    
    // 5. Wait for progress
    await expect(page.locator('text=변환 중')).toBeVisible();
    
    // 6. Wait for completion (max 60s)
    await expect(page.locator('text=변환 완료')).toBeVisible({
      timeout: 60000
    });
    
    // 7. Verify result
    await expect(page.locator('text=브라우저에서 열기')).toBeVisible();
    
    // 8. Open HTML
    await page.click('button:has-text("브라우저에서 열기")');
    
    // 9. Verify HTML content
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.click('button:has-text("브라우저에서 열기")')
    ]);
    
    await expect(newPage.locator('h1')).toContainText('외신 브리핑');
  });

  test('should handle upload error gracefully', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Upload invalid file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./tests/fixtures/invalid.txt');
    
    // Verify error message
    await expect(page.locator('text=PDF 파일만')).toBeVisible();
  });
});

test.describe('Mobile Experience', () => {
  test.use({ viewport: { width: 375, height: 667 } });
  
  test('should work on mobile', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Verify responsive layout
    await expect(page.locator('nav')).toBeVisible();
    
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./tests/fixtures/sample.pdf');
    
    // Verify mobile-optimized UI
    await expect(page.locator('.mobile-nav')).toBeVisible();
  });
});
```

### 16.5 Performance Tests

```typescript
// tests/performance/lighthouse.test.ts
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

describe('Lighthouse Performance', () => {
  it('should meet performance targets', async () => {
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    const options = {
      logLevel: 'info',
      output: 'json',
      port: chrome.port
    };
    
    const runnerResult = await lighthouse('http://localhost:3000', options);
    
    const { lhr } = runnerResult;
    const { categories } = lhr;
    
    // Performance > 90
    expect(categories.performance.score * 100).toBeGreaterThan(90);
    
    // Accessibility > 90
    expect(categories.accessibility.score * 100).toBeGreaterThan(90);
    
    // Best Practices > 90
    expect(categories['best-practices'].score * 100).toBeGreaterThan(90);
    
    // SEO > 90
    expect(categories.seo.score * 100).toBeGreaterThan(90);
    
    await chrome.kill();
  });
});

// tests/performance/load-test.ts
import autocannon from 'autocannon';

describe('Load Tests', () => {
  it('should handle 10 concurrent users', async () => {
    const result = await autocannon({
      url: 'http://localhost:3000',
      connections: 10,
      duration: 30,
      pipelining: 1
    });
    
    // Average response time < 500ms
    expect(result.latency.mean).toBeLessThan(500);
    
    // Error rate < 1%
    const errorRate = (result.errors / result.requests.total) * 100;
    expect(errorRate).toBeLessThan(1);
  });
});
```

### 16.6 Security Tests

```bash
# Automated Security Scanning
npm install -D snyk

# Scan dependencies
snyk test

# Scan Docker image (if applicable)
snyk container test

# OWASP ZAP
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:3000
```

### 16.7 Accessibility Tests

```typescript
// tests/accessibility/a11y.test.ts
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Home from '@/app/page';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Home />);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });
});
```

### 16.8 Test Coverage Report

```bash
# Run all tests with coverage
npm run test:coverage

# Coverage report
jest --coverage --coverageReporters=html

# Expected coverage:
# Statements   : 80%
# Branches     : 75%
# Functions    : 80%
# Lines        : 80%
```

---

## 17. 배포 계획

### 17.1 배포 환경

```
환경         URL                          용도
────────────────────────────────────────────────────
Development  http://localhost:3000        로컬 개발
Staging      nbc-staging.vercel.app       테스트
Production   nbc.musicow.com              실서비스
```

### 17.2 Vercel 배포 설정

```javascript
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["icn1"],  // Seoul
  "env": {
    "ADOBE_CLIENT_ID": "@adobe-client-id",
    "ADOBE_CLIENT_SECRET": "@adobe-client-secret",
    "ANTHROPIC_API_KEY": "@anthropic-api-key"
  },
  "crons": [
    {
      "path": "/api/cron/email-monitor",
      "schedule": "*/5 * * * *"  // Every 5 minutes
    }
  ]
}

// next.config.js
module.exports = {
  reactStrictMode: true,
  experimental: {
    serverActions: true
  },
  images: {
    domains: ['blob.vercel-storage.com']
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains'
        }
      ]
    }
  ]
};
```

### 17.3 배포 프로세스

#### Step 1: Pre-deployment Checklist

```markdown
## 배포 전 체크리스트

### 코드 품질
- [ ] 모든 테스트 통과 (Unit, Integration, E2E)
- [ ] Linting 통과 (ESLint)
- [ ] 타입 체크 통과 (TypeScript)
- [ ] 코드 리뷰 완료

### 기능 검증
- [ ] 핵심 기능 수동 테스트
- [ ] 에러 케이스 검증
- [ ] 모바일 테스트
- [ ] 브라우저 호환성 (Chrome, Safari, Firefox)

### 성능
- [ ] Lighthouse 점수 > 90
- [ ] Bundle size 확인
- [ ] 이미지 최적화

### 보안
- [ ] 환경변수 확인
- [ ] API 키 보안 확인
- [ ] HTTPS 강제
- [ ] 보안 헤더 설정

### 문서
- [ ] README 업데이트
- [ ] CHANGELOG 작성
- [ ] API 문서 업데이트
```

#### Step 2: Staging Deployment

```bash
# 1. Commit and push
git add .
git commit -m "feat: implement conversion feature"
git push origin main

# 2. Vercel auto-deploys to staging
# URL: https://nbc-staging.vercel.app

# 3. Verify staging
npm run test:e2e:staging

# 4. Manual QA on staging
# - Test with real PDF files
# - Check all user flows
# - Verify integrations
```

#### Step 3: Production Deployment

```bash
# 1. Create release branch
git checkout -b release/v1.0.0

# 2. Update version
npm version 1.0.0

# 3. Merge to main
git checkout main
git merge release/v1.0.0

# 4. Tag release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# 5. Promote to production (Vercel)
vercel --prod

# 6. Verify production
npm run test:e2e:production
```

### 17.4 롤백 계획

```bash
# Quick Rollback (Vercel Dashboard)
# 1. Go to Vercel Dashboard
# 2. Select previous deployment
# 3. Click "Promote to Production"

# CLI Rollback
vercel rollback <deployment-url>

# Git Rollback
git revert <commit-hash>
git push origin main
```

### 17.5 배포 후 모니터링

```markdown
## 배포 후 30분 체크리스트

### 즉시 (0-5분)
- [ ] 배포 성공 확인
- [ ] 홈페이지 접속 확인
- [ ] API Health check
- [ ] 에러 로그 확인 (Vercel Dashboard)

### 초기 (5-15분)
- [ ] 실제 파일로 변환 테스트
- [ ] 모든 주요 기능 테스트
- [ ] 성능 지표 확인
- [ ] 사용자 피드백 수집 (Slack)

### 안정화 (15-30분)
- [ ] CPU/메모리 사용량 확인
- [ ] API 응답 시간 모니터링
- [ ] 에러율 확인 (< 5%)
- [ ] 사용자 활동 로그 확인
```

### 17.6 CI/CD 파이프라인

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Unit tests
        run: npm run test:unit
      
      - name: Build
        run: npm run build
  
  e2e:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
  
  deploy-staging:
    needs: [test, e2e]
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel Staging
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
  
  deploy-production:
    needs: [test, e2e]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 18. 유지보수 계획

### 18.1 모니터링

#### 실시간 모니터링 (Vercel Analytics)

```typescript
// Real-time monitoring setup
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

// Custom events
import { track } from '@vercel/analytics';

track('conversion_started', {
  fileSize: file.size,
  method: 'hybrid'
});
```

#### 에러 모니터링 (Sentry)

```typescript
// sentry.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV || 'development',
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Don't send API keys
    if (event.extra) {
      delete event.extra.ADOBE_CLIENT_SECRET;
      delete event.extra.ANTHROPIC_API_KEY;
    }
    return event;
  }
});
```

#### 로그 집계

```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      ...meta
    }));
  },
  error: (message: string, error?: Error, meta?: any) => {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      error: error?.message,
      stack: error?.stack,
      ...meta
    }));
  }
};

// Usage
logger.info('Conversion started', {
  jobId: 'abc123',
  fileName: 'briefing.pdf'
});
```

### 18.2 정기 유지보수

#### 일일 (Daily)

```markdown
## 일일 체크리스트 (소요 시간: 10분)

### 모니터링
- [ ] Vercel Dashboard 확인
  - 에러율 < 5%
  - 응답 시간 < 500ms
  - 가동률 > 99%

- [ ] API 사용량 확인
  - Adobe: < 500 calls/day
  - Claude: 토큰 사용량 확인

- [ ] 사용자 활동 확인
  - 일일 변환 건수
  - 에러 발생 여부

### 대응
- 에러 발견 시 Slack 알림 확인
- 급한 이슈 있으면 즉시 대응
```

#### 주간 (Weekly)

```markdown
## 주간 체크리스트 (소요 시간: 30분)

### 성능 분석
- [ ] 주간 리포트 생성
  - 총 변환 건수
  - 평균 변환 시간
  - 성공률
  - 에러 통계

- [ ] 느린 쿼리 확인
- [ ] API 응답 시간 추이

### 피드백 수집
- [ ] Slack 피드백 정리
- [ ] 사용자 불편사항 수집
- [ ] 개선 아이템 백로그 추가

### 보안 점검
- [ ] Dependency 취약점 스캔 (Snyk)
- [ ] 이상 접근 로그 확인
```

#### 월간 (Monthly)

```markdown
## 월간 체크리스트 (소요 시간: 2시간)

### 비용 분석
- [ ] API 비용 리포트
- [ ] 인프라 비용 확인
- [ ] ROI 계산

### 성능 최적화
- [ ] Lighthouse 점수 측정
- [ ] Bundle size 분석
- [ ] 데이터베이스 최적화

### 보안 감사
- [ ] 전체 취약점 스캔
- [ ] 접근 로그 분석
- [ ] 백업 테스트

### 업데이트
- [ ] Next.js 업데이트 검토
- [ ] Dependencies 업데이트
- [ ] Node.js 버전 확인
```

#### 분기 (Quarterly)

```markdown
## 분기 체크리스트 (소요 시간: 1일)

### 전략 검토
- [ ] KPI 달성도 확인
- [ ] 사용자 설문조사
- [ ] 로드맵 업데이트

### 기술 부채 해소
- [ ] 코드 리팩토링
- [ ] 테스트 커버리지 개선
- [ ] 문서 업데이트

### 재해 복구 훈련
- [ ] 백업 복원 테스트
- [ ] 롤백 절차 연습
- [ ] 장애 대응 시뮬레이션
```

### 18.3 버전 관리

```
버전 체계: Semantic Versioning (MAJOR.MINOR.PATCH)

MAJOR (1.0.0): 주요 기능 추가, Breaking changes
MINOR (1.1.0): 새 기능 추가, 하위 호환
PATCH (1.1.1): 버그 수정, 성능 개선

예시:
v1.0.0 - MVP 출시
v1.1.0 - 히스토리 검색 추가
v1.1.1 - 파일 업로드 버그 수정
v1.2.0 - 댓글 기능 추가
v2.0.0 - 사용자 인증 추가 (Breaking)
```

### 18.4 업데이트 정책

```markdown
## 정기 업데이트

### Patch 업데이트 (월 1-2회)
- 버그 수정
- 소소한 개선
- 보안 패치
- Downtime: 없음

### Minor 업데이트 (분기 1회)
- 새 기능 추가
- UX 개선
- 성능 최적화
- Downtime: < 5분

### Major 업데이트 (연 1회)
- 대규모 기능 추가
- 아키텍처 변경
- Breaking changes
- Downtime: < 30분
- 사전 공지: 1주일 전
```

### 18.5 지원 채널

```
채널          응답 시간      처리 대상
──────────────────────────────────────────────
Slack         1시간 이내     긴급 이슈, 일반 문의
Email         24시간 이내    일반 문의, 피드백
GitHub        48시간 이내    버그 리포트, 기능 제안

긴급 이슈 정의:
- 서비스 다운
- 데이터 손실
- 보안 취약점
- 핵심 기능 중단

대응 프로세스:
1. 이슈 접수
2. 심각도 평가
3. 우선순위 지정
4. 담당자 배정
5. 해결 및 공지
6. 사후 분석
```

---

## 19. 부록

### 19.1 용어 정의

```
용어                    설명
────────────────────────────────────────────────────────────
NBC                    NewsBrief Converter의 약자
외신 브리핑            정부 국제문화홍보정책실에서 발행하는 일일 해외 언론 보도 동향 문서
하이브리드 변환        Adobe API로 구조 추출 후 Claude API로 HTML 변환하는 방식
Fallback               주요 방법 실패 시 대체 방법을 사용하는 전략
시맨틱 HTML            의미 있는 HTML5 태그를 사용한 구조적 마크업
SSR                    Server-Side Rendering (서버 사이드 렌더링)
RSC                    React Server Components
Edge Runtime           Vercel의 엣지 서버에서 실행되는 런타임
Core Web Vitals        Google이 정의한 웹 성능 핵심 지표 (LCP, FID, CLS)
```

### 19.2 참고 자료

#### 외부 문서

```
제목                              URL
────────────────────────────────────────────────────────────────
Next.js Documentation            https://nextjs.org/docs
Adobe PDF Services API           https://developer.adobe.com/document-services/
Claude API Documentation         https://docs.anthropic.com/
Vercel Documentation            https://vercel.com/docs
Drizzle ORM                     https://orm.drizzle.team/
shadcn/ui                       https://ui.shadcn.com/
Tailwind CSS                    https://tailwindcss.com/
Playwright                      https://playwright.dev/
```

#### 내부 문서

```
- 뮤직카우 개발 가이드
- API 키 관리 정책
- 코딩 컨벤션
- Git 브랜치 전략
- 보안 정책
```

### 19.3 샘플 코드

#### 완전한 API Route 예시

```typescript
// app/api/convert/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { convertPdf } from '@/lib/converter';
import { createConversion, updateConversionStatus } from '@/lib/db';
import { put } from '@vercel/blob';
import { z } from 'zod';

const ConvertRequestSchema = z.object({
  jobId: z.string(),
  options: z.object({
    method: z.enum(['hybrid', 'claude-only', 'auto']).optional(),
    enableSummary: z.boolean().optional()
  }).optional()
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json();
    const { jobId, options } = ConvertRequestSchema.parse(body);
    
    // Update status to processing
    await updateConversionStatus(jobId, {
      status: 'processing',
      startedAt: new Date()
    });
    
    // Get file from database
    const conversion = await getConversionById(jobId);
    if (!conversion) {
      return NextResponse.json(
        { error: 'Conversion not found' },
        { status: 404 }
      );
    }
    
    // Download file from blob
    const response = await fetch(conversion.fileUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    
    // Convert PDF
    const startTime = Date.now();
    const result = await convertPdf(buffer, options);
    const duration = Date.now() - startTime;
    
    // Upload HTML to blob
    const { url: outputUrl } = await put(
      `converted/${jobId}.html`,
      result.html,
      {
        access: 'public',
        contentType: 'text/html'
      }
    );
    
    // Update database
    await updateConversionStatus(jobId, {
      status: 'completed',
      method: result.method,
      outputUrl,
      outputSize: Buffer.byteLength(result.html),
      duration,
      completedAt: new Date()
    });
    
    // Return success
    return NextResponse.json({
      success: true,
      jobId,
      outputUrl,
      method: result.method,
      duration
    });
    
  } catch (error) {
    console.error('Conversion error:', error);
    
    // Update database with error
    if (body?.jobId) {
      await updateConversionStatus(body.jobId, {
        status: 'failed',
        error: error.message,
        errorStack: error.stack,
        completedAt: new Date()
      });
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
export const maxDuration = 120; // 2 minutes
```

### 19.4 환경 설정 가이드

#### 개발 환경 설정

```bash
# 1. Repository 클론
git clone https://github.com/musicow/newbrief-converter.git
cd newbrief-converter

# 2. Node.js 버전 확인 (18.17+)
node --version

# 3. 의존성 설치
npm install

# 4. 환경변수 설정
cp .env.example .env.local
# .env.local 파일 편집하여 API 키 입력

# 5. 데이터베이스 마이그레이션
npm run db:migrate

# 6. 개발 서버 실행
npm run dev

# 7. 브라우저에서 확인
open http://localhost:3000
```

#### 프로덕션 배포 설정

```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. Vercel 로그인
vercel login

# 3. 프로젝트 연결
vercel link

# 4. 환경변수 설정
vercel env add ADOBE_CLIENT_ID production
vercel env add ADOBE_CLIENT_SECRET production
vercel env add ANTHROPIC_API_KEY production

# 5. 배포
vercel --prod

# 6. 도메인 설정
vercel domains add nbc.musicow.com
```

### 19.5 트러블슈팅 가이드

```markdown
## 자주 발생하는 문제

### 문제 1: Adobe API Timeout
**증상:** 변환 시 "Adobe API timeout" 에러
**원인:** 네트워크 지연 또는 Adobe 서버 과부하
**해결:**
1. Fallback이 자동으로 작동하는지 확인
2. 재시도 (일시적 문제일 수 있음)
3. Adobe 서비스 상태 페이지 확인

### 문제 2: HTML 깨짐
**증상:** 변환된 HTML이 올바르게 표시되지 않음
**원인:** Claude 프롬프트 문제 또는 PDF 구조 복잡
**해결:**
1. 원본 PDF 구조 확인
2. 프롬프트 튜닝
3. Fallback 모드 사용

### 문제 3: 느린 변환 속도
**증상:** 변환이 60초 이상 소요
**원인:** 대용량 PDF 또는 API 지연
**해결:**
1. PDF 페이지 수 확인
2. API 응답 시간 모니터링
3. 필요시 타임아웃 증가

### 문제 4: 파일 업로드 실패
**증상:** "파일 업로드 실패" 에러
**원인:** 파일 크기 초과 또는 네트워크 문제
**해결:**
1. 파일 크기 확인 (< 50MB)
2. 네트워크 연결 확인
3. 브라우저 콘솔 로그 확인
```

### 19.6 FAQ

```markdown
## 자주 묻는 질문

### Q1: 변환에 얼마나 걸리나요?
A: 일반적으로 9페이지 문서는 30초 이내, 20페이지는 60초 이내입니다.

### Q2: 어떤 PDF 파일을 지원하나요?
A: 텍스트 기반 PDF를 지원합니다. 스캔된 이미지 PDF는 품질이 떨어질 수 있습니다.

### Q3: 변환된 HTML은 얼마나 보관되나요?
A: 현재는 무기한 보관되지만, 향후 정책 변경 가능성이 있습니다.

### Q4: 모바일에서도 사용할 수 있나요?
A: 네, 모든 기기에서 사용 가능합니다. 반응형 디자인을 적용했습니다.

### Q5: 개인정보는 안전한가요?
A: 모든 데이터는 암호화되어 전송되며, API는 HTTPS만 사용합니다.

### Q6: 비용은 얼마나 드나요?
A: 월 $6.60 정도의 API 비용만 발생합니다.

### Q7: 오프라인에서도 사용할 수 있나요?
A: 아니요, 변환을 위해서는 인터넷 연결이 필요합니다.

### Q8: 변환 실패 시 어떻게 하나요?
A: 자동으로 Fallback 모드로 전환되며, 실패 시 Slack으로 알림이 갑니다.
```

### 19.7 변경 이력

```
버전      날짜          변경 내용                           작성자
────────────────────────────────────────────────────────────────
v1.0     2025.10.18    PRD 초안 작성                       법무팀
v2.0     2025.10.18    Next.js 기반으로 전환               법무팀
v2.1     -             [예정] Phase 2 기능 추가             -
```

### 19.8 기여자

```
역할              이름          연락처
──────────────────────────────────────
Product Owner    김법무        legal@musicow.com
Tech Lead        -             -
Frontend Dev     -             -
Backend Dev      -             -
Designer         -             -
QA               -             -
```

### 19.9 라이선스

```
MIT License

Copyright (c) 2025 Musicow

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 승인

```
역할                서명              날짜
──────────────────────────────────────────
법무팀장            _________         _____
전략팀장            _________         _____
CTO                _________         _____
CEO                _________         _____
```

---

**문서 끝**

---

**문서 메타데이터**
```yaml
title: "NewsBrief Converter (NBC) - Product Requirements Document"
version: "2.0"
status: "Draft"
created: "2025-10-18"
updated: "2025-10-18"
author: "뮤직카우 법무·정책팀"
total_pages: 150+
word_count: 25,000+
```

**다음 단계**

1. ✅ PRD 검토 및 피드백
2. 🔄 UI/UX 목업 제작 (Figma)
3. 🔄 기술 스택 최종 확정
4. 🔄 개발 시작
5. ⏸️ 2주 후 MVP 출시

**연락처**

질문이나 피드백이 있으시면 Slack #nbc-project 채널로 문의해주세요.
```