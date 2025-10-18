# NewsBrief Converter - 빠른 시작 가이드

## 로컬 개발 환경 설정

### 1단계: 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Anthropic Claude API 키 발급 (필수)
# https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Vercel Blob Storage (Vercel 배포 시 자동 생성)
BLOB_READ_WRITE_TOKEN=

# Vercel Postgres (Vercel 배포 시 자동 생성)
POSTGRES_URL=
```

### 2단계: 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

---

## Vercel 배포 가이드

### 1단계: Vercel 프로젝트 생성

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 연결
vercel

# 첫 배포
vercel --prod
```

### 2단계: Vercel Storage 추가

#### Blob Storage 설정
1. Vercel Dashboard → Storage → Create Database
2. **Blob** 선택 → Create
3. `.env.local` 탭에서 환경 변수 자동 복사
4. 프로젝트에 추가

#### Postgres Database 설정
1. Storage → Create Database
2. **Postgres** 선택 → Create
3. `.env.local` 탭에서 환경 변수 자동 복사
4. Query 탭으로 이동
5. `scripts/migrate.sql` 파일 내용을 복사하여 실행

```sql
-- 복사해서 실행
CREATE TABLE IF NOT EXISTS conversions (
  id VARCHAR(21) PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL,
  input_url TEXT,
  output_url TEXT,
  method VARCHAR(20),
  tokens INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_conversions_status ON conversions(status);
CREATE INDEX idx_conversions_created_at ON conversions(created_at DESC);
```

### 3단계: 환경 변수 설정

Vercel Dashboard → Settings → Environment Variables

**필수 환경 변수:**
- `ANTHROPIC_API_KEY` (직접 입력)
- `BLOB_READ_WRITE_TOKEN` (자동 생성됨)
- `POSTGRES_URL` (자동 생성됨)

### 4단계: 재배포

```bash
vercel --prod
```

---

## 테스트

### 1. 로컬 테스트
1. 개발 서버 실행: `npm run dev`
2. 브라우저에서 http://localhost:3000 접속
3. PDF 파일 업로드 (50MB 이하)
4. 변환 결과 확인

### 2. 프로덕션 테스트
1. Vercel URL 접속
2. 동일한 테스트 수행
3. 히스토리 페이지 확인

---

## 문제 해결

### Claude API 오류
```
Error: Failed to convert
```
**해결방법:**
- API 키 확인: https://console.anthropic.com/settings/keys
- 사용량 한도 확인: https://console.anthropic.com/settings/limits
- `.env.local` 파일에 `ANTHROPIC_API_KEY` 올바르게 설정되었는지 확인

### Blob Storage 오류
```
Error: Failed to upload
```
**해결방법:**
- Vercel Dashboard → Storage → Blob 생성 확인
- 환경 변수 `BLOB_READ_WRITE_TOKEN` 설정 확인
- Vercel 프로젝트에 Storage가 연결되었는지 확인

### Database 오류
```
Error: Failed to connect to database
```
**해결방법:**
- Vercel Dashboard → Storage → Postgres 생성 확인
- 환경 변수 `POSTGRES_URL` 설정 확인
- `scripts/migrate.sql` 실행 확인

---

## 다음 단계

1. **API 키 발급** (5분)
   - Anthropic Console에서 API 키 생성

2. **Vercel 배포** (10분)
   - Storage 추가 (Blob + Postgres)
   - 환경 변수 설정
   - DB 마이그레이션 실행

3. **첫 변환 테스트** (1분)
   - PDF 업로드
   - 변환 결과 확인
   - HTML 다운로드

---

**총 소요 시간: 약 20분**

문의사항: GitHub Issues
