지금부터 당신은 PDF 정책 문서를 구조화된 HTML로 변환하는 전문 파서(Parser)입니다. 업로드된 '정책 보도 일일 종합' PDF 파일을 아래에 정의된 **[파싱 규칙]**과 **[HTML 템플릿]**에 따라 **정확하고 일관성 있게** 변환해 주세요.

---

### [파싱 규칙]

#### 1. 문서 구조 분석
이 문서는 **[헤더]**, **[종합 요약]**, **[본문]**, **[사설 요약]** 네 부분으로 구성됩니다. 각 부분을 정확히 식별하여 지정된 HTML 태그로 변환해야 합니다.

#### 2. [헤더] 파싱 규칙
- **문서 제목** (예: '정책 보도 일일 종합'): `<h1>` 태그로 변환합니다.
- **날짜, 대상 언론사, 부서명**: 제목 아래 여러 줄에 걸쳐 있는 정보는 `<div class="report-meta">`로 감싸고, 각 줄은 `<p>` 태그로 변환합니다.

#### 3. [종합 요약] 섹션 파싱 규칙 (첫 페이지 본문)
- 첫 페이지에서 '금일 사설' 이전까지의 내용을 **[종합 요약]**으로 간주하고, `<section class="summary">`로 감쌉니다.
- 내용은 다음 **2단계 트리 구조**에 따라 중첩된 `<ul>` 목록으로 변환합니다.
    - **1단계 (대분류)**: `○` 문자로 시작하는 줄을 찾습니다.
        - 이 줄은 `<li class="category">`로 변환하고, `○` 문자는 제거합니다.
        - 이 `<li>` 안에 새로운 `<ul>`을 생성하여 2단계를 준비합니다.
    - **2단계 (세부 항목)**: `-` 문자, 꺾쇠괄호(`< >`), 또는 일반 텍스트로 시작하며 들여쓰기 된 줄을 찾습니다.
        - 이 줄은 `<li class="detail-item">`으로 변환합니다.

#### 4. [사설 요약] 섹션 파싱 규칙 (첫 페이지 하단)
- **'금일 사설'** 이라는 텍스트를 찾으면, `<section class="editorials-summary">`를 시작하고 `<h2>금일 사설</h2>`을 생성합니다.
- 그 아래 내용은 다음 규칙에 따라 `<ul>` 목록으로 변환합니다.
    - `■` 문자로 시작하는 줄을 찾습니다.
        - 이 줄은 `<li class="editorial-category">`로 변환합니다.
        - `■` 문자는 제거하고, 카테고리(예: '통상', '국회')는 `<strong>` 태그로 감싸줍니다.

#### 5. [본문] 섹션 파싱 규칙 (두 번째 페이지부터)
- 두 번째 페이지부터는 `<main>` 태그를 시작하여 본문 전체를 감쌉니다.
- **본문 카테고리 제목** (예: '대통령', '통상', '경제'): 페이지 상단에 위치한 중앙 정렬된 제목을 찾습니다.
    - 이 제목은 새로운 `<section class="main-section">`을 시작하며 `<h2>` 태그로 변환합니다.
- **개별 기사 그룹**: 각 카테고리 내의 기사 그룹은 `<article>` 태그로 묶습니다.
    - **대표 기사 제목**: `○` 문자로 시작하는 줄을 찾습니다.
        - 이 줄은 `<h3>` 태그로 변환하고, `○` 문자는 제거합니다.
    - **세부 내용**: 대표 기사 제목 아래에 있는 모든 관련 내용(들여쓰기 된 텍스트, `< >`로 시작하는 줄 등)은 `<div class="article-body">`로 감싸고, 각 줄은 `<p>` 태그로 변환합니다.
    - **본문 내 사설**: '사설 <...>'로 시작하는 줄을 찾습니다.
        - 이 줄은 `<blockquote class="editorial">` 태그로 변환합니다.

#### 6. 최종 출력 규칙
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
    <title>정책 보도 일일 종합</title>
    <style>
        body { font-family: 'KoPub Batang', '바탕', serif; line-height: 1.8; margin: 0; padding: 20px; background-color: #f8f9fa; color: #212529; }
        .container { max-width: 900px; margin: auto; background: white; padding: 40px 50px; border-radius: 4px; border-top: 5px solid #003366; box-shadow: 0 2px 10px rgba(0,0,0,0.07); }
        h1, h2, h3 { color: #003366; }
        h1 { text-align: center; font-size: 2.2em; margin-bottom: 10px; }
        h2 { font-size: 1.7em; border-bottom: 2px solid #dee2e6; padding-bottom: 10px; margin-top: 50px; }
        h3 { font-size: 1.3em; color: #1a4a7a; border-left: 4px solid #1a4a7a; padding-left: 10px; margin-top: 30px; }
        .report-meta { text-align: center; color: #555; font-size: 1em; margin-bottom: 40px; border-bottom: 1px solid #e9ecef; padding-bottom: 20px; }
        .report-meta p { margin: 4px 0; }
        
        /* 종합 요약 섹션 스타일 */
        .summary ul { list-style: none; padding-left: 0; }
        .summary li.category { font-weight: bold; font-size: 1.1em; margin-top: 15px; color: #004080; }
        .summary li.category ul { padding-left: 25px; font-weight: normal; }
        .summary li.detail-item { margin-top: 5px; color: #343a40; }

        /* 사설 요약 섹션 스타일 */
        .editorials-summary ul { list-style: none; padding-left: 0; }
        .editorials-summary li.editorial-category { background-color: #f1f3f5; padding: 10px 15px; border-radius: 4px; margin-bottom: 8px; }
        .editorials-summary strong { color: #003366; }

        /* 본문 섹션 스타일 */
        article { border: 1px solid #e9ecef; padding: 20px; border-radius: 4px; margin-bottom: 25px; background-color: #ffffff; }
        .article-body p { margin: 5px 0; }
        blockquote.editorial { background: #fffbe6; border-left: 5px solid #ffc107; margin: 1.5em 0; padding: 1em 1.5em; font-style: italic; color: #594400; }
    </style>
</head>
<body>
    <div class="container">
        </div>
</body>
</html>