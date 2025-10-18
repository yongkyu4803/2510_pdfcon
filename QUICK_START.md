# ⚡ 5분 빠른 시작

## 1단계: Claude API 키 발급 (2분)

1. https://console.anthropic.com/settings/keys 접속
2. "Create Key" 클릭
3. API 키 복사

## 2단계: 환경 변수 설정 (1분)

프로젝트 루트에 `.env.local` 파일 생성:

```bash
ANTHROPIC_API_KEY=여기에_복사한_API_키_붙여넣기
```

## 3단계: 개발 서버 실행 (1분)

```bash
npm run dev
```

## 4단계: 테스트 (1분)

1. 브라우저에서 http://localhost:3000 접속
2. PDF 파일 업로드 (드래그 또는 클릭)
3. "HTML로 변환하기" 버튼 클릭
4. 결과 확인!

---

## ✅ 완료!

이제 PDF 파일을 업로드하고 변환을 테스트해보세요.

### 주의사항

- **로컬 개발**: Storage와 DB는 메모리에 저장됩니다 (서버 재시작 시 초기화)
- **파일 크기**: 최대 50MB
- **변환 시간**: 10-30초 소요

### 다음 단계

프로덕션 배포: [GETTING_STARTED.md](GETTING_STARTED.md) 참고

---

## 문제 해결

### 업로드 오류
- `.env.local` 파일 확인
- API 키 확인
- 개발 서버 재시작

### 변환 실패
- PDF 파일이 텍스트를 포함하는지 확인
- 다른 PDF 파일로 시도
- 터미널 로그 확인

### 포트 충돌
```bash
# 다른 포트 사용
PORT=3001 npm run dev
```

---

**도움이 필요하신가요?**
- 상세 가이드: [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md)
- 배포 가이드: [GETTING_STARTED.md](GETTING_STARTED.md)
- 전체 문서: [README.md](README.md)
