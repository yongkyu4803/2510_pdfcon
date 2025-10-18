/**
 * JSON → HTML 변환기
 * ParsedDocument를 구조화된 HTML로 변환
 */

import type { ParsedDocument, HtmlGenerationOptions } from '@/types/document';

/**
 * 기본 옵션
 */
const DEFAULT_OPTIONS: Required<HtmlGenerationOptions> = {
  includeStyles: true,
  darkMode: true,
  printOptimized: true,
  classPrefix: 'doc',
};

/**
 * HTML 이스케이프 (XSS 방지)
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * CSS 스타일 생성
 */
function generateCSS(prefix: string): string {
  return `
<style>
  :root {
    --primary-color: #3b82f6;
    --secondary-color: #8b5cf6;
    --bg-light: #f8fafc;
    --bg-dark: #1e293b;
    --text-light: #0f172a;
    --text-dark: #f1f5f9;
    --border-light: #e2e8f0;
    --border-dark: #334155;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    line-height: 1.6;
    color: var(--text-light);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem;
  }

  .${prefix}-container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    padding: 3rem;
  }

  .${prefix}-header {
    text-align: center;
    margin-bottom: 3rem;
    padding-bottom: 2rem;
    border-bottom: 3px solid var(--primary-color);
  }

  .${prefix}-header h1 {
    font-size: 2.5rem;
    color: var(--primary-color);
    margin-bottom: 1rem;
    font-weight: 700;
  }

  .${prefix}-meta {
    font-size: 1.1rem;
    color: #64748b;
    margin-top: 0.5rem;
  }

  .${prefix}-summary {
    background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
    border-left: 4px solid var(--secondary-color);
    border-radius: 8px;
    padding: 2rem;
    margin-bottom: 3rem;
  }

  .${prefix}-summary h2 {
    font-size: 1.8rem;
    color: var(--secondary-color);
    margin-bottom: 1.5rem;
    font-weight: 600;
  }

  .${prefix}-summary ul {
    list-style: none;
    padding-left: 0;
  }

  .${prefix}-summary .category {
    font-size: 1.2rem;
    font-weight: 600;
    color: #1e293b;
    margin: 1.5rem 0 1rem 0;
    padding: 0.5rem;
    background: linear-gradient(90deg, #3b82f620 0%, transparent 100%);
    border-radius: 4px;
  }

  .${prefix}-summary .article-title {
    font-size: 1.05rem;
    font-weight: 500;
    color: #334155;
    margin: 0.8rem 0 0.5rem 1.5rem;
  }

  .${prefix}-summary .article-summary {
    font-size: 0.95rem;
    color: #64748b;
    margin: 0.3rem 0 0.3rem 3rem;
    line-height: 1.5;
  }

  main {
    margin-top: 3rem;
  }

  .${prefix}-main-section {
    margin-bottom: 3rem;
  }

  .${prefix}-main-section h2 {
    font-size: 1.8rem;
    color: var(--primary-color);
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e2e8f0;
    font-weight: 600;
  }

  article {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 8px;
    border-left: 3px solid #cbd5e1;
  }

  article h3 {
    font-size: 1.3rem;
    color: #1e293b;
    margin-bottom: 1rem;
    font-weight: 600;
  }

  article p {
    font-size: 1rem;
    line-height: 1.7;
    color: #475569;
    margin-bottom: 0.8rem;
  }

  blockquote {
    border-left: 4px solid #94a3b8;
    padding-left: 1rem;
    margin: 1rem 0;
    color: #64748b;
    font-style: italic;
  }

  /* 다크모드 */
  @media (prefers-color-scheme: dark) {
    body {
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
    }

    .${prefix}-container {
      background: var(--bg-dark);
      color: var(--text-dark);
    }

    .${prefix}-header h1 {
      color: #60a5fa;
    }

    .${prefix}-summary {
      background: linear-gradient(135deg, #1e40af15 0%, #7c3aed15 100%);
      border-left-color: #a78bfa;
    }

    .${prefix}-summary h2 {
      color: #a78bfa;
    }

    .${prefix}-summary .category {
      color: #f1f5f9;
      background: linear-gradient(90deg, #60a5fa20 0%, transparent 100%);
    }

    .${prefix}-summary .article-title {
      color: #cbd5e1;
    }

    .${prefix}-summary .article-summary {
      color: #94a3b8;
    }

    .${prefix}-main-section h2 {
      color: #60a5fa;
      border-bottom-color: #334155;
    }

    article {
      background: #0f172a;
      border-left-color: #475569;
    }

    article h3 {
      color: #f1f5f9;
    }

    article p {
      color: #cbd5e1;
    }

    blockquote {
      border-left-color: #64748b;
      color: #94a3b8;
    }
  }

  /* 인쇄 최적화 */
  @media print {
    body {
      background: white;
      padding: 0;
    }

    .${prefix}-container {
      box-shadow: none;
      padding: 1rem;
    }

    article {
      page-break-inside: avoid;
    }
  }

  /* 반응형 */
  @media (max-width: 768px) {
    body {
      padding: 1rem;
    }

    .${prefix}-container {
      padding: 1.5rem;
    }

    .${prefix}-header h1 {
      font-size: 1.8rem;
    }

    .${prefix}-summary,
    .${prefix}-main-section h2 {
      font-size: 1.3rem;
    }
  }
</style>
`;
}

/**
 * ParsedDocument → HTML 변환
 */
export function generateHTML(
  doc: ParsedDocument,
  options: HtmlGenerationOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const prefix = opts.classPrefix;

  // HTML 구조 생성
  const parts: string[] = [];

  // DOCTYPE 및 HTML 헤드
  parts.push('<!DOCTYPE html>');
  parts.push('<html lang="ko">');
  parts.push('<head>');
  parts.push('  <meta charset="UTF-8">');
  parts.push('  <meta name="viewport" content="width=device-width, initial-scale=1.0">');
  parts.push(`  <title>${escapeHtml(doc.header.title)}</title>`);
  parts.push(
    '  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap" rel="stylesheet">'
  );

  // CSS 포함
  if (opts.includeStyles) {
    parts.push(generateCSS(prefix));
  }

  parts.push('</head>');
  parts.push('<body>');
  parts.push(`  <div class="${prefix}-container">`);

  // 헤더
  parts.push(`    <header class="${prefix}-header">`);
  parts.push(`      <h1>${escapeHtml(doc.header.title)}</h1>`);
  if (doc.header.date || doc.header.subtitle) {
    const metaText = [doc.header.date, doc.header.subtitle].filter(Boolean).join(' | ');
    parts.push(`      <p class="${prefix}-meta">${escapeHtml(metaText)}</p>`);
  }
  parts.push('    </header>');

  // 요지 섹션
  if (doc.summary.length > 0) {
    parts.push(`    <section class="${prefix}-summary">`);
    parts.push('      <h2>요지</h2>');
    parts.push('      <ul>');

    for (const category of doc.summary) {
      parts.push(`        <li class="category">${escapeHtml(category.category)}</li>`);
      parts.push('        <ul>');

      for (const article of category.articles) {
        parts.push(`          <li class="article-title">${escapeHtml(article.title)}</li>`);
        // 요약은 여러 줄일 수 있으므로 줄바꿈을 <p>로 분리
        const summaryLines = article.summary.split('\n').filter((line) => line.trim());
        for (const line of summaryLines) {
          parts.push(`          <p class="article-summary">${escapeHtml(line)}</p>`);
        }
      }

      parts.push('        </ul>');
    }

    parts.push('      </ul>');
    parts.push('    </section>');
  }

  // 본문 섹션
  if (doc.content.length > 0) {
    parts.push('    <main>');

    for (const section of doc.content) {
      parts.push(`      <section class="${prefix}-main-section">`);
      parts.push(`        <h2>${escapeHtml(section.category)}</h2>`);

      for (const article of section.articles) {
        parts.push('        <article>');
        parts.push(`          <h3>${escapeHtml(article.title)}</h3>`);

        for (const para of article.paragraphs) {
          if (para.type === 'quote') {
            parts.push(`          <blockquote>${escapeHtml(para.content)}</blockquote>`);
          } else if (para.type === 'list' && para.items) {
            parts.push('          <ul>');
            for (const item of para.items) {
              parts.push(`            <li>${escapeHtml(item)}</li>`);
            }
            parts.push('          </ul>');
          } else {
            parts.push(`          <p>${escapeHtml(para.content)}</p>`);
          }
        }

        parts.push('        </article>');
      }

      parts.push('      </section>');
    }

    parts.push('    </main>');
  }

  // 푸터 (메타데이터)
  parts.push(`    <footer class="${prefix}-footer" style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 0.9rem;">`);
  parts.push(`      <p>생성: ${new Date(doc.metadata.processedAt).toLocaleString('ko-KR')}</p>`);
  parts.push(`      <p>모델: ${escapeHtml(doc.metadata.model)} | 원본: ${escapeHtml(doc.metadata.originalFileName)}</p>`);
  parts.push('    </footer>');

  parts.push('  </div>');
  parts.push('</body>');
  parts.push('</html>');

  return parts.join('\n');
}

/**
 * HTML 생성 (간단한 래퍼)
 */
export function convertDocumentToHTML(doc: ParsedDocument): string {
  return generateHTML(doc, {
    includeStyles: true,
    darkMode: true,
    printOptimized: true,
  });
}
