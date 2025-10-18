/**
 * Google Gemini API 클라이언트
 * PDF를 직접 읽고 구조화된 HTML로 변환
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiConversionResult {
  html: string;
  method: 'gemini-pdf';
  tokens?: number;
}

/**
 * Gemini API 설정 확인
 */
export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

/**
 * Gemini API로 PDF를 HTML로 변환
 */
export async function convertPDFToHTMLWithGemini(
  pdfBuffer: Buffer,
  _fileName: string
): Promise<GeminiConversionResult> {
  if (!isGeminiConfigured()) {
    throw new Error('Gemini API 키가 설정되지 않았습니다.');
  }

  const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  // Gemini 2.5 Pro 모델 사용 (PDF 지원, 고품질)
  const model = genai.getGenerativeModel({
    model: 'gemini-2.5-pro'
  });

  try {
    console.log('[Gemini] PDF 분석 중...');

    // PDF를 base64로 인코딩
    const base64Pdf = pdfBuffer.toString('base64');

    // Gemini에게 PDF 분석 및 HTML 변환 요청 (개선된 프롬프트)
    const prompt = `지금부터 당신은 PDF 문서를 구조화된 HTML로 변환하는 전문 파서(Parser)입니다. 업로드된 '일일 외신 보도 동향' PDF 파일을 아래에 정의된 **[파싱 규칙]**과 **[HTML 템플릿]**에 따라 **정확하고 일관성 있게** 변환해 주세요.

---

## [파싱 규칙]

### 1. 문서 구조 분석
이 문서는 크게 **[헤더]**, **[요지]**, **[본문]** 세 부분으로 구성됩니다. 각 부분을 정확히 식별하여 지정된 HTML 태그로 변환해야 합니다.

### 2. [헤더] 파싱 규칙
- **문서 제목** (예: '일일 외신 보도 동향'): \`<h1>\` 태그로 변환합니다.
- **날짜 및 부서명** (예: 'YYYY.MM.DD (요일) 외교부 해외언론과'): \`<h1>\` 바로 아래 줄의 텍스트는 \`<p class="report-meta">\` 태그로 변환합니다.

### 3. [요지] 섹션 파싱 규칙
- **요지 감지**: 다음 패턴 중 하나를 찾으면 \`<section class="summary">\`를 시작합니다:
  - \`[요지]\` (대괄호)
  - \`【요지】\` (꺾쇠 대괄호)
  - \`◇ 요지\` (마름모 기호)
  - \`◆ 요지\` (채워진 마름모)

- **요지 제목**: 감지된 패턴을 \`<h2>요지</h2>\`로 변환합니다 (기호 제거).

- **3단계 계층 구조**: 요지 내용은 다음과 같이 중첩된 \`<ul>\` 목록으로 변환합니다:

  **1단계 (대분류 - □):**
  - \`□\` (빈 네모)로 시작하는 줄을 찾습니다
  - \`<li class="category">\`로 변환하고, \`□\` 기호는 **유지**합니다
  - 텍스트 예시: "□ 국내 정치", "□ 북한", "□ 미국"
  - 이 \`<li>\` 안에 새로운 \`<ul>\`을 생성하여 2단계 항목을 포함합니다

  **2단계 (기사 제목 - ○):**
  - \`○\` (빈 동그라미)로 시작하는 줄을 찾습니다
  - \`<li class="article-title">\`로 변환하고, \`○\` 기호는 **유지**합니다
  - 텍스트 예시: "○ 美 대선 여론조사 결과 분석"
  - 3단계 요약이 있는 경우, 이 \`<li>\` 안에 포함시킵니다

  **3단계 (기사 요약 - -):**
  - \`-\` (하이픈) 또는 \`–\` (엔 대시)로 시작하는 들여쓰기 된 줄을 찾습니다
  - 2단계 기사 제목 바로 아래에 \`<p class="article-summary">\` 태그로 추가합니다
  - \`-\` 기호는 **유지**하고 텍스트와 함께 출력합니다
  - 여러 줄의 요약이 있을 경우 각각 별도의 \`<p class="article-summary">\`로 변환합니다

### 4. [본문] 섹션 파싱 규칙
- 요지 섹션이 끝나면 \`<main>\` 태그를 시작하여 본문 전체를 감쌉니다.
- **본문 카테고리 제목**: 요지와 동일한 카테고리명이 특수 기호 없이 나타날 때 \`<section class="main-section">\`으로 감싸고, 제목은 \`<h2>\` 태그로 변환합니다
- **개별 기사**: 각 카테고리 내의 기사들은 \`<article>\` 태그로 묶습니다:
  - 기사 소제목 (\`< >\`, \`▲\`, \`□\`, \`-\` 등으로 시작) → \`<h3>\` 태그로 변환하며, **기호는 그대로 유지**합니다
  - 일반 텍스트 단락 → \`<p>\` 태그 (단락이 \`-\`로 시작하면 **\`-\` 기호를 유지**합니다)
  - 인용문 → \`<blockquote>\` 태그

### 5. 최종 출력 규칙
- **원본 텍스트를 한 글자도 변경하지 마세요** (특수기호 □, ○, - 등은 모두 **유지**합니다)
- 문서의 어떤 내용도 누락되어서는 안 됩니다
- **코드 블록(\`\`\`) 없이 순수 HTML만 출력하세요**
- 아래 HTML 템플릿의 CSS를 포함하여 완전한 HTML5 문서를 생성하세요

---

**출력:** 완성된 HTML 코드만 반환하세요. 설명이나 주석은 제외하고 즉시 사용 가능한 HTML만 출력하세요.`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64Pdf,
        },
      },
      prompt,
    ]);

    const response = result.response;
    const htmlContent = response.text();

    console.log('[Gemini] HTML 변환 완료');
    console.log('[Gemini] 응답 길이:', htmlContent.length);
    console.log('[Gemini] 응답 미리보기:', htmlContent.substring(0, 200));

    // HTML 추출 (코드 블록이 있을 수 있음)
    let cleanedHTML = htmlContent.trim();

    // ```html ... ``` 형태 제거 (개선된 정규식)
    cleanedHTML = cleanedHTML
      .replace(/^```html\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/\s*```\s*$/g, '');

    console.log('[Gemini] 정리된 HTML 길이:', cleanedHTML.length);
    console.log('[Gemini] 정리된 HTML 시작:', cleanedHTML.substring(0, 100));

    return {
      html: cleanedHTML.trim(),
      method: 'gemini-pdf',
      tokens: response.usageMetadata?.totalTokenCount || 0,
    };
  } catch (error) {
    console.error('Gemini API 오류:', error);
    throw new Error(
      `Gemini PDF 변환 중 오류가 발생했습니다: ${
        error instanceof Error ? error.message : '알 수 없는 오류'
      }`
    );
  }
}
