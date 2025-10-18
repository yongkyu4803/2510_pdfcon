/**
 * Adobe PDF Services REST API 인증 테스트
 */
require('dotenv').config({ path: '.env.local' });

const ADOBE_CLIENT_ID = process.env.ADOBE_CLIENT_ID;
const ADOBE_CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET;

async function testAdobeAuth() {
  console.log('🔐 Adobe PDF Services API 인증 테스트\n');

  if (!ADOBE_CLIENT_ID || !ADOBE_CLIENT_SECRET) {
    console.error('❌ Adobe 자격증명이 설정되지 않았습니다.');
    console.log('ADOBE_CLIENT_ID:', ADOBE_CLIENT_ID ? '✓ 설정됨' : '✗ 없음');
    console.log('ADOBE_CLIENT_SECRET:', ADOBE_CLIENT_SECRET ? '✓ 설정됨' : '✗ 없음');
    return;
  }

  console.log('✅ 환경변수 확인 완료');
  console.log('Client ID:', ADOBE_CLIENT_ID.substring(0, 10) + '...');
  console.log('');

  // 여러 엔드포인트 시도
  const endpoints = [
    {
      name: 'IMS v3',
      url: 'https://ims-na1.adobelogin.com/ims/token/v3',
      scope: 'openid,AdobeID,read_organizations'
    },
    {
      name: 'IMS v2',
      url: 'https://ims-na1.adobelogin.com/ims/token/v2',
      scope: 'openid,AdobeID,read_organizations'
    },
    {
      name: 'IMS v1',
      url: 'https://ims-na1.adobelogin.com/ims/token/v1',
      scope: 'openid,AdobeID,read_organizations'
    },
    {
      name: 'PDF Services Token',
      url: 'https://pdf-services.adobe.io/token',
      scope: null
    }
  ];

  for (const endpoint of endpoints) {
    console.log(`📡 시도 중: ${endpoint.name}`);
    console.log(`   URL: ${endpoint.url}`);

    try {
      const params = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: ADOBE_CLIENT_ID,
        client_secret: ADOBE_CLIENT_SECRET,
      });

      if (endpoint.scope) {
        params.append('scope', endpoint.scope);
      }

      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const responseText = await response.text();

      if (response.ok) {
        const data = JSON.parse(responseText);
        console.log(`✅ 성공! Access Token 발급됨`);
        console.log(`   Token: ${data.access_token.substring(0, 20)}...`);
        console.log(`   Type: ${data.token_type}`);
        console.log(`   Expires in: ${data.expires_in}초`);
        console.log('');
        return data.access_token;
      } else {
        console.log(`❌ 실패: ${response.status} ${response.statusText}`);
        console.log(`   응답: ${responseText.substring(0, 200)}`);
        console.log('');
      }
    } catch (error) {
      console.log(`❌ 오류: ${error.message}`);
      console.log('');
    }
  }

  console.log('⚠️  모든 엔드포인트 시도 실패');
}

testAdobeAuth().catch(console.error);
