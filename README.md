# NewsBrief Converter (NBC)

외신 브리핑 PDF를 HTML로 자동 변환하는 웹 애플리케이션입니다.

## 기능

- **PDF 업로드**: 드래그앤드롭 또는 클릭으로 간편 업로드 (최대 50MB)
- **자동 변환**: Claude AI를 활용한 지능형 HTML 변환
- **실시간 미리보기**: 변환된 HTML을 즉시 확인
- **변환 히스토리**: 최근 30개 변환 작업 관리
- **모바일 지원**: 반응형 디자인으로 모든 기기 지원

## 기술 스택

- **Framework**: Next.js 15 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS + shadcn/ui
- **AI**: Claude 3.5 Sonnet (Anthropic)
- **저장소**: Vercel Blob Storage
- **데이터베이스**: Vercel Postgres + Drizzle ORM
- **배포**: Vercel

## 시작하기

### 사전 요구사항

- Node.js 18+
- npm 또는 pnpm
- Vercel 계정 (배포용)
- Anthropic API 키

### 설치

```bash
# 저장소 클론
git clone <repository-url>
cd newbrief-converter

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 열고 필요한 값을 입력하세요
```

### 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```env
# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx

# Vercel Postgres
POSTGRES_URL=postgres://xxxxx
```

### 데이터베이스 초기화

```bash
# Vercel Postgres 대시보드에서 SQL 쿼리 실행
# scripts/migrate.sql 파일의 내용을 실행하세요
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
newbrief-converter/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx             # 메인 페이지 (업로드)
│   │   ├── history/             # 히스토리 페이지
│   │   ├── view/[id]/           # 개별 변환 뷰어
│   │   └── api/                 # API Routes
│   │       ├── convert/         # 변환 엔드포인트
│   │       └── conversions/     # 히스토리 조회
│   │
│   ├── components/              # React 컴포넌트
│   │   ├── ui/                  # shadcn/ui 컴포넌트
│   │   ├── file-uploader.tsx   # 파일 업로드
│   │   ├── conversion-progress.tsx
│   │   └── html-viewer.tsx     # HTML 뷰어
│   │
│   └── lib/                     # 유틸리티 & 클라이언트
│       ├── claude.ts           # Claude API
│       ├── storage.ts          # Vercel Blob
│       └── db.ts              # 데이터베이스
│
├── scripts/
│   └── migrate.sql            # DB 마이그레이션
│
└── public/                    # 정적 파일
```

## API 엔드포인트

### POST /api/convert

PDF 파일을 HTML로 변환합니다.

**요청:**
```
Content-Type: multipart/form-data
Body: file (PDF)
```

**응답:**
```json
{
  "success": true,
  "conversionId": "xxx",
  "outputUrl": "https://...",
  "conversion": { ... }
}
```

### GET /api/conversions

최근 변환 목록을 조회합니다 (최대 30개).

**응답:**
```json
[
  {
    "id": "xxx",
    "fileName": "example.pdf",
    "status": "completed",
    "outputUrl": "https://...",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### GET /api/conversions/[id]

특정 변환 작업을 조회합니다.

## 배포

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정하세요:
- `ANTHROPIC_API_KEY`
- `BLOB_READ_WRITE_TOKEN` (자동 생성)
- `POSTGRES_URL` (자동 생성)

### 데이터베이스 마이그레이션

1. Vercel 대시보드 → Storage → Postgres
2. Query 탭에서 `scripts/migrate.sql` 실행

## 사용 방법

1. **파일 업로드**: PDF 파일을 드래그하거나 클릭하여 선택
2. **변환 시작**: "HTML로 변환하기" 버튼 클릭
3. **결과 확인**: 변환된 HTML을 미리보기로 확인
4. **다운로드/공유**: HTML 파일 다운로드 또는 URL 공유

## 제한사항

- 파일 크기: 최대 50MB
- 파일 형식: PDF만 지원
- 변환 시간: 평균 10-30초
- 히스토리: 최근 30개만 표시

## 트러블슈팅

### Claude API 오류
- API 키가 올바른지 확인
- API 사용량 한도 확인

### Blob Storage 오류
- `BLOB_READ_WRITE_TOKEN` 환경 변수 확인
- Vercel 프로젝트 설정에서 Blob Storage 활성화

### 데이터베이스 오류
- Postgres 연결 확인
- 마이그레이션 스크립트 실행 여부 확인

## 개발 로드맵

### Phase 1: MVP (완료) ✅
- [x] PDF 업로드
- [x] Claude AI 변환
- [x] HTML 뷰어
- [x] 변환 히스토리

### Phase 1.1: 품질 개선 (완료) ✅
- [x] 2단계 변환 프로세스 (구조 분석 + HTML 생성)
- [x] 향상된 프롬프트 엔지니어링
- [x] 전문적인 스타일링 (다크모드, 반응형)
- [x] 카테고리 자동 분류
- [x] 목차 자동 생성
- [x] Adobe SDK 제거 및 빌드 안정화

**품질 개선 상세**: [QUALITY_IMPROVEMENTS.md](QUALITY_IMPROVEMENTS.md)
**시스템 현황**: [CURRENT_STATUS.md](CURRENT_STATUS.md)

### Phase 2: 향후 계획
- [ ] 사용자 템플릿 선택 (Professional/Minimal/Modern)
- [ ] 커스텀 CSS 업로드
- [ ] 자동 요약 기능
- [ ] 키워드 하이라이팅
- [ ] 사용자 인증 및 팀 협업

## 라이선스

MIT

## 문의

- 개발팀: 뮤직카우 법무·정책팀
- 이슈: GitHub Issues

---

**Built with ❤️ using Next.js and Claude AI**
