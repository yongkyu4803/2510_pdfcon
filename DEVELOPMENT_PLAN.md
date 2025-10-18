# NewsBrief Converter (NBC) - 개발 계획

**프로젝트**: 외신 브리핑 PDF → HTML 자동 변환 시스템
**버전**: v1.0 MVP
**예상 기간**: 2주
**개발 환경**: Next.js 15 + TypeScript + Vercel

---

## 📋 프로젝트 개요

### 핵심 목표
- PDF 업로드 → 30초 이내 HTML 변환
- 모바일/데스크톱 반응형 지원
- 변환 히스토리 관리 (최근 30개)

### 핵심 가치
- **시간 절약**: 문서당 15분 → 30초 (97% 단축)
- **접근성**: URL만으로 모든 기기에서 즉시 접근
- **검색 가능**: 브라우저 내 텍스트 검색 지원

---

## 🏗️ 시스템 아키텍처

```
User Browser
    ↓
Next.js App (Vercel)
    ├─ Frontend: React Server + Client Components
    ├─ API Routes: /api/upload, /api/convert, /api/history
    └─ Service Layer: Adobe Client, Claude Client
        ↓
External APIs
    ├─ Adobe PDF Services (구조 추출)
    ├─ Claude API (HTML 변환)
    └─ Vercel Blob (파일 저장)
        ↓
Vercel Postgres (메타데이터)
```

---

## 🎯 MVP 기능 요구사항 (Phase 1)

### F1: PDF 업로드 ✅
- [x] 드래그앤드롭 UI (react-dropzone)
- [x] 파일 선택 버튼
- [x] 검증: PDF만, 최대 50MB
- [x] 에러 처리 및 시각적 피드백

**구현 파일**: `components/FileUploader.tsx`

---

### F2: 자동 변환 (하이브리드) ⚡
**단계별 프로세스**:

```
1. 파일 검증 (5%)
   └─ PDF 유효성, 크기, 메타데이터

2. Adobe 구조 추출 (10% → 40%)
   └─ API 호출 → JSON 구조 수신

3. 구조 정제 (45%)
   └─ 제목/본문 구분, 카테고리 분류

4. Claude HTML 변환 (50% → 90%)
   └─ API 호출 → HTML 생성

5. 후처리 (95%)
   └─ 유효성 검사, XSS 방지

6. 저장 (100%)
   └─ Vercel Blob 업로드, DB 저장
```

**Fallback 전략**:
1. Adobe + Claude (하이브리드) ← 기본
2. Claude 단독 (Adobe 실패 시)
3. 기본 텍스트 추출 (모두 실패 시)

**구현 파일**:
- `lib/adobe.ts` - Adobe API 통합
- `lib/claude.ts` - Claude API 통합
- `lib/converter.ts` - 변환 로직 + Fallback
- `app/api/convert/route.ts` - API 엔드포인트

---

### F3: HTML 출력 및 표시 📄
- [x] 인라인 뷰어 (iframe + DOMPurify)
- [x] 전체화면 모드
- [x] 다운로드 기능
- [x] URL 공유 (클립보드 복사)

**구현 파일**: `components/HTMLViewer.tsx`

---

### F4: 변환 히스토리 📚
- [x] 최근 30개 변환 목록
- [x] 날짜/파일명/상태 표시
- [x] 재열람 기능
- [ ] 검색 및 필터 (Phase 2)

**구현 파일**:
- `app/history/page.tsx`
- `lib/db.ts` - DB 쿼리

---

## 🛠️ 기술 스택

### Frontend
```json
{
  "next": "^15.0.0",
  "react": "^18.3.0",
  "typescript": "^5.3.0",
  "tailwindcss": "^3.4.0",
  "react-dropzone": "^14.2.0",
  "lucide-react": "^0.400.0",
  "isomorphic-dompurify": "^2.11.0"
}
```

### Backend
```json
{
  "@adobe/pdfservices-node-sdk": "^4.0.0",
  "@anthropic-ai/sdk": "^0.20.0",
  "@vercel/blob": "^0.22.0",
  "@vercel/postgres": "^0.8.0",
  "drizzle-orm": "^0.30.0"
}
```

---

## 📁 폴더 구조

```
newbrief-converter/
├── app/
│   ├── page.tsx                    # 홈 (업로드 페이지)
│   ├── convert/page.tsx            # 변환 진행 페이지
│   ├── history/page.tsx            # 히스토리 목록
│   ├── view/[id]/page.tsx          # HTML 뷰어
│   └── api/
│       ├── upload/route.ts         # 파일 업로드
│       ├── convert/route.ts        # 변환 시작
│       ├── status/[id]/route.ts    # 변환 상태
│       └── history/route.ts        # 히스토리 조회
│
├── components/
│   ├── ui/                         # shadcn/ui 컴포넌트
│   ├── file-uploader.tsx           # 파일 업로드
│   ├── conversion-progress.tsx     # 진행률 표시
│   └── html-viewer.tsx             # HTML 뷰어
│
├── lib/
│   ├── adobe.ts                    # Adobe API 클라이언트
│   ├── claude.ts                   # Claude API 클라이언트
│   ├── converter.ts                # 변환 로직
│   ├── storage.ts                  # Vercel Blob
│   └── db.ts                       # DB 클라이언트
│
└── db/
    └── schema.ts                   # Drizzle 스키마
```

---

## 🔐 환경 변수

```bash
# .env.local

# Adobe PDF Services
ADOBE_CLIENT_ID=
ADOBE_CLIENT_SECRET=

# Anthropic Claude
ANTHROPIC_API_KEY=

# Vercel Blob
BLOB_READ_WRITE_TOKEN=

# Vercel Postgres
POSTGRES_URL=
```

---

## 📊 데이터베이스 스키마

```typescript
// db/schema.ts
export const conversions = pgTable('conversions', {
  id: varchar('id', { length: 21 }).primaryKey(), // nanoid
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileSize: integer('file_size').notNull(),
  status: varchar('status', { length: 20 }).notNull(), // pending, processing, completed, failed
  inputUrl: text('input_url'),
  outputUrl: text('output_url'),
  method: varchar('method', { length: 20 }), // hybrid, claude-only, basic
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at')
});
```

---

## 🚀 개발 로드맵 (2주)

### Week 1: 핵심 기능 구현

**Day 1-2: 프로젝트 설정**
- [x] Next.js 프로젝트 초기화
- [x] Tailwind + shadcn/ui 설정
- [x] 환경 변수 설정
- [ ] Adobe/Claude API 키 발급

**Day 3-4: 업로드 & 변환**
- [ ] FileUploader 컴포넌트
- [ ] Adobe API 통합
- [ ] Claude API 통합
- [ ] 변환 로직 구현

**Day 5-7: 데이터베이스 & API**
- [ ] Vercel Postgres 설정
- [ ] Drizzle 스키마 정의
- [ ] API Routes 구현
- [ ] 진행률 추적 (SSE)

---

### Week 2: UI/UX & 배포

**Day 8-9: 뷰어 & 히스토리**
- [ ] HTMLViewer 컴포넌트
- [ ] 다운로드/공유 기능
- [ ] 히스토리 페이지

**Day 10-11: 테스트 & 최적화**
- [ ] E2E 테스트 (Playwright)
- [ ] 에러 처리 개선
- [ ] 성능 최적화

**Day 12-14: 배포 & 검증**
- [ ] Vercel 배포
- [ ] 실제 PDF 테스트
- [ ] 사용자 피드백 수집

---

## ✅ 성공 기준

### 정량적 지표
- [ ] 변환 성공률 > 90%
- [ ] 평균 변환 시간 < 30초
- [ ] 모바일 접근 가능 (iOS/Android)
- [ ] 일일 사용 1회 이상

### 정성적 지표
- [ ] 사용자 만족도 > 4.0/5.0
- [ ] 업무 시간 80% 단축
- [ ] 팀원들의 자발적 사용

---

## 🧪 테스트 계획

### 단위 테스트
- Adobe API 통합
- Claude API 통합
- 변환 로직
- DB 쿼리

### E2E 테스트
- 파일 업로드 → 변환 → 뷰어 표시
- 에러 케이스 (잘못된 파일, 대용량)
- 히스토리 조회

---

## 🚨 리스크 관리

### 기술적 리스크

**R1: Adobe API 불안정**
- **확률**: 중간
- **영향**: 높음
- **대응**: Claude 단독 모드 Fallback

**R2: Claude API 비용 초과**
- **확률**: 낮음
- **영향**: 중간
- **대응**: 월 50건 제한, 알림 설정

**R3: PDF 구조 복잡도**
- **확률**: 높음
- **영향**: 중간
- **대응**: 기본 텍스트 추출 Fallback

---

## 📈 Phase 2 로드맵 (향후 계획)

### 자동화 기능
- [ ] 이메일 자동 모니터링 (IMAP)
- [ ] 스케줄 변환 (Vercel Cron)
- [ ] Slack 알림 통합

### 협업 기능
- [ ] 사용자 인증 (NextAuth)
- [ ] 댓글 시스템
- [ ] 하이라이트 공유

### AI 기능
- [ ] 자동 요약 (Claude)
- [ ] 키워드 추출
- [ ] 트렌드 분석

---

## 📞 연락처

**담당자**: 법무·정책팀
**프로젝트 관리자**: 뮤직카우 개발팀
**기술 문의**: [이메일 주소]

---

**마지막 업데이트**: 2025.10.18
**다음 리뷰**: Week 1 종료 시점
