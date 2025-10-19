import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { DomesticParsedDocument } from '@/types/document';
import { safeParseDomesticParsedDocument } from '@/schemas/document';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not set');
}

const genAI = new GoogleGenerativeAI(apiKey);

export interface GeminiDomesticJsonConversionResult {
  data: DomesticParsedDocument;
  method: 'gemini-domestic-json';
  tokens?: number;
}

// 국내 정책 보도 전용 프롬프트 (domestic.md 기반)
const DOMESTIC_PROMPT = `지금부터 당신은 PDF 정책 문서를 구조화된 HTML로 변환하는 전문 파서(Parser)입니다. 업로드된 '정책 보도 일일 종합' PDF 파일을 아래에 정의된 **[파싱 규칙]**과 **[HTML 템플릿]**에 따라 **정확하고 일관성 있게** 변환해 주세요.

---

### [파싱 규칙]

#### 1. 문서 구조 분석
이 문서는 **[헤더]**, **[종합 요약]**, **[본문]**, **[사설 요약]** 네 부분으로 구성됩니다. 각 부분을 정확히 식별하여 지정된 HTML 태그로 변환해야 합니다.

#### 2. [헤더] 파싱 규칙
- **문서 제목** (예: '정책 보도 일일 종합'): \`<h1>\` 태그로 변환합니다.
- **날짜, 대상 언론사, 부서명**: 제목 아래 여러 줄에 걸쳐 있는 정보는 \`<div class="report-meta">\`로 감싸고, 각 줄은 \`<p>\` 태그로 변환합니다.

#### 3. [종합 요약] 섹션 파싱 규칙 (첫 페이지 본문)
- 첫 페이지에서 '금일 사설' 이전까지의 내용을 **[종합 요약]**으로 간주하고, \`<section class="summary">\`로 감쌉니다.
- 내용은 다음 **2단계 트리 구조**에 따라 중첩된 \`<ul>\` 목록으로 변환합니다.
    - **1단계 (대분류)**: \`○\` 문자로 시작하는 줄을 찾습니다.
        - 이 줄은 \`<li class="category">\`로 변환하고, \`○\` 문자는 제거합니다.
        - 이 \`<li>\` 안에 새로운 \`<ul>\`을 생성하여 2단계를 준비합니다.
    - **2단계 (세부 항목)**: \`-\` 문자, 꺾쇠괄호(\`< >\`), 또는 일반 텍스트로 시작하며 들여쓰기 된 줄을 찾습니다.
        - 이 줄은 \`<li class="detail-item">\`으로 변환합니다.

#### 4. [사설 요약] 섹션 파싱 규칙 (첫 페이지 하단)
- **'금일 사설'** 이라는 텍스트를 찾으면, \`<section class="editorials-summary">\`를 시작하고 \`<h2>금일 사설</h2>\`을 생성합니다.
- 그 아래 내용은 다음 규칙에 따라 \`<ul>\` 목록으로 변환합니다.
    - \`■\` 문자로 시작하는 줄을 찾습니다.
        - 이 줄은 \`<li class="editorial-category">\`로 변환합니다.
        - \`■\` 문자는 제거하고, 카테고리(예: '통상', '국회')는 \`<strong>\` 태그로 감싸줍니다.

#### 5. [본문] 섹션 파싱 규칙 (두 번째 페이지부터)
- 두 번째 페이지부터는 \`<main>\` 태그를 시작하여 본문 전체를 감쌉니다.
- **본문 카테고리 제목** (예: '대통령', '통상', '경제'): 페이지 상단에 위치한 중앙 정렬된 제목을 찾습니다.
    - 이 제목은 새로운 \`<section class="main-section">\`을 시작하며 \`<h2>\` 태그로 변환합니다.
- **개별 기사 그룹**: 각 카테고리 내의 기사 그룹은 \`<article>\` 태그로 묶습니다.
    - **대표 기사 제목**: \`○\` 문자로 시작하는 줄을 찾습니다.
        - 이 줄은 \`<h3>\` 태그로 변환하고, \`○\` 문자는 제거합니다.
    - **세부 내용**: 대표 기사 제목 아래에 있는 모든 관련 내용(들여쓰기 된 텍스트, \`< >\`로 시작하는 줄 등)은 \`<div class="article-body">\`로 감싸고, 각 줄은 \`<p>\` 태그로 변환합니다.
    - **본문 내 사설**: '사설 <...>'로 시작하는 줄을 찾습니다.
        - 이 줄은 \`<blockquote class="editorial">\` 태그로 변환합니다.

#### 6. 최종 출력 규칙
- 아래 **[HTML 템플릿]**의 구조를 반드시 준수해야 합니다.
- CSS는 템플릿에 포함된 코드를 그대로 사용합니다.
- 문서의 어떤 내용도 누락되어서는 안 됩니다.
- **중요**: HTML 코드만 출력하고, 마크다운 코드 블록(\\\`\\\`\\\`html)은 사용하지 마세요.

---

### [HTML 템플릿]

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>정책 보도 일일 종합</title>
    <style>
        body { font-family: 'KoPub Batang', '바탕', serif; line-height: 1.8; margin: 0; padding: 20px; background-color: #f8f9fa; color: #212529; }
        .container { max-width: 900px; margin: auto; background: white; padding: 40px 50px; border-radius: 4px; border-top: 5px solid #003366; box-shadow: 0 2px 10px rgba(0,0,0,0.07); }
        h1, h2, h3 { color: #003366; }
        h1 { text-align: center; font-size: 2.2em; margin-bottom: 10px; }
        h2 { font-size: 1.7em; border-bottom: 2px solid #dee2e6; padding-bottom: 10px; margin-top: 50px; }
        h3 { font-size: 1.3em; color: #1a4a7a; border-left: 4px solid #1a4a7a; padding-left: 10px; margin-top: 30px; }
        .report-meta { text-align: center; color: #555; font-size: 1em; margin-bottom: 40px; border-bottom: 1px solid #e9ecef; padding-bottom: 20px; }
        .report-meta p { margin: 4px 0; }

        /* 종합 요약 섹션 스타일 */
        .summary ul { list-style: none; padding-left: 0; }
        .summary li.category { font-weight: bold; font-size: 1.1em; margin-top: 15px; color: #004080; }
        .summary li.category ul { padding-left: 25px; font-weight: normal; }
        .summary li.detail-item { margin-top: 5px; color: #343a40; }

        /* 사설 요약 섹션 스타일 */
        .editorials-summary ul { list-style: none; padding-left: 0; }
        .editorials-summary li.editorial-category { background-color: #f1f3f5; padding: 10px 15px; border-radius: 4px; margin-bottom: 8px; }
        .editorials-summary strong { color: #003366; }

        /* 본문 섹션 스타일 */
        article { border: 1px solid #e9ecef; padding: 20px; border-radius: 4px; margin-bottom: 25px; background-color: #ffffff; }
        .article-body p { margin: 5px 0; }
        blockquote.editorial { background: #fffbe6; border-left: 5px solid #ffc107; margin: 1.5em 0; padding: 1em 1.5em; font-style: italic; color: #594400; }
    </style>
</head>
<body>
    <div class="container">
        <!-- 여기에 변환된 내용이 들어갑니다 -->
    </div>
</body>
</html>

---

위 규칙에 따라 PDF를 HTML로 변환해주세요. HTML 코드만 출력하고, 설명이나 마크다운 블록은 포함하지 마세요.`;

/**
 * 국내 정책 보도 PDF를 HTML로 변환 (Gemini API 사용)
 */
export async function convertDomesticPdfToHtml(
  pdfBuffer: Buffer,
  fileName: string
): Promise<{ html: string; tokens: number }> {
  try {
    console.log('[Gemini Domestic] Starting PDF conversion for:', fileName);

    // PDF를 base64로 인코딩
    const base64Pdf = pdfBuffer.toString('base64');

    console.log('[Gemini Domestic] PDF encoded to base64');

    // Generate HTML using Gemini
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-pro',
    });

    console.log('[Gemini Domestic] Generating HTML...');

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64Pdf,
        },
      },
      { text: DOMESTIC_PROMPT },
    ]);

    const response = result.response;
    let html = response.text();

    console.log('[Gemini Domestic] HTML generated');
    console.log('[Gemini Domestic] Response length:', html.length);
    console.log('[Gemini Domestic] Response preview:', html.substring(0, 200));

    // Clean up markdown code blocks if present
    html = html.replace(/^```html\n?/i, '').replace(/\n?```$/i, '');

    console.log('[Gemini Domestic] Cleaned HTML length:', html.length);
    console.log('[Gemini Domestic] Cleaned HTML start:', html.substring(0, 100));

    // Get token count
    const tokens = response.usageMetadata?.totalTokenCount || 0;

    return { html, tokens };
  } catch (error) {
    console.error('[Gemini Domestic] Conversion error:', error);
    throw error;
  }
}

/**
 * 국내 정책 보도 PDF를 구조화된 JSON으로 변환 (Gemini JSON 모드)
 */
export async function convertDomesticPdfToJSON(
  pdfBuffer: Buffer,
  fileName: string
): Promise<GeminiDomesticJsonConversionResult> {
  try {
    console.log('[Gemini Domestic JSON] PDF 분석 중...', fileName);

    // Gemini JSON 모드용 스키마
    const DOMESTIC_JSON_SCHEMA = {
      type: SchemaType.OBJECT,
      properties: {
        header: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING, description: '문서 제목' },
            meta: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: '헤더 메타 정보 (날짜, 대상 언론사, 부서명)',
            },
          },
          required: ['title', 'meta'],
        },
        summary: {
          type: SchemaType.ARRAY,
          description: '종합 요약 섹션 (2단계 계층)',
          items: {
            type: SchemaType.OBJECT,
            properties: {
              category: { type: SchemaType.STRING, description: '대분류 카테고리명 (○ 기호 제거)' },
              items: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    content: { type: SchemaType.STRING, description: '세부 항목 내용 (-, <> 기호 제거)' },
                  },
                  required: ['content'],
                },
              },
            },
            required: ['category', 'items'],
          },
        },
        editorials: {
          type: SchemaType.ARRAY,
          description: '사설 요약 섹션',
          items: {
            type: SchemaType.OBJECT,
            properties: {
              category: { type: SchemaType.STRING, description: '사설 카테고리 (■ 기호 제거)' },
              content: { type: SchemaType.STRING, description: '사설 내용' },
            },
            required: ['category', 'content'],
          },
        },
        content: {
          type: SchemaType.ARRAY,
          description: '본문 섹션',
          items: {
            type: SchemaType.OBJECT,
            properties: {
              category: { type: SchemaType.STRING },
              articles: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    title: { type: SchemaType.STRING },
                    paragraphs: {
                      type: SchemaType.ARRAY,
                      items: {
                        type: SchemaType.OBJECT,
                        properties: {
                          type: { type: SchemaType.STRING, enum: ['text', 'list', 'quote'] },
                          content: { type: SchemaType.STRING },
                          items: {
                            type: SchemaType.ARRAY,
                            items: { type: SchemaType.STRING },
                            nullable: true,
                          },
                        },
                        required: ['type', 'content'],
                      },
                    },
                  },
                  required: ['title', 'paragraphs'],
                },
              },
            },
            required: ['category', 'articles'],
          },
        },
        metadata: {
          type: SchemaType.OBJECT,
          properties: {
            originalFileName: { type: SchemaType.STRING },
            processedAt: { type: SchemaType.STRING },
            model: { type: SchemaType.STRING },
            totalPages: { type: SchemaType.NUMBER, nullable: true },
            language: { type: SchemaType.STRING, nullable: true },
          },
          required: ['originalFileName', 'processedAt', 'model'],
        },
      },
      required: ['header', 'summary', 'editorials', 'content', 'metadata'],
    };

    // JSON 모드용 프롬프트
    const JSON_PROMPT = `지금부터 당신은 PDF 정책 문서를 구조화된 JSON 데이터로 변환하는 전문 파서입니다.
업로드된 '정책 보도 일일 종합' PDF 파일을 아래 규칙에 따라 JSON 형식으로 변환해 주세요.

## 문서 구조 분석
이 문서는 **[헤더]**, **[종합 요약]**, **[사설 요약]**, **[본문]** 네 부분으로 구성됩니다.

### 1. [헤더] 파싱
- title: 문서 제목 (예: '정책 보도 일일 종합')
- meta: 날짜, 대상 언론사, 부서명을 배열로 저장

### 2. [종합 요약] 파싱 - 2단계 계층 구조
**1단계 (대분류 - ○):**
- "○"로 시작하는 줄을 찾습니다
- category 필드에 **○ 기호를 제거한 카테고리명만** 저장합니다
- 예: "○ 대통령" → "대통령", "○ 통상" → "통상"
- 앞뒤 공백도 제거합니다

**2단계 (세부 항목 - -):**
- "-"로 시작하는 들여쓰기된 줄을 찾습니다
- items 배열에 content 객체로 저장합니다
- **"-" 기호는 제거하고 내용만** 저장합니다
- **"<서경>", "<동아>" 같은 언론사명은 텍스트의 일부**로 그대로 유지합니다
- 예: "- <서경> 내용" → "<서경> 내용", "- 일반 내용" → "일반 내용"

### 3. [사설 요약] 파싱
- "금일 사설" 섹션을 찾습니다
- "■" 문자로 시작하는 줄을 찾습니다
- category: ■ 기호를 제거하고 카테고리명만 저장 (예: "통상", "국회")
- content: 해당 사설의 내용

### 4. [본문] 파싱
- 카테고리 제목을 찾아 category 필드에 저장
- 각 기사는 articles 배열에 추가:
  - title: 기사 소제목 (○ 기호 제거)
  - paragraphs: 단락 배열
    - type: 'text' | 'list' | 'quote'
    - content: 단락 내용
    - items: type이 'list'일 때 리스트 항목들

### 5. [메타데이터]
- originalFileName: "${fileName}"
- processedAt: 현재 시간 (ISO 8601 형식)
- model: "gemini-2.5-pro"
- language: "ko"

## 중요 규칙
1. **원본 텍스트 유지**:
   - 제거: ○, ■, - 기호
   - 유지: <서경>, <동아> 같은 언론사명은 본문 내용의 일부로 그대로 보존
2. **누락 금지**: 문서의 모든 내용을 빠짐없이 포함
3. **정확한 계층 구조**: 종합 요약 2단계, 본문은 카테고리 → 기사 → 단락 구조 유지

JSON 스키마에 맞춰 정확하게 변환해 주세요.`;

    // PDF를 base64로 인코딩
    const base64Pdf = pdfBuffer.toString('base64');

    // Gemini 2.5 Pro 모델 사용 (JSON 모드)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-pro',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: DOMESTIC_JSON_SCHEMA,
      },
    });

    console.log('[Gemini Domestic JSON] HTML 생성 중...');

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64Pdf,
        },
      },
      JSON_PROMPT,
    ]);

    const response = result.response;
    const jsonText = response.text();

    console.log('[Gemini Domestic JSON] 응답 길이:', jsonText.length);

    // JSON 파싱
    let parsedData: any;
    try {
      parsedData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('[Gemini Domestic JSON] JSON 파싱 실패:', parseError);
      throw new Error('Gemini가 유효하지 않은 JSON을 반환했습니다.');
    }

    // Zod 스키마로 검증
    const validationResult = safeParseDomesticParsedDocument(parsedData);

    if (!validationResult.success) {
      console.error('[Gemini Domestic JSON] 스키마 검증 실패:', validationResult.error);
      throw new Error(
        `Gemini 응답이 스키마와 일치하지 않습니다: ${validationResult.error.message}`
      );
    }

    console.log('[Gemini Domestic JSON] JSON 변환 및 검증 완료');
    console.log('[Gemini Domestic JSON] 종합 요약 카테고리 수:', validationResult.data.summary.length);
    console.log('[Gemini Domestic JSON] 사설 요약 수:', validationResult.data.editorials.length);
    console.log('[Gemini Domestic JSON] 본문 섹션 수:', validationResult.data.content.length);

    return {
      data: validationResult.data,
      method: 'gemini-domestic-json',
      tokens: response.usageMetadata?.totalTokenCount || 0,
    };
  } catch (error) {
    console.error('[Gemini Domestic JSON] 변환 오류:', error);
    throw new Error(
      `Gemini 국내 PDF JSON 변환 중 오류가 발생했습니다: ${
        error instanceof Error ? error.message : '알 수 없는 오류'
      }`
    );
  }
}
