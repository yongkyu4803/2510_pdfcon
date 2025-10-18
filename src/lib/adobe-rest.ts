/**
 * Adobe PDF Services REST API 클라이언트
 *
 * SDK 대신 REST API를 직접 호출하여 Next.js 15 호환성 문제 해결
 *
 * 참고: https://developer.adobe.com/document-services/docs/apis/pdf-extract/
 */

interface AdobeCredentials {
  clientId: string;
  clientSecret: string;
}

interface AdobeAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface AdobeAssetUploadResponse {
  assetID: string;
  uploadUri: string;
}

interface AdobeJobResponse {
  jobID: string;
  status: 'in_progress' | 'done' | 'failed';
  asset?: {
    downloadUri: string;
    assetID: string;
  };
}

interface AdobeStructuredData {
  elements?: Array<{
    Text?: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

interface AdobeExtractResult {
  text: string;
  structuredData: AdobeStructuredData | null;
  method: 'adobe-extract';
}

/**
 * Adobe 환경 변수 확인
 */
export function isAdobeConfigured(): boolean {
  return !!(
    process.env.ADOBE_CLIENT_ID &&
    process.env.ADOBE_CLIENT_SECRET
  );
}

/**
 * 1단계: Access Token 발급
 * Adobe IMS (Identity Management Services) OAuth 2.0 Server-to-Server 인증
 */
async function getAccessToken(credentials: AdobeCredentials): Promise<string> {
  // Adobe IMS OAuth 엔드포인트
  const tokenUrl = 'https://ims-na1.adobelogin.com/ims/token/v3';

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
    // PDF Services API 스코프
    scope: 'openid,AdobeID,read_organizations',
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Adobe 인증 오류 상세:', errorText);
    throw new Error(`Adobe 인증 실패: ${response.status} ${response.statusText}\n${errorText}`);
  }

  const data: AdobeAccessToken = await response.json();
  return data.access_token;
}

/**
 * 2단계: PDF 파일 업로드
 */
async function uploadPDF(
  pdfBuffer: Buffer,
  accessToken: string
): Promise<AdobeAssetUploadResponse> {
  // 2-1: Upload URI 요청
  const uploadUriResponse = await fetch(
    'https://pdf-services.adobe.io/assets',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-api-key': process.env.ADOBE_CLIENT_ID!,
      },
      body: JSON.stringify({
        mediaType: 'application/pdf',
      }),
    }
  );

  if (!uploadUriResponse.ok) {
    const errorText = await uploadUriResponse.text();
    console.error('Adobe 업로드 URI 요청 오류:', errorText);
    throw new Error(`Adobe 업로드 URI 요청 실패: ${uploadUriResponse.status}\n${errorText}`);
  }

  const uploadData: AdobeAssetUploadResponse = await uploadUriResponse.json();

  // 2-2: 실제 PDF 업로드 (Buffer를 Uint8Array로 변환)
  const uploadResponse = await fetch(uploadData.uploadUri, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/pdf',
    },
    body: new Uint8Array(pdfBuffer),
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error('Adobe PDF 업로드 오류:', errorText);
    throw new Error(`Adobe PDF 업로드 실패: ${uploadResponse.status}\n${errorText}`);
  }

  return uploadData;
}

/**
 * 3단계: PDF Extract Job 생성
 */
async function createExtractJob(
  assetID: string,
  accessToken: string
): Promise<string> {
  const response = await fetch(
    'https://pdf-services.adobe.io/operation/extractpdf',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-api-key': process.env.ADOBE_CLIENT_ID!,
      },
      body: JSON.stringify({
        assetID: assetID,
        elementsToExtract: ['text'],
        renditionsToExtract: [],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Adobe Extract Job 생성 오류:', errorText);
    throw new Error(`Adobe Extract Job 생성 실패: ${response.status}\n${errorText}`);
  }

  // Location 헤더에서 job ID 추출
  const location = response.headers.get('location');
  console.log('[Adobe] Location 헤더:', location);

  if (!location) {
    throw new Error('Adobe Job ID를 찾을 수 없습니다 (Location 헤더 없음).');
  }

  // Location 형식: https://pdf-services-ue1.adobe.io/operation/extractpdf/{jobId}/status
  // 또는: /operation/extractpdf/{jobId}/status
  const parts = location.split('/');
  const statusIndex = parts.indexOf('status');

  if (statusIndex > 0) {
    const jobID = parts[statusIndex - 1];
    console.log('[Adobe] Job ID 추출 성공:', jobID);
    return jobID;
  }

  throw new Error(`Adobe Job ID 파싱 실패. Location: ${location}`);
}

/**
 * 4단계: Job 상태 확인 및 결과 대기
 */
async function waitForJobCompletion(
  jobID: string,
  accessToken: string,
  maxRetries = 30,
  retryInterval = 2000
): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(
      `https://pdf-services.adobe.io/operation/extractpdf/${jobID}/status`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'x-api-key': process.env.ADOBE_CLIENT_ID!,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Adobe Job 상태 확인 오류:', errorText);
      throw new Error(`Adobe Job 상태 확인 실패: ${response.status}\n${errorText}`);
    }

    const jobData: AdobeJobResponse = await response.json();
    console.log(`[Adobe] Job 상태 응답:`, JSON.stringify(jobData, null, 2));

    if (jobData.status === 'done') {
      // Adobe Extract API는 resource.downloadUri에 ZIP 파일을 제공
      const downloadUri =
        (jobData as any).resource?.downloadUri ||
        (jobData as any).content?.downloadUri ||
        jobData.asset?.downloadUri;

      if (!downloadUri) {
        console.error('[Adobe] 전체 응답:', JSON.stringify(jobData, null, 2));
        throw new Error('Adobe 결과 다운로드 URI가 없습니다.');
      }

      console.log(`[Adobe] 다운로드 URI 발견:`, downloadUri);
      return downloadUri;
    }

    if (jobData.status === 'failed') {
      console.error('[Adobe] Job 실패:', JSON.stringify(jobData, null, 2));
      throw new Error('Adobe PDF Extract Job 실패');
    }

    // in_progress - 대기
    console.log(`Adobe Job ${jobID} 진행 중... (${i + 1}/${maxRetries})`);
    await new Promise(resolve => setTimeout(resolve, retryInterval));
  }

  throw new Error('Adobe Job 타임아웃');
}

/**
 * 5단계: 결과 다운로드 및 텍스트 추출
 */
async function downloadAndExtractText(downloadUri: string): Promise<string> {
  // ZIP 파일 다운로드
  const response = await fetch(downloadUri);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Adobe 결과 다운로드 오류:', errorText);
    throw new Error(`Adobe 결과 다운로드 실패: ${response.status}\n${errorText}`);
  }

  const zipBuffer = await response.arrayBuffer();

  // ZIP 압축 해제 및 JSON 파싱
  const AdmZip = (await import('adm-zip')).default;
  const zip = new AdmZip(Buffer.from(zipBuffer));
  const zipEntries = zip.getEntries();

  // structuredData.json 찾기
  const jsonEntry = zipEntries.find((entry) =>
    entry.entryName === 'structuredData.json'
  );

  if (!jsonEntry) {
    throw new Error('structuredData.json을 찾을 수 없습니다.');
  }

  const jsonContent = jsonEntry.getData().toString('utf8');
  const structuredData = JSON.parse(jsonContent);

  // 텍스트 추출
  const text = extractTextFromStructuredData(structuredData);

  return text;
}

/**
 * 구조화된 데이터에서 텍스트 추출
 */
function extractTextFromStructuredData(data: AdobeStructuredData): string {
  const textParts: string[] = [];

  if (data.elements && Array.isArray(data.elements)) {
    for (const element of data.elements) {
      if (element.Text) {
        textParts.push(element.Text);
      }
    }
  }

  return textParts.join('\n\n');
}

/**
 * 메인 함수: Adobe PDF Extract API로 PDF에서 텍스트 추출
 */
export async function extractPDFWithAdobe(
  pdfBuffer: Buffer
): Promise<AdobeExtractResult> {
  if (!isAdobeConfigured()) {
    throw new Error('Adobe API 자격 증명이 설정되지 않았습니다.');
  }

  const credentials: AdobeCredentials = {
    clientId: process.env.ADOBE_CLIENT_ID!,
    clientSecret: process.env.ADOBE_CLIENT_SECRET!,
  };

  try {
    console.log('[Adobe] 1/5 - Access Token 발급 중...');
    const accessToken = await getAccessToken(credentials);

    console.log('[Adobe] 2/5 - PDF 업로드 중...');
    const uploadData = await uploadPDF(pdfBuffer, accessToken);

    console.log('[Adobe] 3/5 - Extract Job 생성 중...');
    const jobID = await createExtractJob(uploadData.assetID, accessToken);

    console.log('[Adobe] 4/5 - Job 완료 대기 중...');
    const downloadUri = await waitForJobCompletion(jobID, accessToken);

    console.log('[Adobe] 5/5 - 결과 다운로드 및 텍스트 추출 중...');
    const text = await downloadAndExtractText(downloadUri);

    return {
      text,
      structuredData: null, // 필요시 전체 데이터 저장
      method: 'adobe-extract',
    };
  } catch (error) {
    console.error('Adobe PDF Extract 오류:', error);
    throw error;
  }
}

/**
 * 텍스트에서 요지 섹션 추출
 */
function extractSummarySection(text: string): { summary: string; mainText: string } | null {
  // 다양한 요지 패턴 매칭
  const patterns = [
    // [요지] 또는 【요지】 형태
    /\[요지\]\s*\n([\s\S]*?)(?=\n\s*(?:□|■|●|○|\[|\【|$))/i,
    /【요지】\s*\n([\s\S]*?)(?=\n\s*(?:□|■|●|○|\[|\【|$))/i,

    // ◇ 요지 형태
    /◇\s*요지\s*\n([\s\S]*?)(?=\n\s*(?:□|■|●|○|◇|\[|\【|$))/i,

    // 요지: 형태
    /요지\s*[:：]\s*\n([\s\S]*?)(?=\n\s*(?:□|■|●|○|\[|\【|$))/i,

    // 단순히 "요지" 로 시작하는 줄
    /^요지\s*\n([\s\S]*?)(?=\n\s*(?:□|■|●|○|\[|\【|$))/im,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const summary = match[1].trim();

      // 요지가 너무 짧거나 길면 무시 (최소 10자, 최대 5000자)
      if (summary.length < 10 || summary.length > 5000) {
        continue;
      }

      // 요지 부분을 제외한 나머지 텍스트
      const mainText = text.replace(match[0], '').trim();

      return { summary, mainText };
    }
  }

  return null;
}

/**
 * 계층 구조를 가진 섹션 타입
 */
interface Section {
  title: string;
  items: Array<{
    text: string;
    subItems: string[];
  }>;
}

/**
 * 텍스트를 계층적 섹션으로 파싱
 * 구조: □ 대제목 → ○ 항목 → - 하위항목
 */
function parseTextIntoSections(text: string): Section[] {
  const sections: Section[] = [];
  const lines = text.split('\n');

  let currentSection: Section | null = null;
  let currentItem: { text: string; subItems: string[] } | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // □ 대제목 (섹션)
    const sectionMatch = trimmedLine.match(/^□\s*(.+)$/);
    if (sectionMatch) {
      // 이전 섹션 저장
      if (currentSection && currentItem) {
        currentSection.items.push(currentItem);
        currentItem = null;
      }
      if (currentSection) {
        sections.push(currentSection);
      }

      // 새 섹션 시작
      currentSection = {
        title: sectionMatch[1].trim(),
        items: [],
      };
      continue;
    }

    // ○ 항목
    const itemMatch = trimmedLine.match(/^[○●]\s*(.+)$/);
    if (itemMatch) {
      // 이전 항목 저장
      if (currentSection && currentItem) {
        currentSection.items.push(currentItem);
      }

      // 새 항목 시작
      currentItem = {
        text: itemMatch[1].trim(),
        subItems: [],
      };
      continue;
    }

    // - 하위 항목
    const subItemMatch = trimmedLine.match(/^[-–—]\s*(.+)$/);
    if (subItemMatch && currentItem) {
      currentItem.subItems.push(subItemMatch[1].trim());
      continue;
    }

    // 일반 텍스트 (현재 항목에 추가)
    if (currentItem) {
      currentItem.text += ' ' + trimmedLine;
    }
  }

  // 마지막 항목 및 섹션 저장
  if (currentSection && currentItem) {
    currentSection.items.push(currentItem);
  }
  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}

/**
 * Adobe Extract 결과를 HTML로 변환
 */
function convertExtractedTextToHTML(
  text: string,
  fileName: string
): string {
  // 요지 섹션 추출
  const extracted = extractSummarySection(text);
  const summaryHTML = extracted?.summary || '';
  const mainText = extracted?.mainText || text;

  // 섹션 파싱
  const sections = parseTextIntoSections(mainText);
  // HTML 컨텐츠 생성
  let contentHTML = '';

  // 요지 섹션이 있으면 강조 표시
  if (summaryHTML) {
    contentHTML += `
      <div class="summary-section">
        <h2 class="summary-title">📌 요지</h2>
        <div class="summary-content">${summaryHTML.split('\n').filter(line => line.trim()).map(line => {
          // 불릿 포인트 처리
          if (line.match(/^[○●■□◇◆▪▫•]\s*/)) {
            return `<li>${line.replace(/^[○●■□◇◆▪▫•]\s*/, '').trim()}</li>`;
          }
          return `<p>${line.trim()}</p>`;
        }).join('')}</div>
      </div>
    `;
  }

  // 섹션별 컨텐츠 (계층 구조)
  if (sections.length > 0) {
    sections.forEach(section => {
      contentHTML += `
        <div class="content-section">
          <h3 class="section-title">□ ${section.title}</h3>
          <div class="section-content">
      `;

      // 각 항목 출력
      section.items.forEach(item => {
        contentHTML += `
          <div class="item">
            <div class="item-text">○ ${item.text}</div>
        `;

        // 하위 항목이 있으면 출력
        if (item.subItems.length > 0) {
          contentHTML += '<ul class="sub-items">';
          item.subItems.forEach(subItem => {
            contentHTML += `<li>${subItem}</li>`;
          });
          contentHTML += '</ul>';
        }

        contentHTML += '</div>';
      });

      contentHTML += `
          </div>
        </div>
      `;
    });
  } else {
    // 섹션이 없으면 원본 텍스트 표시
    contentHTML += `<div class="content">${mainText.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('')}</div>`;
  }

  // 기본 HTML 템플릿
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Malgun Gothic", sans-serif;
      line-height: 1.7;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .header {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }

    h1 {
      font-size: 28px;
      color: #1e293b;
      margin-bottom: 10px;
      font-weight: 700;
    }

    .metadata {
      color: #64748b;
      font-size: 14px;
    }

    /* 요지 섹션 스타일 */
    .summary-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 30px;
      box-shadow: 0 4px 6px rgba(102, 126, 234, 0.2);
    }

    .summary-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .summary-content {
      font-size: 15px;
      line-height: 1.8;
    }

    .summary-content p {
      margin-bottom: 12px;
    }

    .summary-content li {
      margin-left: 20px;
      margin-bottom: 8px;
      list-style: disc;
    }

    /* 일반 섹션 스타일 */
    .content-section {
      margin-bottom: 32px;
      padding: 20px;
      background: #f8fafc;
      border-left: 4px solid #3b82f6;
      border-radius: 4px;
    }

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 16px;
    }

    .section-content {
      font-size: 15px;
      line-height: 1.8;
    }

    .section-content p {
      margin-bottom: 12px;
      color: #475569;
    }

    /* 항목 스타일 */
    .item {
      margin-bottom: 16px;
    }

    .item-text {
      color: #1e293b;
      font-weight: 500;
      margin-bottom: 8px;
    }

    /* 하위 항목 스타일 */
    .sub-items {
      margin-left: 20px;
      margin-top: 8px;
      list-style: none;
      padding-left: 0;
    }

    .sub-items li {
      color: #64748b;
      padding-left: 20px;
      position: relative;
      margin-bottom: 6px;
      line-height: 1.6;
    }

    .sub-items li::before {
      content: "−";
      position: absolute;
      left: 0;
      color: #94a3b8;
      font-weight: bold;
    }

    .content {
      white-space: pre-wrap;
      word-wrap: break-word;
      font-size: 16px;
      line-height: 1.8;
    }

    .content p {
      margin-bottom: 1em;
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }

      .container {
        box-shadow: none;
        padding: 20px;
      }

      .summary-section {
        background: #667eea;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }

    @media (max-width: 768px) {
      .container {
        padding: 20px;
      }

      h1 {
        font-size: 24px;
      }

      .summary-title {
        font-size: 18px;
      }

      .section-title {
        font-size: 16px;
      }

      .content {
        font-size: 15px;
      }
    }

    @media (prefers-color-scheme: dark) {
      body {
        background: #1e293b;
      }

      .container {
        background: #334155;
        color: #e2e8f0;
      }

      h1 {
        color: #f1f5f9;
      }

      .metadata {
        color: #94a3b8;
      }

      .content-section {
        background: #1e293b;
        border-left-color: #60a5fa;
      }

      .section-title {
        color: #f1f5f9;
      }

      .section-content p {
        color: #cbd5e1;
      }

      .item-text {
        color: #f1f5f9;
      }

      .sub-items li {
        color: #94a3b8;
      }

      .sub-items li::before {
        color: #64748b;
      }

      .content {
        color: #e2e8f0;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${fileName.replace('.pdf', '')}</h1>
      <div class="metadata">
        <span>추출 방법: Adobe PDF Extract API</span> ·
        <span>추출 날짜: ${new Date().toLocaleDateString('ko-KR')}</span>
      </div>
    </div>
    ${contentHTML}
  </div>
</body>
</html>`;

  return html;
}

/**
 * Adobe PDF Extract API로 PDF를 HTML로 변환 (AI 미사용)
 */
export async function convertPDFToHTMLWithAdobe(
  pdfBuffer: Buffer,
  fileName: string
): Promise<{ html: string; method: string; tokens?: number }> {
  if (!isAdobeConfigured()) {
    throw new Error('Adobe API 자격 증명이 설정되지 않았습니다.');
  }

  try {
    // 1. Adobe로 텍스트 추출
    const extractResult = await extractPDFWithAdobe(pdfBuffer);

    // 2. HTML 변환
    const html = convertExtractedTextToHTML(
      extractResult.text,
      fileName
    );

    return {
      html,
      method: 'adobe-extract',
      tokens: 0, // Adobe API는 토큰을 사용하지 않음
    };
  } catch (error) {
    console.error('Adobe PDF to HTML conversion error:', error);
    throw error;
  }
}
