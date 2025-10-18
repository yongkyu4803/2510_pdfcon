# 로컬 개발 가이드

## 빠른 시작 (5분)

### 1단계: 환경 변수 설정

`.env.local` 파일을 생성하고 Claude API 키만 추가하세요:

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-여기에_실제_API_키_입력
```

**API 키 발급**: https://console.anthropic.com/settings/keys

### 2단계: 개발 서버 실행

```bash
npm run dev
```

### 3단계: 테스트

브라우저에서 http://localhost:3000 접속 후 PDF 파일을 업로드해보세요.

---

## 로컬 개발 특징

### 메모리 기반 스토리지

로컬 환경에서는 Vercel Storage 없이도 작동합니다:

- **파일 저장**: 메모리 (서버 재시작 시 초기화)
- **데이터베이스**: 메모리 (서버 재시작 시 초기화)

### 환경 감지

시스템이 자동으로 환경을 감지합니다:

```typescript
// 로컬 환경 감지
const isLocal = !process.env.BLOB_READ_WRITE_TOKEN;
```

### 로그 확인

터미널에서 다음과 같은 로그를 확인할 수 있습니다:

```
[Local Storage] Saving file: pdfs/1234567890-test.pdf
[Local DB] Created conversion: abc123xyz
[Local DB] Updated conversion: abc123xyz
```

---

## 프로덕션 배포와의 차이

| 기능 | 로컬 개발 | 프로덕션 (Vercel) |
|------|-----------|------------------|
| 파일 저장 | 메모리 (임시) | Vercel Blob (영구) |
| 데이터베이스 | 메모리 (임시) | Postgres (영구) |
| 필요 환경변수 | `ANTHROPIC_API_KEY` 만 | 모든 환경변수 |
| 파일 URL | Data URL (base64) | 공개 HTTP URL |
| 서버 재시작 | 데이터 초기화 | 데이터 유지 |

---

## 문제 해결

### 업로드 오류

```
Error: Failed to upload
```

**원인**: Claude API 키가 설정되지 않았거나 잘못됨

**해결**:
1. `.env.local` 파일 확인
2. `ANTHROPIC_API_KEY` 값 확인
3. 개발 서버 재시작

### 변환 오류

```
Error: Failed to convert
```

**원인**: PDF 파일이 손상되었거나 텍스트가 없음

**해결**:
1. 다른 PDF 파일로 시도
2. 터미널에서 에러 로그 확인
3. PDF에 텍스트가 포함되어 있는지 확인

### 히스토리가 보이지 않음

**원인**: 로컬 환경에서 서버를 재시작했음

**해결**: 로컬 개발에서는 서버 재시작 시 메모리 초기화가 정상입니다. 새로 변환을 시도하세요.

---

## 개발 팁

### 1. Hot Reload

코드 수정 시 자동으로 브라우저가 새로고침됩니다.

### 2. 터미널 로그

변환 프로세스를 터미널에서 실시간으로 확인할 수 있습니다.

### 3. 빠른 테스트

서버 재시작 없이 여러 PDF를 연속으로 테스트할 수 있습니다.

### 4. 디버깅

브라우저 개발자 도구(F12)에서 네트워크 탭과 콘솔을 확인하세요.

---

## 다음 단계

로컬 개발이 성공적이면 [GETTING_STARTED.md](GETTING_STARTED.md)를 참고하여 Vercel에 배포하세요.

**주의**: 배포 전에 다음을 확인하세요:
- [ ] `.env.local` 파일이 커밋되지 않았는지 확인
- [ ] API 키가 노출되지 않았는지 확인
- [ ] `.gitignore`에 `.env*` 포함 확인
