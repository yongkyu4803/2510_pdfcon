# Adobe API 빠른 설정 가이드 (5분)

## 📋 준비물
- Adobe 계정 (없으면 무료 생성)
- 인터넷 연결

---

## 🚀 3단계로 설정하기

### 1단계: Adobe 자격 증명 발급 (3분)

**1.1 Adobe Developer Console 접속**
```
https://developer.adobe.com/console
```

**1.2 프로젝트 생성**
- "Create new project" 클릭
- 이름 입력: "NewsBrief Converter"
- "Create" 클릭

**1.3 API 추가**
- "Add API" 클릭
- "Adobe PDF Services API" 선택
- "Next" 클릭

**1.4 인증 설정**
- "OAuth Server-to-Server" 선택
- "Next" 클릭
- "Save configured API" 클릭

**1.5 자격 증명 복사**
- 왼쪽 메뉴 "Credentials" 클릭
- "OAuth Server-to-Server" 선택
- 다음 2개 정보 복사:
  ```
  Client ID: abc123...
  Client Secret: p8e-xyz...
  ```

---

### 2단계: 환경 변수 설정 (1분)

**.env.local 파일 편집**:
```bash
# 기존 Claude API는 그대로 유지
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Adobe 자격 증명 추가 (복사한 값으로 교체)
ADOBE_CLIENT_ID=여기에_붙여넣기
ADOBE_CLIENT_SECRET=여기에_붙여넣기
```

**저장** (Cmd+S)

---

### 3단계: 테스트 (1분)

**3.1 인증 테스트**
```bash
node test-adobe-auth.js
```

**예상 결과**:
```
✅ Adobe API 인증 성공!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Access Token: eyJhbGciOiJSUzI1Ni...
토큰 타입: bearer
유효 시간: 86399 초 (약 23 시간)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 Adobe PDF Services API를 사용할 준비가 되었습니다!
```

**3.2 실제 PDF 테스트**
```bash
npm run dev
# 브라우저에서 http://localhost:3000
# PDF 업로드 → Adobe로 자동 처리됨
```

---

## ✅ 설정 완료!

이제 시스템이 다음과 같이 동작합니다:

1. **Adobe 자격 증명 있음**: Adobe로 PDF 텍스트 추출 (원문 100% 보존)
2. **Adobe 자격 증명 없음**: Claude Vision으로 자동 전환

---

## 🔍 추출된 데이터 확인하기

Adobe로 PDF를 추출하면 다음과 같은 형태로 데이터가 나옵니다:

### 콘솔 로그 확인
```bash
npm run dev
```

브라우저 개발자 도구(F12) > Console 탭:
```
[Adobe] 1/5 - Access Token 발급 중...
[Adobe] 2/5 - PDF 업로드 중...
[Adobe] 3/5 - Extract Job 생성 중...
[Adobe] 4/5 - Job 완료 대기 중...
[Adobe] Job abc123 진행 중... (1/30)
[Adobe] Job abc123 진행 중... (2/30)
...
[Adobe] 5/5 - 결과 다운로드 및 텍스트 추출 중...
```

### 추출된 텍스트 구조

Adobe는 다음과 같은 JSON 구조로 데이터를 반환합니다:

```json
{
  "elements": [
    {
      "Path": "//Document/H1",
      "Text": "2025년 국제 브리핑",
      "Font": { "name": "Arial", "size": 24 }
    },
    {
      "Path": "//Document/P[0]",
      "Text": "2025년 1월 15일",
      "Font": { "name": "Arial", "size": 12 }
    },
    {
      "Path": "//Document/P[1]",
      "Text": "정치: 미국 대선 관련 주요 이슈...",
      "Font": { "name": "Arial", "size": 11 }
    }
  ]
}
```

현재 구현은 `Text` 필드만 추출하여 순수 텍스트로 변환합니다.

---

## 🎯 다음 단계 선택

### 옵션 A: Adobe 데이터만 확인하고 싶다면

1. PDF 업로드
2. 콘솔에서 추출된 텍스트 확인
3. 원본과 비교하여 품질 검증
4. 다음 작업 방향 결정

### 옵션 B: 바로 HTML 변환까지 하고 싶다면

현재 시스템이 자동으로:
1. Adobe로 텍스트 추출
2. Claude로 구조 분석
3. Claude로 HTML 생성

---

## ❓ 문제 해결

### "❌ Adobe 자격 증명이 설정되지 않았습니다"
→ .env.local 파일 확인, 저장 후 서버 재시작

### "❌ Adobe API 인증 실패: 401"
→ Client ID/Secret 재확인, Adobe Console에서 다시 복사

### "Adobe 모듈이 없거나 실패한 경우"
→ 자동으로 Claude Vision으로 전환됨 (정상 동작)

---

## 📚 상세 가이드

더 자세한 내용은 다음 문서 참조:
- **[ADOBE_SETUP.md](./ADOBE_SETUP.md)** - 상세 설정 가이드
- **[ADOBE_REST_API_GUIDE.md](./ADOBE_REST_API_GUIDE.md)** - API 사용법
- **[src/lib/adobe-rest.ts](./src/lib/adobe-rest.ts)** - 구현 코드

---

**설정 완료 후 이 파일은 삭제해도 됩니다!**
