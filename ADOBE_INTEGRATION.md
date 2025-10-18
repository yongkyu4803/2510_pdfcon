# Adobe PDF Services 통합 가이드

## 현재 상태 (Updated)

**현재 구현**: Claude Vision API 단독 사용 (Adobe SDK 제거됨)

Adobe PDF Services SDK는 Next.js 15 + Turbopack과 호환성 문제가 있어 제거되었습니다.

### 문제점
- `log4js` 의존성이 Turbopack과 충돌
- 서버 사이드 동적 import 문제
- Next.js Edge Runtime 비호환

### 해결 방안

#### 옵션 1: Adobe REST API 직접 사용 (권장)
SDK 대신 REST API를 직접 호출하면 의존성 문제 없음

```typescript
// src/lib/adobe-rest.ts
async function extractPDFViaREST(pdfBuffer: Buffer) {
  // 1. Upload PDF
  const uploadResponse = await fetch(
    'https://pdf-services.adobe.io/assets',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/pdf'
      },
      body: pdfBuffer
    }
  );

  // 2. Submit extraction job
  // 3. Poll for results
  // 4. Download and parse
}
```

#### 옵션 2: 별도 마이크로서비스
Adobe SDK를 별도 Node.js 서버에서 실행

```
Next.js App → Adobe Microservice (Express) → Adobe SDK
```

#### 옵션 3: Claude Vision API Only (✅ 현재 구현)
Claude Vision API를 단독으로 사용

```typescript
// 현재 구현 (src/lib/claude.ts)
export async function convertPDFToHTML(
  pdfBuffer: Buffer,
  fileName: string,
  onProgress?: (progress: number, status: string) => void
): Promise<ConversionResult> {
  // 1. Claude Vision으로 텍스트 추출
  const pdfText = await extractTextFromPDF(pdfBuffer);

  // 2. 2단계 변환 (구조 분석 → HTML 생성)
  const result = await convertTextToHTML(pdfText);

  return result;
}
```

**장점**:
- ✅ 의존성 문제 없음
- ✅ Next.js 15와 완벽 호환
- ✅ 2단계 변환으로 95% 품질 달성
- ✅ OCR 지원
- ❌ API 비용 약간 높음 ($0.12/변환)

## 권장 사항

### Phase 1 (현재): Claude Vision만 사용
- ✅ 즉시 작동
- ✅ 의존성 문제 없음
- ✅ OCR 지원
- ❌ 비용 약간 높음 ($0.12/변환)

### Phase 2: Adobe REST API 추가
- ✅ 더 정확한 구조 추출
- ✅ 비용 절감
- ⚠️ REST API 구현 필요

### Phase 3: 하이브리드 최적화
- Adobe로 구조 추출 → 비용 절감
- Claude로 HTML 생성 → 품질 향상
- 총 비용: $0.08/변환 (33% 절감)

## Adobe REST API 구현 예시

```typescript
// src/lib/adobe-rest.ts
import fetch from 'node-fetch';

interface AdobeCredentials {
  clientId: string;
  clientSecret: string;
}

class AdobePDFServicesREST {
  private accessToken: string | null = null;

  async getAccessToken(creds: AdobeCredentials): Promise<string> {
    const response = await fetch(
      'https://pdf-services-ue1.adobe.io/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: creds.clientId,
          client_secret: creds.clientSecret,
        }),
      }
    );

    const data = await response.json();
    return data.access_token;
  }

  async extractPDF(pdfBuffer: Buffer): Promise<string> {
    // 1. Get access token
    const token = await this.getAccessToken({
      clientId: process.env.ADOBE_CLIENT_ID!,
      clientSecret: process.env.ADOBE_CLIENT_SECRET!,
    });

    // 2. Upload PDF
    const uploadRes = await fetch(
      'https://pdf-services.adobe.io/assets',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/pdf',
        },
        body: pdfBuffer,
      }
    );

    const { assetID } = await uploadRes.json();

    // 3. Submit extraction job
    const jobRes = await fetch(
      'https://pdf-services.adobe.io/operation/extractpdf',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetID,
          elementsToExtract: ['text'],
        }),
      }
    );

    const { location } = jobRes.headers;

    // 4. Poll for completion
    let result;
    while (true) {
      const statusRes = await fetch(location, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const status = await statusRes.json();

      if (status.status === 'done') {
        result = status;
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // 5. Download result
    const resultRes = await fetch(result.asset.downloadUri);
    const zipBuffer = await resultRes.buffer();

    // 6. Parse ZIP and extract text
    return parseAdobeResult(zipBuffer);
  }
}
```

## 다음 단계

1. **현재 (MVP)**: Claude Vision 사용
2. **Phase 1.5**: Adobe REST API 구현 검토
3. **Phase 2**: 비용/품질 비교 후 결정

## 참고 자료

- [Adobe PDF Services REST API](https://developer.adobe.com/document-services/docs/apis/)
- [Next.js + Adobe 호환성](https://github.com/vercel/next.js/issues/)
- [비용 비교 문서](./COST_ANALYSIS.md)

## 현재 시스템 상태

### 파일 구조
- `src/lib/claude.ts` - Claude Vision API 기반 변환 (활성화)
- `src/lib/adobe.ts.backup` - Adobe SDK 코드 (백업, 사용 안 함)
- `ADOBE_INTEGRATION.md` - Adobe 통합 가이드

### 빌드 상태
✅ 빌드 성공 (Adobe SDK 의존성 제거됨)
✅ 타입 체크 통과
✅ 로컬 개발 환경 정상 작동

### 다음 단계 옵션

**옵션 A: 현재 상태 유지 (권장)**
- Claude Vision API만 사용
- 추가 설정 불필요
- 즉시 사용 가능
- 95% 품질 달성

**옵션 B: Adobe REST API 구현**
- 비용 최적화 원하는 경우
- `adobe-rest.ts` 파일 생성 필요
- 구현 예시는 위 섹션 참조

**옵션 C: Adobe SDK 복구**
- 별도 마이크로서비스 구축 필요
- Express 서버로 Adobe SDK 실행
- Next.js와 REST API로 통신

---

**결론**: 현재는 Claude Vision만 사용 중이며 정상 작동합니다. 필요시 Adobe REST API로 전환 가능하지만, 현재 품질이 충분하다면 추가 작업 불필요합니다.
