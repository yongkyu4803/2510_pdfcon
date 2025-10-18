// Adobe API 인증 테스트 스크립트

async function testAdobeAPI() {
  const clientId = process.env.ADOBE_CLIENT_ID;
  const clientSecret = process.env.ADOBE_CLIENT_SECRET;

  console.log('\n🔑 Adobe 자격 증명 확인...');
  console.log('Client ID:', clientId ? `${clientId.substring(0, 10)}...` : '❌ 없음');
  console.log('Client Secret:', clientSecret ? `${clientSecret.substring(0, 10)}...` : '❌ 없음');

  if (!clientId || !clientSecret) {
    console.error('\n❌ Adobe 자격 증명이 설정되지 않았습니다.');
    console.error('👉 .env.local 파일을 확인하세요.');
    console.error('👉 ADOBE_SETUP.md 파일을 참조하여 설정하세요.\n');
    return;
  }

  if (clientId === 'your_client_id' || clientSecret === 'your_client_secret') {
    console.error('\n❌ Adobe 자격 증명이 기본값입니다.');
    console.error('👉 실제 값으로 교체해주세요.');
    console.error('👉 ADOBE_SETUP.md 파일을 참조하세요.\n');
    return;
  }

  try {
    console.log('\n📡 Adobe API에 Access Token 요청 중...');

    const response = await fetch('https://pdf-services.adobe.io/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`\n❌ Adobe API 인증 실패: ${response.status}`);
      console.error('응답:', errorText);
      console.error('\n가능한 원인:');
      console.error('  1. Client ID 또는 Client Secret이 잘못됨');
      console.error('  2. Adobe Developer Console에서 프로젝트가 활성화되지 않음');
      console.error('  3. PDF Services API가 프로젝트에 추가되지 않음');
      console.error('\n👉 ADOBE_SETUP.md를 다시 확인하세요.\n');
      return;
    }

    const data = await response.json();
    console.log('\n✅ Adobe API 인증 성공!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Access Token:', `${data.access_token.substring(0, 30)}...`);
    console.log('토큰 타입:', data.token_type);
    console.log('유효 시간:', data.expires_in, '초 (약', Math.floor(data.expires_in / 3600), '시간)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎉 Adobe PDF Services API를 사용할 준비가 되었습니다!');
    console.log('👉 이제 실제 PDF로 테스트해보세요: npm run dev\n');

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    console.error('\n가능한 원인:');
    console.error('  1. 인터넷 연결 문제');
    console.error('  2. 방화벽/VPN 차단');
    console.error('  3. Adobe 서비스 장애');
    console.error('\n👉 인터넷 연결을 확인하거나 나중에 다시 시도하세요.\n');
  }
}

// 실행
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('   Adobe PDF Services API 테스트');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
testAdobeAPI();
