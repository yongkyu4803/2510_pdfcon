import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ConversionResult {
  html: string;
  method: 'claude-direct';
  tokens?: number;
}

/**
 * 1단계: PDF 텍스트를 구조화된 데이터로 분석
 */
async function analyzeDocumentStructure(pdfText: string): Promise<string> {
  const analysisPrompt = `외신 브리핑 문서를 분석하여 구조화된 정보를 추출해주세요.

다음 형식으로 JSON을 생성하세요:
{
  "title": "문서 제목",
  "date": "발행일",
  "sections": [
    {
      "category": "카테고리명 (정치/경제/사회/문화/국제 등)",
      "title": "섹션 제목",
      "content": "섹션 내용",
      "importance": "high|medium|low"
    }
  ],
  "summary": "전체 요약 (선택사항)"
}

**원본 텍스트:**
${pdfText}

**중요 규칙:**
1. 원본 텍스트의 모든 내용을 한 글자도 바꾸지 말고 그대로 보존
2. content 필드에는 원문을 100% 그대로 복사
3. 요약하거나 의역하지 말 것 - 있는 그대로만 추출
4. 제목, 카테고리만 구조화하고 본문 내용은 절대 변경 금지
5. JSON만 출력하고 다른 설명은 추가하지 마세요

**절대 금지:**
- content 필드 내용 요약, 축약, 의역
- 원문의 단어, 문장, 표현 변경
- 내용 추가, 삭제`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 8192, // 긴 문서 지원을 위해 증가
    messages: [{ role: 'user', content: analysisPrompt }],
  });

  return message.content[0].type === 'text' ? message.content[0].text : '{}';
}

/**
 * 2단계: 구조화된 데이터를 고품질 HTML로 변환
 */
export async function convertTextToHTML(pdfText: string): Promise<ConversionResult> {
  try {
    // 1단계: 문서 구조 분석
    const structuredData = await analyzeDocumentStructure(pdfText);

    // 2단계: HTML 생성
    const htmlPrompt = `다음 구조화된 브리핑 데이터를 전문적이고 읽기 쉬운 HTML 문서로 변환해주세요.

**구조화된 데이터:**
${structuredData}

**HTML 생성 요구사항:**

1. **문서 구조:**
   - 완전한 HTML5 문서 (<!DOCTYPE html>)
   - 반응형 viewport 메타태그
   - UTF-8 인코딩
   - 의미있는 title 태그

2. **스타일링 (내부 CSS):**
   - 모바일 우선 반응형 디자인
   - 최대 너비 800px, 중앙 정렬
   - 깔끔한 타이포그래피 (line-height 1.6-1.8)
   - 섹션 간 명확한 구분 (여백, 구분선)
   - 인쇄 친화적 스타일
   - 다크모드 지원 (@media prefers-color-scheme)

3. **컨텐츠 구성:**
   - 상단에 제목과 날짜
   - 카테고리별로 섹션 그룹화
   - 각 섹션에 뱃지/태그로 카테고리 표시
   - 중요도에 따른 시각적 강조
   - 가독성 좋은 단락 구분
   - **중요: content 필드의 원문을 한 글자도 바꾸지 말고 그대로 표시**

4. **색상 테마:**
   - 전문적이고 차분한 색상 (블루/그레이 계열)
   - 카테고리별 색상 구분 (미묘한 차이)
   - 충분한 대비율 (접근성 고려)

5. **추가 기능:**
   - 목차 (Table of Contents) - 섹션이 5개 이상일 경우
   - 인쇄 버튼 CSS
   - 부드러운 스크롤

**절대 규칙 - 원문 보존:**
1. JSON의 "content" 필드 내용을 한 글자도 바꾸지 말고 그대로 HTML에 삽입
2. 요약, 축약, 의역 절대 금지
3. 원문의 모든 문장, 단어, 표현을 정확히 보존
4. 스타일과 레이아웃만 추가하고 내용은 100% 원본 유지

**출력:**
완성된 HTML 코드만 출력하세요. 설명이나 주석은 제외하고 즉시 사용 가능한 HTML만 반환하세요.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8192, // HTML 생성을 위해 충분한 토큰 할당
      messages: [{ role: 'user', content: htmlPrompt }],
    });

    const htmlContent = message.content[0].type === 'text' ? message.content[0].text : '';

    return {
      html: htmlContent,
      method: 'claude-direct',
      tokens: message.usage.input_tokens + message.usage.output_tokens,
    };
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error('HTML 변환 중 오류가 발생했습니다.');
  }
}

/**
 * Claude API로 PDF 직접 처리 (Vision API 사용)
 * PDF를 base64로 인코딩하여 Claude에게 전달
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    const base64Pdf = pdfBuffer.toString('base64');

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8192, // PDF 텍스트 추출을 위해 충분한 토큰 할당
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64Pdf,
              },
            },
            {
              type: 'text',
              text: `PDF 문서의 모든 텍스트를 원문 그대로 추출해주세요.

**중요 규칙:**
1. 모든 텍스트를 한 글자도 빠짐없이 정확히 추출
2. 원문의 단어, 문장, 표현을 절대 변경하지 말 것
3. 요약하거나 의역하지 말고 있는 그대로 추출
4. 제목, 날짜, 본문, 각주 등 모든 내용 포함
5. 단락 구분, 줄바꿈 등 원본 구조 유지

**절대 금지:**
- 요약, 축약, 의역
- 내용 추가, 삭제, 변경
- 재구성, 재작성

원문을 100% 그대로 추출해주세요.`,
            },
          ],
        },
      ],
    });

    const extractedText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('PDF에서 텍스트를 추출할 수 없습니다.');
    }

    return extractedText.trim();
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('PDF 텍스트 추출 중 오류가 발생했습니다.');
  }
}

/**
 * 전체 변환 프로세스 (하이브리드: Adobe + Claude)
 */
export async function convertPDFToHTML(
  pdfBuffer: Buffer,
  fileName: string,
  onProgress?: (progress: number, status: string) => void
): Promise<ConversionResult> {
  try {
    // 1. 텍스트 추출 - Adobe 우선, 실패 시 Claude Vision (0% → 40%)
    onProgress?.(5, '파일 검증 중...');
    onProgress?.(10, 'PDF 텍스트 추출 중...');

    let pdfText = '';
    let extractionMethod = 'claude-vision';

    // Adobe REST API 시도
    try {
      const { extractPDFTextHybrid } = await import('./adobe-rest');
      onProgress?.(15, 'Adobe/Claude로 텍스트 추출 중...');

      const result = await extractPDFTextHybrid(pdfBuffer);
      pdfText = result.text;
      extractionMethod = result.method;

      onProgress?.(35, `${extractionMethod}로 추출 완료`);
    } catch (adobeError) {
      // Adobe 모듈이 없거나 실패한 경우 Claude Vision 직접 사용
      console.log('Adobe 사용 불가, Claude Vision 직접 사용:', adobeError);
      onProgress?.(15, 'Claude Vision으로 텍스트 추출 중...');
      pdfText = await extractTextFromPDF(pdfBuffer);
      extractionMethod = 'claude-vision';
      onProgress?.(35, 'Claude Vision 추출 완료');
    }

    if (!pdfText || pdfText.trim().length === 0) {
      throw new Error('PDF에서 텍스트를 추출할 수 없습니다.');
    }

    onProgress?.(40, '텍스트 추출 완료');

    // 2. HTML 변환 (40% → 90%)
    onProgress?.(45, 'HTML 변환 중...');

    const result = await convertTextToHTML(pdfText);

    onProgress?.(90, 'HTML 변환 완료');

    // 3. 최종 검증 (90% → 100%)
    onProgress?.(95, '최종 검증 중...');

    if (!result.html || result.html.length === 0) {
      throw new Error('HTML 생성 실패');
    }

    onProgress?.(100, '변환 완료!');

    // 추출 방법 정보와 함께 반환
    return {
      ...result,
      method: extractionMethod as 'claude-direct',
    };
  } catch (error) {
    console.error('Conversion error:', error);
    throw error;
  }
}
