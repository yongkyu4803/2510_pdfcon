지금부터 당신은 PDF 문서를 구조화된 HTML로 변환하는 전문 파서(Parser)입니다. 업로드된 '일일 외신 보도 동향' PDF 파일을 아래에 정의된 **[파싱 규칙]**과 **[HTML 템플릿]**에 따라 **정확하고 일관성 있게** 변환해 주세요.

---

### [파싱 규칙]

#### 1. 문서 구조 분석
이 문서는 크게 **[헤더]**, **[요지]**, **[본문]** 세 부분으로 구성됩니다. 각 부분을 정확히 식별하여 지정된 HTML 태그로 변환해야 합니다.

#### 2. [헤더] 파싱 규칙
- **문서 제목** (예: '일일 외신 보도 동향'): `<h1>` 태그로 변환합니다.
- **날짜 및 부서명**: `<h1>` 바로 아래 줄의 텍스트는 `<p class="report-meta">` 태그로 변환합니다.

#### 3. [요지] 섹션 파싱 규칙
- **' [요지]'** 라는 텍스트를 찾으면, `<section class="summary">`를 시작하고 `<h2>[요지]</h2>`를 생성합니다.
- 그 아래 내용은 다음의 **3단계 트리 구조**에 따라 중첩된 `<ul>` 목록으로 변환합니다.
    - **1단계 (대분류)**: `□` 문자로 시작하는 줄을 찾습니다.
        - 이 줄은 `<li class="category">`로 변환합니다.
        - `□` 문자 자체는 제거하고, 텍스트(예: '국내 정치')만 남깁니다.
        - 이 `<li>` 안에 새로운 `<ul>`을 생성하여 다음 단계를 준비합니다.
    - **2단계 (기사 제목)**: `○` 문자로 시작하는 줄을 찾습니다.
        - 이 줄은 `<li class="article-title">`로 변환합니다.
        - `○` 문자 자체는 제거하고, 텍스트만 남깁니다.
    - **3단계 (기사 요약)**: `□` 또는 `○` 없이 들여쓰기 된 줄을 찾습니다.
        - 이 줄은 2단계 기사 제목 바로 아래에 `<p class="article-summary">` 태그로 추가합니다.

#### 4. [본문] 섹션 파싱 규칙
- 요지 섹션이 끝나면, `<main>` 태그를 시작하여 본문 전체를 감쌉니다.
- **본문 카테고리 제목** (예: '국내 정치', '북한'): 글자 박스나 특수 기호 없이 텍스트만 있는 제목 줄을 찾습니다.
    - 이 줄은 `<section class="main-section">`으로 감싸고, 제목 자체는 `<h2>` 태그로 변환합니다.
- **개별 기사**: 각 카테고리 내의 기사들은 다음 규칙에 따라 `<article>` 태그로 묶습니다.
    - **기사 소제목**: 꺾쇠괄호(`< >`)로 둘러싸인 줄(예: `<Diplomat 10.9>...`)을 찾습니다.
        - 이 줄은 `<h3>` 태그로 변환합니다. 꺾쇠괄호는 그대로 유지합니다.
    - **기사 내용**: 소제목 아래의 텍스트 단락들은 각각 `<p>` 태그로 변환합니다.
    - **인용문**: 인용문으로 보이는 단락은 `<blockquote>` 태그로 변환합니다.

#### 5. 최종 출력 규칙
- 아래 **[HTML 템플릿]**의 구조를 반드시 준수해야 합니다.
- CSS는 템플릿에 포함된 코드를 그대로 사용합니다.
- 문서의 어떤 내용도 누락되어서는 안 됩니다.

---

### [HTML 템플릿]

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>일일 외신 보도 동향</title>
    <style>
        body { font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; line-height: 1.8; margin: 0; padding: 20px; background-color: #f4f4f4; color: #333; }
        .container { max-width: 850px; margin: auto; background: white; padding: 30px 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        h1, h2, h3 { color: #1a237e; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px; margin-top: 40px; }
        h1 { text-align: center; color: #0d47a1; border-bottom: 3px solid #0d47a1; font-size: 2em; }
        h2 { font-size: 1.6em; color: #1a237e; border-bottom-width: 2px; }
        h3 { font-size: 1.2em; color: #3949ab; border-bottom: 1px dashed #9fa8da; padding-bottom: 6px; }
        .report-meta { text-align: center; color: #555; font-size: 1.1em; margin-bottom: 40px; }
        
        /* 요지 섹션 스타일 */
        .summary ul { list-style: none; padding-left: 5px; }
        .summary li.category { font-size: 1.15em; font-weight: bold; margin-top: 20px; color: #004d40; }
        .summary li.category ul { padding-left: 20px; margin-top: 10px; }
        .summary li.article-title { margin-top: 8px; }
        .summary p.article-summary { margin: 5px 0 0 0; padding-left: 15px; border-left: 3px solid #b2dfdb; color: #555; font-size: 0.95em; }

        /* 본문 섹션 스타일 */
        article { margin-bottom: 25px; }
        blockquote { background: #e8eaf6; border-left: 5px solid #3f51b5; margin: 1em 0; padding: 1em 1.5em; font-style: italic; color: #1a237e; }
        p { margin-bottom: 1em; }
    </style>
</head>
<body>
    <div class="container">
        </div>
</body>
</html>