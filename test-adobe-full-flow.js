/**
 * Adobe PDF Services 전체 플로우 테스트
 * - 인증
 * - PDF 업로드
 * - Extract Job 생성
 * - 결과 다운로드
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const ADOBE_CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const ADOBE_CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;

async function getAccessToken() {
  console.log('1️⃣  Access Token 발급 중...');

  const tokenUrl = 'https://ims-na1.adobelogin.com/ims/token/v3';

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: ADOBE_CLIENT_ID,
    client_secret: ADOBE_CLIENT_SECRET,
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
    throw new Error(`인증 실패: ${response.status}\n${errorText}`);
  }

  const data = await response.json();
  console.log(`✅ Token 발급 완료 (유효기간: ${data.expires_in}초)`);
  return data.access_token;
}

async function uploadPDF(pdfBuffer, accessToken) {
  console.log('\n2️⃣  PDF 업로드 URI 요청 중...');

  const uploadUriResponse = await fetch(
    'https://pdf-services.adobe.io/assets',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-api-key': ADOBE_CLIENT_ID,
      },
      body: JSON.stringify({
        mediaType: 'application/pdf',
      }),
    }
  );

  if (!uploadUriResponse.ok) {
    const errorText = await uploadUriResponse.text();
    throw new Error(`업로드 URI 요청 실패: ${uploadUriResponse.status}\n${errorText}`);
  }

  const uploadData = await uploadUriResponse.json();
  console.log(`✅ Upload URI 발급: ${uploadData.assetID}`);

  console.log('\n3️⃣  PDF 파일 업로드 중...');
  const uploadResponse = await fetch(uploadData.uploadUri, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/pdf',
    },
    body: new Uint8Array(pdfBuffer),
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(`PDF 업로드 실패: ${uploadResponse.status}\n${errorText}`);
  }

  console.log(`✅ PDF 업로드 완료`);
  return uploadData.assetID;
}

async function createExtractJob(assetID, accessToken) {
  console.log('\n4️⃣  Extract Job 생성 중...');

  const response = await fetch(
    'https://pdf-services.adobe.io/operation/extractpdf',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-api-key': ADOBE_CLIENT_ID,
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
    throw new Error(`Extract Job 생성 실패: ${response.status}\n${errorText}`);
  }

  const location = response.headers.get('location');
  if (!location) {
    throw new Error('Job ID를 찾을 수 없습니다.');
  }

  const jobID = location.split('/').pop();
  console.log(`✅ Job 생성 완료: ${jobID}`);
  return jobID;
}

async function waitForJobCompletion(jobID, accessToken) {
  console.log('\n5️⃣  Job 완료 대기 중...');

  for (let i = 0; i < 30; i++) {
    const response = await fetch(
      `https://pdf-services.adobe.io/operation/extractpdf/${jobID}/status`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'x-api-key': ADOBE_CLIENT_ID,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Job 상태 확인 실패: ${response.status}\n${errorText}`);
    }

    const jobData = await response.json();
    console.log(`   상태: ${jobData.status} (${i + 1}/30)`);

    if (jobData.status === 'done') {
      if (!jobData.asset?.downloadUri) {
        throw new Error('다운로드 URI가 없습니다.');
      }
      console.log(`✅ Job 완료!`);
      return jobData.asset.downloadUri;
    }

    if (jobData.status === 'failed') {
      throw new Error('Job 실패');
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error('Job 타임아웃');
}

async function downloadResult(downloadUri) {
  console.log('\n6️⃣  결과 다운로드 중...');

  const response = await fetch(downloadUri);

  if (!response.ok) {
    throw new Error(`결과 다운로드 실패: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  console.log(`✅ 다운로드 완료 (${buffer.byteLength} bytes)`);

  return Buffer.from(buffer);
}

async function extractText(zipBuffer) {
  console.log('\n7️⃣  텍스트 추출 중...');

  const AdmZip = require('adm-zip');
  const zip = new AdmZip(zipBuffer);
  const zipEntries = zip.getEntries();

  const jsonEntry = zipEntries.find(entry => entry.entryName === 'structuredData.json');

  if (!jsonEntry) {
    throw new Error('structuredData.json을 찾을 수 없습니다.');
  }

  const jsonContent = jsonEntry.getData().toString('utf8');
  const structuredData = JSON.parse(jsonContent);

  const textParts = [];
  if (structuredData.elements && Array.isArray(structuredData.elements)) {
    for (const element of structuredData.elements) {
      if (element.Text) {
        textParts.push(element.Text);
      }
    }
  }

  const text = textParts.join('\n\n');
  console.log(`✅ 텍스트 추출 완료 (${text.length} 글자)`);
  console.log('\n📄 추출된 텍스트 (처음 200자):');
  console.log(text.substring(0, 200) + '...');

  return text;
}

async function testFullFlow() {
  console.log('🚀 Adobe PDF Services 전체 플로우 테스트\n');
  console.log('=' .repeat(50));

  try {
    // 테스트 PDF 파일 경로 - 실제 PDF 파일로 교체하세요
    const testPdfPath = process.argv[2] || './sample.pdf';

    if (!fs.existsSync(testPdfPath)) {
      console.error(`\n❌ PDF 파일을 찾을 수 없습니다: ${testPdfPath}`);
      console.log('\n사용법: node test-adobe-full-flow.js <pdf파일경로>');
      return;
    }

    const pdfBuffer = fs.readFileSync(testPdfPath);
    console.log(`\n📁 테스트 파일: ${testPdfPath} (${pdfBuffer.length} bytes)\n`);
    console.log('=' .repeat(50));

    const accessToken = await getAccessToken();
    const assetID = await uploadPDF(pdfBuffer, accessToken);
    const jobID = await createExtractJob(assetID, accessToken);
    const downloadUri = await waitForJobCompletion(jobID, accessToken);
    const zipBuffer = await downloadResult(downloadUri);
    const text = await extractText(zipBuffer);

    console.log('\n' + '='.repeat(50));
    console.log('🎉 모든 단계 성공!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ 오류 발생:');
    console.error(error.message);
    process.exit(1);
  }
}

testFullFlow();
