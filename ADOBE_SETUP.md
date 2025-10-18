# Adobe PDF Services API 설정 가이드

## 1단계: Adobe 계정 생성 및 프로젝트 설정

### 1.1 Adobe Developer Console 접속

브라우저에서 다음 주소로 이동:
```
https://developer.adobe.com/console
```

### 1.2 로그인
- Adobe ID가 없다면 "Get an Adobe ID" 클릭하여 무료 계정 생성
- Adobe ID가 있다면 로그인

### 1.3 새 프로젝트 생성

1. **"Create new project"** 버튼 클릭
2. 프로젝트 이름 입력:
   ```
   예: NewsBrief PDF Converter
   ```
3. **"Create"** 클릭

### 1.4 PDF Services API 추가

1. 생성된 프로젝트 클릭하여 열기
2. **"Add API"** 버튼 클릭
3. API 목록에서 **"Adobe PDF Services API"** 선택
4. **"Next"** 클릭

### 1.5 인증 방식 선택

1. **"OAuth Server-to-Server"** 선택
   - ✅ 서버 간 통신에 적합
   - ✅ 자동 토큰 갱신
   - ✅ 무료 티어 500건/월 제공
2. **"Next"** 클릭

### 1.6 제품 프로필 선택

1. 기본 프로필 선택 (보통 자동 선택됨)
2. **"Save configured API"** 클릭

---

## 2단계: 자격 증명 복사

### 2.1 Credentials 확인

프로젝트 대시보드에서 왼쪽 메뉴의 **"Credentials"** 클릭

### 2.2 OAuth Server-to-Server 선택

**"OAuth Server-to-Server"** 항목 클릭

### 2.3 필요한 정보 복사

다음 정보를 복사해서 메모장에 저장:

```
Client ID:
abc123def456ghi789jkl...

Client Secret:
p8e-XYZ789ABC123DEF456...
```

⚠️ **중요**: Client Secret은 한 번만 표시되므로 안전한 곳에 저장!

---

## 3단계: 프로젝트 환경 변수 설정

### 3.1 `.env.local` 파일 편집

프로젝트 루트에서:
```bash
# .env.local 파일 열기 (없으면 생성)
code .env.local
```

### 3.2 Adobe 자격 증명 추가

```bash
# Anthropic Claude API 키 (필수)
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Adobe PDF Services API (복사한 값으로 교체)
ADOBE_CLIENT_ID=여기에_Client_ID_붙여넣기
ADOBE_CLIENT_SECRET=여기에_Client_Secret_붙여넣기
```

**예시**:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-abc123...

ADOBE_CLIENT_ID=a1b2c3d4e5f6g7h8i9j0
ADOBE_CLIENT_SECRET=p8e-k1l2m3n4o5p6q7r8
```

### 3.3 파일 저장

- VS Code: `Cmd+S` (Mac) 또는 `Ctrl+S` (Windows)
- 저장 후 파일 닫기

---

## 4단계: Adobe API 테스트

### 4.1 테스트 스크립트 생성

다음 파일을 생성하여 Adobe API가 정상 작동하는지 테스트:

```bash
# 테스트 파일 생성
touch test-adobe.js
```

### 4.2 테스트 코드 작성

`test-adobe.js`:
```javascript
// Adobe API 테스트 스크립트

async function testAdobeAPI() {
  const clientId = process.env.ADOBE_CLIENT_ID;
  const clientSecret = process.env.ADOBE_CLIENT_SECRET;

  console.log('🔑 Adobe 자격 증명 확인...');
  console.log('Client ID:', clientId ? `${clientId.substring(0, 10)}...` : '❌ 없음');
  console.log('Client Secret:', clientSecret ? `${clientSecret.substring(0, 10)}...` : '❌ 없음');

  if (!clientId || !clientSecret) {
    console.error('\n❌ Adobe 자격 증명이 설정되지 않았습니다.');
    console.error('👉 .env.local 파일을 확인하세요.\n');
    return;
  }

  try {
    console.log('\n📡 Access Token 요청 중...');

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
      console.error('\n👉 Client ID와 Client Secret을 다시 확인하세요.');
      return;
    }

    const data = await response.json();
    console.log('\n✅ Adobe API 인증 성공!');
    console.log('Access Token:', `${data.access_token.substring(0, 20)}...`);
    console.log('만료 시간:', data.expires_in, '초');
    console.log('\n🎉 Adobe PDF Services API를 사용할 준비가 되었습니다!\n');

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    console.error('👉 인터넷 연결을 확인하거나 나중에 다시 시도하세요.\n');
  }
}

// 실행
testAdobeAPI();
```

### 4.3 테스트 실행

```bash
# .env.local 파일 로드하고 테스트 실행
node -r dotenv/config test-adobe.js
```

**예상 출력 (성공)**:
```
🔑 Adobe 자격 증명 확인...
Client ID: a1b2c3d4e5...
Client Secret: p8e-k1l2m3...

📡 Access Token 요청 중...

✅ Adobe API 인증 성공!
Access Token: eyJhbGciOiJSUzI1Ni...
만료 시간: 86399 초

🎉 Adobe PDF Services API를 사용할 준비가 되었습니다!
```

**예상 출력 (실패 - 잘못된 자격 증명)**:
```
🔑 Adobe 자격 증명 확인...
Client ID: wrongclient...
Client Secret: wrongsecre...

📡 Access Token 요청 중...

❌ Adobe API 인증 실패: 401
응답: {"error":"invalid_client"}

👉 Client ID와 Client Secret을 다시 확인하세요.
```

---

## 5단계: PDF 테스트 파일로 실제 추출 테스트

### 5.1 샘플 PDF 준비

프로젝트 루트에 `test-sample.pdf` 파일 준비

### 5.2 실제 추출 테스트 스크립트

`test-extract.js`:
```javascript
import { extractPDFWithAdobe } from './src/lib/adobe-rest.js';
import fs from 'fs';

async function testExtract() {
  console.log('📄 PDF 파일 읽기 중...');

  const pdfPath = './test-sample.pdf';
  if (!fs.existsSync(pdfPath)) {
    console.error('❌ test-sample.pdf 파일이 없습니다.');
    console.error('👉 프로젝트 루트에 PDF 파일을 준비하세요.');
    return;
  }

  const pdfBuffer = fs.readFileSync(pdfPath);
  console.log(`✅ PDF 파일 로드 완료 (${pdfBuffer.length} bytes)\n`);

  try {
    console.log('🚀 Adobe PDF Extract API 호출 시작...\n');
    const result = await extractPDFWithAdobe(pdfBuffer);

    console.log('\n✅ 추출 완료!');
    console.log('방법:', result.method);
    console.log('텍스트 길이:', result.text.length, '글자');
    console.log('\n--- 추출된 텍스트 미리보기 (처음 500자) ---');
    console.log(result.text.substring(0, 500));
    console.log('...\n');

    // 전체 텍스트 파일로 저장
    fs.writeFileSync('extracted-text.txt', result.text);
    console.log('💾 전체 텍스트가 extracted-text.txt에 저장되었습니다.\n');

  } catch (error) {
    console.error('❌ 추출 실패:', error.message);
  }
}

testExtract();
```

### 5.3 테스트 실행

```bash
# ES Module 방식으로 실행
node --env-file=.env.local test-extract.js
```

---

## 6단계: 무료 할당량 확인

### 6.1 사용량 확인

Adobe Developer Console에서:
1. 프로젝트 선택
2. 왼쪽 메뉴에서 **"Insights"** 클릭
3. API 사용량 확인

### 6.2 무료 티어 제한

- **월 500건** 무료
- 초과 시: **$0.05/건**
- 매월 1일에 리셋

---

## 문제 해결

### ❌ "invalid_client" 오류
```
Client ID 또는 Client Secret이 잘못됨

해결:
1. Adobe Developer Console에서 자격 증명 재확인
2. .env.local 파일에서 공백 없는지 확인
3. Client Secret 재발급 (Rotate Secret 버튼)
```

### ❌ "404 Not Found" 오류
```
프로젝트에 PDF Services API가 추가되지 않음

해결:
1. Adobe Developer Console 프로젝트 열기
2. "Add API" 클릭
3. "Adobe PDF Services API" 추가
```

### ❌ Access Token은 받았는데 Extract 실패
```
API 권한 문제 또는 네트워크 오류

해결:
1. 프로젝트에 올바른 권한이 있는지 확인
2. 방화벽/VPN 확인
3. Adobe 서비스 상태 확인: https://status.adobe.com/
```

### ❌ 환경 변수를 읽을 수 없음
```
.env.local 파일이 로드되지 않음

해결:
1. 파일 이름 확인: .env.local (정확히)
2. 파일 위치: 프로젝트 루트
3. Next.js 서버 재시작: npm run dev
```

---

## 다음 단계

Adobe API 설정이 완료되면:

1. **실제 PDF로 테스트**
   ```bash
   # 개발 서버 시작
   npm run dev

   # 브라우저에서 http://localhost:3000
   # PDF 업로드 → Adobe로 자동 처리
   ```

2. **추출된 데이터 확인**
   - 콘솔에서 `[Adobe]` 로그 확인
   - `extracted-text.txt` 파일 확인
   - 원문이 제대로 보존되었는지 검증

3. **다음 작업 결정**
   - Adobe 데이터가 만족스러우면 계속 사용
   - 추가 처리가 필요하면 Claude와 조합
   - 데이터 구조 분석하여 최적의 변환 방법 설계

---

## 참고 자료

- [Adobe Developer Console](https://developer.adobe.com/console)
- [PDF Services API 문서](https://developer.adobe.com/document-services/docs/apis/pdf-extract/)
- [가격 정보](https://developer.adobe.com/document-services/pricing/main/)
- [코드 샘플](https://github.com/adobe/pdfservices-api-documentation)

---

**준비 완료 체크리스트**:
- [ ] Adobe 계정 생성
- [ ] 프로젝트 생성
- [ ] PDF Services API 추가
- [ ] Client ID & Secret 복사
- [ ] .env.local 파일 설정
- [ ] 테스트 스크립트 실행 성공
- [ ] 실제 PDF 추출 테스트 완료
