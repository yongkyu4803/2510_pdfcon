/**
 * 국내 정책보도 - JSON 데이터를 HTML로 변환
 * domestic.md의 템플릿 기반
 */

import type { DomesticParsedDocument } from '@/types/document';

/**
 * 국내 정책보도 문서를 HTML로 변환
 */
export function convertDomesticDocumentToHTML(doc: DomesticParsedDocument): string {
  const headerHTML = generateDomesticHeaderHTML(doc.header);
  const summaryHTML = generateDomesticSummaryHTML(doc.summary);
  const editorialsHTML = generateEditorialsHTML(doc.editorials);
  const contentHTML = generateDomesticContentHTML(doc.content);

  return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(doc.header.title)}</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Noto Serif KR', 'Noto Sans KR', -apple-system, sans-serif;
            line-height: 1.65;
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: #1f2937;
            padding: 16px;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            overflow: hidden;
        }

        /* 헤더 - 컴팩트 */
        header {
            background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
            color: white;
            padding: 24px 32px;
            text-align: center;
        }

        h1 {
            font-size: 1.75em;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.3px;
        }

        .report-meta {
            font-size: 0.85em;
            opacity: 0.9;
            line-height: 1.4;
        }
        .report-meta p { margin: 2px 0; }

        /* 콘텐츠 영역 - 컴팩트 */
        .content-wrapper {
            padding: 28px 32px;
        }

        h2 {
            font-size: 1.35em;
            font-weight: 700;
            color: #1e3a8a;
            margin: 32px 0 16px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
        }

        h2:first-of-type { margin-top: 0; }

        /* 종합 요약 - 매우 컴팩트 */
        .summary ul { list-style: none; padding: 0; }

        .summary li.category {
            background: #eff6ff;
            border-left: 3px solid #3b82f6;
            padding: 10px 14px;
            margin: 8px 0;
            border-radius: 3px;
            font-weight: 600;
            font-size: 0.95em;
            color: #1e40af;
        }

        .summary li.category ul {
            margin-top: 6px;
            padding-left: 16px;
        }

        .summary li.detail-item {
            position: relative;
            padding: 4px 0 4px 14px;
            color: #374151;
            font-size: 0.88em;
            line-height: 1.5;
        }

        .summary li.detail-item::before {
            content: "·";
            position: absolute;
            left: 0;
            color: #3b82f6;
            font-weight: bold;
            font-size: 1.2em;
        }

        /* 사설 요약 - 컴팩트 */
        .editorials-summary ul {
            list-style: none;
            padding: 0;
        }

        .editorials-summary li.editorial-category {
            background: #fef9c3;
            border-left: 3px solid #eab308;
            padding: 10px 14px;
            margin-bottom: 8px;
            border-radius: 3px;
            line-height: 1.5;
            font-size: 0.9em;
        }

        .editorials-summary strong {
            color: #a16207;
            font-weight: 700;
            margin-right: 6px;
        }

        /* 본문 - 컴팩트 */
        article {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 16px 18px;
            margin-bottom: 14px;
        }

        h3 {
            font-size: 1.05em;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 10px;
            padding-left: 10px;
            border-left: 3px solid #3b82f6;
        }

        .article-body p {
            margin: 6px 0;
            line-height: 1.6;
            color: #374151;
            font-size: 0.9em;
        }

        blockquote.editorial {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            margin: 12px 0;
            padding: 10px 14px;
            font-style: italic;
            color: #78350f;
            border-radius: 3px;
            font-size: 0.9em;
        }

        /* 반응형 */
        @media (max-width: 768px) {
            body { padding: 8px; }
            .container { border-radius: 8px; }
            header { padding: 20px 16px; }
            .content-wrapper { padding: 20px 16px; }
            h1 { font-size: 1.5em; }
            h2 { font-size: 1.2em; }
            article { padding: 14px; }
        }

        /* 인쇄 최적화 */
        @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; }
            header { background: white; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; }
            article { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="container">
        ${headerHTML}
        <div class="content-wrapper">
            ${summaryHTML}
            ${editorialsHTML}
            ${contentHTML}
        </div>
    </div>
</body>
</html>`;
}

/**
 * 헤더 HTML 생성
 */
function generateDomesticHeaderHTML(header: DomesticParsedDocument['header']): string {
  const metaHTML = header.meta.map((m) => `<p>${escapeHtml(m)}</p>`).join('\n            ');

  return `<header>
            <h1>${escapeHtml(header.title)}</h1>
            <div class="report-meta">
                ${metaHTML}
            </div>
        </header>`;
}

/**
 * 종합 요약 HTML 생성 (2단계 계층)
 */
function generateDomesticSummaryHTML(summary: DomesticParsedDocument['summary']): string {
  if (!summary || summary.length === 0) {
    return '';
  }

  const categoriesHTML = summary
    .map((cat) => {
      const itemsHTML = cat.items
        .map((item) => `<li class="detail-item">${escapeHtml(item.content)}</li>`)
        .join('\n                ');

      return `<li class="category">
                ${escapeHtml(cat.category)}
                <ul>
                    ${itemsHTML}
                </ul>
            </li>`;
    })
    .join('\n            ');

  return `<section class="summary">
        <h2>종합 요약</h2>
        <ul>
            ${categoriesHTML}
        </ul>
    </section>`;
}

/**
 * 사설 요약 HTML 생성
 */
function generateEditorialsHTML(editorials: DomesticParsedDocument['editorials']): string {
  if (!editorials || editorials.length === 0) {
    return '';
  }

  const editorialsHTML = editorials
    .map(
      (ed) =>
        `<li class="editorial-category"><strong>${escapeHtml(ed.category)}</strong> ${escapeHtml(ed.content)}</li>`
    )
    .join('\n            ');

  return `<section class="editorials-summary">
        <h2>금일 사설</h2>
        <ul>
            ${editorialsHTML}
        </ul>
    </section>`;
}

/**
 * 본문 HTML 생성 (외신과 동일한 구조)
 */
function generateDomesticContentHTML(content: DomesticParsedDocument['content']): string {
  if (!content || content.length === 0) {
    return '';
  }

  const sectionsHTML = content
    .map((section) => {
      const articlesHTML = section.articles
        .map((article) => {
          const paragraphsHTML = article.paragraphs
            .map((p) => {
              if (p.type === 'quote') {
                return `<blockquote class="editorial">${escapeHtml(p.content)}</blockquote>`;
              } else if (p.type === 'list' && p.items && p.items.length > 0) {
                const listItemsHTML = p.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n                            ');
                return `<ul>
                            ${listItemsHTML}
                        </ul>`;
              } else {
                return `<p>${escapeHtml(p.content)}</p>`;
              }
            })
            .join('\n                    ');

          return `<article>
                <h3>${escapeHtml(article.title)}</h3>
                <div class="article-body">
                    ${paragraphsHTML}
                </div>
            </article>`;
        })
        .join('\n            ');

      return `<section class="main-section">
            <h2>${escapeHtml(section.category)}</h2>
            ${articlesHTML}
        </section>`;
    })
    .join('\n        ');

  return `<main>
        ${sectionsHTML}
    </main>`;
}

/**
 * HTML 이스케이프 헬퍼 함수
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
