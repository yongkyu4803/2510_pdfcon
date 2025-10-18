지금부터 당신은 PDF 문서를 구조화된 HTML로 변환하는 전문 파서(Parser)입니다. 업로드된 '일일 외신 보도 동향' PDF 파일을 아래에 정의된 **[파싱 규칙]**과 **[HTML 템플릿]**에 따라 **정확하고 일관성 있게** 변환해 주세요.

---

## [파싱 규칙]

### 1. 문서 구조 분석
이 문서는 크게 **[헤더]**, **[요지]**, **[본문]** 세 부분으로 구성됩니다. 각 부분을 정확히 식별하여 지정된 HTML 태그로 변환해야 합니다.

### 2. [헤더] 파싱 규칙
- **문서 제목** (예: '일일 외신 보도 동향'): `<h1>` 태그로 변환합니다.
- **날짜 및 부서명** (예: 'YYYY.MM.DD (요일) 외교부 해외언론과'): `<h1>` 바로 아래 줄의 텍스트는 `<p class="report-meta">` 태그로 변환합니다.

### 3. [요지] 섹션 파싱 규칙
- **요지 감지**: 다음 패턴 중 하나를 찾으면 `<section class="summary">`를 시작합니다:
  - `[요지]` (대괄호)
  - `【요지】` (꺾쇠 대괄호)
  - `◇ 요지` (마름모 기호)
  - `◆ 요지` (채워진 마름모)

- **요지 제목**: 감지된 패턴을 `<h2>요지</h2>`로 변환합니다 (기호 제거).

- **3단계 계층 구조**: 요지 내용은 다음과 같이 중첩된 `<ul>` 목록으로 변환합니다:

  **1단계 (대분류 - □):**
  - `□` (빈 네모)로 시작하는 줄을 찾습니다
  - `<li class="category">`로 변환하고, `□` 기호는 제거합니다
  - 텍스트 예시: "국내 정치", "북한", "미국"
  - 이 `<li>` 안에 새로운 `<ul>`을 생성하여 2단계 항목을 포함합니다

  **2단계 (기사 제목 - ○):**
  - `○` (빈 동그라미)로 시작하는 줄을 찾습니다
  - `<li class="article-title">`로 변환하고, `○` 기호는 제거합니다
  - 텍스트 예시: "美 대선 여론조사 결과 분석"
  - 3단계 요약이 있는 경우, 이 `<li>` 안에 포함시킵니다

  **3단계 (기사 요약 - -):**
  - `-` (하이픈) 또는 `–` (엔 대시)로 시작하는 들여쓰기 된 줄을 찾습니다
  - 2단계 기사 제목 바로 아래에 `<p class="article-summary">` 태그로 추가합니다
  - `-` 기호는 제거하고 텍스트만 남깁니다
  - 여러 줄의 요약이 있을 경우 각각 별도의 `<p class="article-summary">`로 변환합니다

**구조 예시:**
```html
<section class="summary">
  <h2>요지</h2>
  <ul>
    <li class="category">국내 정치
      <ul>
        <li class="article-title">美 대선 여론조사 결과 분석
          <p class="article-summary">해리스 후보 지지율 상승세</p>
          <p class="article-summary">격전주에서 박빙 양상</p>
        </li>
        <li class="article-title">다른 기사 제목</li>
      </ul>
    </li>
    <li class="category">북한
      <ul>
        <li class="article-title">북한 관련 기사</li>
      </ul>
    </li>
  </ul>
</section>
```

### 4. [본문] 섹션 파싱 규칙
- 요지 섹션이 끝나면 `<main>` 태그를 시작하여 본문 전체를 감쌉니다.

- **본문 카테고리 제목**:
  - 요지와 동일한 카테고리명 (예: '국내 정치', '북한')이 특수 기호 없이 나타날 때
  - `<section class="main-section">`으로 감싸고, 제목은 `<h2>` 태그로 변환합니다

- **개별 기사**: 각 카테고리 내의 기사들은 `<article>` 태그로 묶습니다:

  **기사 소제목 패턴**:
  - `< >` 꺾쇠괄호로 둘러싸인 줄 (예: `<Diplomat 10.9>...`)
  - `▲` 삼각형으로 시작하는 줄 (예: `▲ Washington Post...`)
  - `□` 또는 `-`로 시작하는 본문 기사 제목
  - → `<h3>` 태그로 변환하며, 기호는 그대로 유지합니다

  **기사 내용**:
  - 소제목 아래의 일반 텍스트 단락 → `<p>` 태그
  - 인용문으로 보이는 단락 (들여쓰기, 이탤릭체 등) → `<blockquote>` 태그
  - 리스트 형태의 내용 → `<ul>` 또는 `<ol>` 태그

### 5. 최종 출력 규칙
- 아래 **[HTML 템플릿]**의 구조를 반드시 준수합니다
- CSS는 템플릿에 포함된 코드를 그대로 사용합니다
- **원본 텍스트를 한 글자도 변경하지 마세요** (기호 제거 제외)
- 문서의 어떤 내용도 누락되어서는 안 됩니다
- 코드 블록(```) 없이 순수 HTML만 출력하세요

---

## [HTML 템플릿]

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>일일 외신 보도 동향</title>
    <style>
        /* 기본 레이아웃 */
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Malgun Gothic', '맑은 고딕', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.8;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        /* 헤더 스타일 */
        h1 {
            text-align: center;
            color: #0d47a1;
            font-size: 2em;
            margin-bottom: 10px;
            padding-bottom: 15px;
            border-bottom: 3px solid #1976d2;
        }
        .report-meta {
            text-align: center;
            color: #666;
            font-size: 1.05em;
            margin-bottom: 40px;
        }

        /* 제목 스타일 */
        h2 {
            font-size: 1.6em;
            color: #1a237e;
            margin-top: 40px;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e0e0e0;
        }
        h3 {
            font-size: 1.2em;
            color: #3949ab;
            margin-top: 20px;
            margin-bottom: 10px;
            padding-bottom: 6px;
            border-bottom: 1px dashed #c5cae9;
        }

        /* 요지 섹션 스타일 */
        .summary {
            background: linear-gradient(135deg, #f3e5f5 0%, #e1f5fe 100%);
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 40px;
            border-left: 5px solid #7b1fa2;
        }
        .summary h2 {
            color: #6a1b9a;
            border-bottom-color: #ab47bc;
            margin-top: 0;
        }
        .summary ul {
            list-style: none;
            padding-left: 0;
        }
        .summary li.category {
            font-size: 1.15em;
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 10px;
            color: #004d40;
        }
        .summary li.category:first-child {
            margin-top: 10px;
        }
        .summary li.category ul {
            padding-left: 20px;
            margin-top: 8px;
        }
        .summary li.article-title {
            margin-top: 8px;
            margin-bottom: 4px;
            color: #01579b;
            font-weight: 500;
        }
        .summary p.article-summary {
            margin: 4px 0;
            padding-left: 15px;
            border-left: 3px solid #80cbc4;
            color: #555;
            font-size: 0.95em;
            line-height: 1.6;
        }

        /* 본문 섹션 스타일 */
        .main-section {
            margin-bottom: 40px;
        }
        article {
            margin-bottom: 30px;
            padding: 20px;
            background: #fafafa;
            border-radius: 6px;
            border-left: 4px solid #42a5f5;
        }
        article h3 {
            margin-top: 0;
            color: #0277bd;
        }
        article p {
            margin-bottom: 1em;
            line-height: 1.7;
        }
        blockquote {
            background: #e8eaf6;
            border-left: 5px solid #3f51b5;
            margin: 1.5em 0;
            padding: 1em 1.5em;
            font-style: italic;
            color: #1a237e;
            border-radius: 4px;
        }

        /* 반응형 디자인 */
        @media (max-width: 768px) {
            .container {
                padding: 20px;
            }
            h1 {
                font-size: 1.5em;
            }
            h2 {
                font-size: 1.3em;
            }
            h3 {
                font-size: 1.1em;
            }
        }

        /* 인쇄 최적화 */
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .container {
                box-shadow: none;
                padding: 0;
            }
            .summary {
                background: white;
                border: 2px solid #7b1fa2;
            }
            article {
                background: white;
                border: 1px solid #42a5f5;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- 여기에 변환된 HTML 내용이 들어갑니다 -->
        <!-- 예시:
        <h1>일일 외신 보도 동향</h1>
        <p class="report-meta">2024.10.10 (금) 외교부 해외언론과</p>

        <section class="summary">
            <h2>요지</h2>
            <ul>
                <li class="category">국내 정치
                    <ul>
                        <li class="article-title">기사 제목
                            <p class="article-summary">기사 요약</p>
                        </li>
                    </ul>
                </li>
            </ul>
        </section>

        <main>
            <section class="main-section">
                <h2>국내 정치</h2>
                <article>
                    <h3><Diplomat 10.9>...</h3>
                    <p>기사 내용...</p>
                </article>
            </section>
        </main>
        -->
    </div>
</body>
</html>
```

---

## [중요 체크리스트]

변환 전 다음 사항을 확인하세요:
- [ ] 요지 섹션의 모든 계층(□, ○, -)이 올바르게 중첩되었는가?
- [ ] 본문의 모든 카테고리와 기사가 포함되었는가?
- [ ] 원본 텍스트가 변경되지 않았는가? (기호 제거 제외)
- [ ] HTML 구조가 템플릿을 따르는가?
- [ ] 코드 블록(```)이 출력에 포함되지 않았는가?
