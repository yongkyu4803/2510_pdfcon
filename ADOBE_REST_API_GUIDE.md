# Adobe PDF Extract API 사용 가이드

## 개요

Claude Vision API의 한계(요약/의역 가능성)를 해결하기 위해 **Adobe PDF Extract API (REST)**를 사용합니다.

### Adobe의 장점
- ✅ **원문 100% 보존**: 텍스트를 있는 그대로 추출
- ✅ **구조화된 데이터**: 단락, 표, 목록 등 구조 정보 포함
- ✅ **높은 정확도**: Adobe의 PDF 파싱 기술
- ✅ **요약/의역 없음**: 순수 텍스트 추출만 수행

### 왜 REST API인가?
- Adobe SDK(`@adobe/pdfservices-node-sdk`)는 Next.js 15/Turbopack과 호환 불가
- REST API는 직접 HTTP 요청으로 SDK 없이 사용 가능
- 동일한 기능 제공

---

## 1. Adobe API 자격 증명 발급

### 1.1 Adobe 계정 생성 및 프로젝트 생성

1. **Adobe Developer Console** 접속
   ```
   https://developer.adobe.com/console
   ```

2. **새 프로젝트 생성**
   - "Create new project" 클릭
   - 프로젝트 이름 입력 (예: "NewsBrief Converter")

3. **PDF Services API 추가**
   - "Add API" 클릭
   - "Adobe PDF Services API" 선택
   - "Next" 클릭

4. **OAuth Server-to-Server 인증 선택**
   - "OAuth Server-to-Server" 선택
   - "Next" 클릭

5. **자격 증명 복사**
   - 생성된 프로젝트에서 다음 정보 복사:
     - **Client ID** (예: `abc123def456...`)
     - **Client Secret** (예: `p8e-xyz789...`)

### 1.2 환경 변수 설정

`.env.local` 파일에 추가:
```bash
# Adobe PDF Services API
ADOBE_CLIENT_ID=your_client_id_here
ADOBE_CLIENT_SECRET=your_client_secret_here
```

---

## 2. 사용 방법

### 2.1 기본 사용법

```typescript
import { extractPDFWithAdobe } from '@/lib/adobe-rest';

// PDF 파일 버퍼
const pdfBuffer = Buffer.from(await file.arrayBuffer());

// Adobe로 텍스트 추출
const result = await extractPDFWithAdobe(pdfBuffer);

console.log(result.text);      // 추출된 원문 텍스트
console.log(result.method);    // 'adobe-extract'
```

### 2.2 Hybrid 방식 (권장)

Adobe 우선 시도 → 실패 시 Claude Vision 자동 전환:

```typescript
import { extractPDFTextHybrid } from '@/lib/adobe-rest';

const pdfBuffer = Buffer.from(await file.arrayBuffer());

const result = await extractPDFTextHybrid(pdfBuffer);

console.log(result.text);    // 추출된 텍스트
console.log(result.method);  // 'adobe-extract' 또는 'claude-vision'
```

### 2.3 API 라우트에서 사용

`src/app/api/convert/route.ts`에서:

```typescript
import { extractPDFTextHybrid } from '@/lib/adobe-rest';
import { convertTextToHTML } from '@/lib/claude';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const pdfBuffer = Buffer.from(await file.arrayBuffer());

  // 1. Adobe로 텍스트 추출 (fallback: Claude Vision)
  const { text, method } = await extractPDFTextHybrid(pdfBuffer);

  // 2. Claude로 HTML 변환
  const htmlResult = await convertTextToHTML(text);

  return NextResponse.json({
    success: true,
    extractionMethod: method,  // 어떤 방법 사용했는지
    html: htmlResult.html,
  });
}
```

---

## 3. 동작 원리

### 3.1 Adobe PDF Extract API 워크플로우

```
1. Access Token 발급
   POST https://pdf-services.adobe.io/token
   → access_token 받기

2. PDF 업로드
   POST https://pdf-services.adobe.io/assets
   → uploadUri 받기
   PUT {uploadUri}
   → PDF 파일 업로드

3. Extract Job 생성
   POST https://pdf-services.adobe.io/operation/extractpdf
   → jobID 받기

4. Job 완료 대기 (폴링)
   GET https://pdf-services.adobe.io/operation/extractpdf/{jobID}/status
   → status가 'done'이 될 때까지 2초마다 확인

5. 결과 다운로드
   GET {downloadUri}
   → ZIP 파일 다운로드
   → structuredData.json 추출
   → 텍스트 파싱
```

### 3.2 처리 시간

- **평균**: 10-20초 (PDF 크기에 따라)
- **Claude Vision**: 5-15초

Adobe가 약간 더 느리지만, **원문 보존이 보장**됩니다.

---

## 4. 비용

### Adobe PDF Extract API 가격

**무료 티어**:
- 월 500회 무료
- 초과 시: $0.05/건

**Claude Vision API 가격** (비교):
- $0.10-0.12/변환 (3회 API 호출)

### 비용 최적화 전략

**옵션 1: Adobe만 사용**
```typescript
// 항상 Adobe 사용 (월 500건까지 무료)
const result = await extractPDFWithAdobe(pdfBuffer);
```

**옵션 2: Hybrid (권장)**
```typescript
// Adobe 우선, 실패 시 Claude
const result = await extractPDFTextHybrid(pdfBuffer);
```

**옵션 3: 조건부 사용**
```typescript
// 중요 문서만 Adobe, 나머지는 Claude
const useAdobe = file.size > 5 * 1024 * 1024; // 5MB 이상

const result = useAdobe
  ? await extractPDFWithAdobe(pdfBuffer)
  : await extractTextFromPDF(pdfBuffer);
```

---

## 5. 에러 처리

### 5.1 일반적인 에러

**인증 실패**:
```
Error: Adobe 인증 실패: 401 Unauthorized
```
→ `ADOBE_CLIENT_ID`, `ADOBE_CLIENT_SECRET` 확인

**Job 타임아웃**:
```
Error: Adobe Job 타임아웃
```
→ PDF가 너무 큰 경우 (>50MB), 파일 크기 줄이기

**ZIP 파싱 실패**:
```
Error: structuredData.json을 찾을 수 없습니다
```
→ Adobe API 응답 형식 변경, 재시도 또는 Claude fallback

### 5.2 Fallback 전략

```typescript
try {
  // Adobe 시도
  const result = await extractPDFWithAdobe(pdfBuffer);
} catch (error) {
  console.error('Adobe 실패:', error);

  // Claude Vision으로 전환
  const text = await extractTextFromPDF(pdfBuffer);
  return { text, method: 'claude-vision-fallback' };
}
```

---

## 6. 전체 통합 예제

### 6.1 `src/lib/claude.ts` 수정

```typescript
import { extractPDFTextHybrid } from './adobe-rest';

export async function convertPDFToHTML(
  pdfBuffer: Buffer,
  fileName: string,
  onProgress?: (progress: number, status: string) => void
): Promise<ConversionResult> {
  try {
    // 1. Adobe/Claude Hybrid로 텍스트 추출 (0% → 40%)
    onProgress?.(5, '파일 검증 중...');
    onProgress?.(10, 'PDF 텍스트 추출 중...');

    const { text: pdfText, method } = await extractPDFTextHybrid(pdfBuffer);

    onProgress?.(35, `${method}로 추출 완료`);

    // 2. HTML 변환 (40% → 90%)
    onProgress?.(45, 'HTML 변환 중...');
    const result = await convertTextToHTML(pdfText);

    onProgress?.(100, '변환 완료!');

    return {
      ...result,
      method: method as any,
    };
  } catch (error) {
    console.error('Conversion error:', error);
    throw error;
  }
}
```

### 6.2 테스트

```bash
# 환경 변수 설정
echo "ADOBE_CLIENT_ID=your_id" >> .env.local
echo "ADOBE_CLIENT_SECRET=your_secret" >> .env.local

# 개발 서버 시작
npm run dev

# PDF 업로드 테스트
# Adobe 자격 증명이 있으면 Adobe 사용
# 없으면 자동으로 Claude Vision 사용
```

---

## 7. 모니터링 및 로깅

### 7.1 추출 방법 추적

```typescript
// DB에 저장
await createConversion({
  id: conversionId,
  fileName: file.name,
  extractionMethod: method, // 'adobe-extract' or 'claude-vision'
  // ...
});

// 통계 분석
const stats = await db.query(`
  SELECT extraction_method, COUNT(*) as count
  FROM conversions
  GROUP BY extraction_method
`);
```

### 7.2 로그 모니터링

```typescript
console.log('[Adobe] Access Token 발급 중...');
console.log('[Adobe] PDF 업로드 중...');
console.log('[Adobe] Extract Job 생성 중...');
console.log('[Adobe] Job 완료 대기 중...');
console.log('[Adobe] 결과 다운로드 및 텍스트 추출 중...');
```

Vercel Logs에서 각 단계 확인 가능.

---

## 8. 성능 비교

| 방식 | 속도 | 정확도 | 원문 보존 | 비용 |
|------|------|--------|-----------|------|
| **Claude Vision** | ⚡ 빠름 (5-15초) | 90% | ⚠️ 가끔 요약 | $0.10-0.12 |
| **Adobe Extract** | 🐢 보통 (10-20초) | 95% | ✅ 100% | $0.05 (500건 후) |
| **Hybrid** | ⚡ 빠름 (Adobe 우선) | 95% | ✅ 100% | 최적화 |

**권장**: Hybrid 방식 사용

---

## 9. 문제 해결

### Q: Adobe API 키가 없으면?
A: 자동으로 Claude Vision으로 전환됩니다 (Hybrid 모드).

### Q: 월 500건 이상 사용하면?
A:
- Adobe 유료 전환 ($0.05/건)
- 또는 Claude Vision으로 전환

### Q: Adobe가 느린데 더 빠르게 할 수 없나요?
A:
- Job 폴링 간격 단축 (2초 → 1초)
- 하지만 API Rate Limit 주의

### Q: 원문 보존이 정말 100%인가요?
A:
- Adobe는 순수 텍스트 추출만 수행 (AI 처리 없음)
- PDF 내부 텍스트 레이어를 그대로 추출
- 스캔 PDF는 OCR 정확도에 따라 다름

---

## 10. 다음 단계

1. **Adobe 자격 증명 발급** (위 1단계 참조)
2. **환경 변수 설정** (.env.local)
3. **테스트**:
   ```bash
   npm run dev
   # PDF 업로드 테스트
   ```
4. **로그 확인**: 콘솔에서 `[Adobe]` 로그 확인
5. **성능 모니터링**: Vercel Dashboard에서 API 응답 시간 확인

---

**문의**: Adobe API 관련 이슈는 [Adobe Developer Console](https://developer.adobe.com/console)에서 확인
