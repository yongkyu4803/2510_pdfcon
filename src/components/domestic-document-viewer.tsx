'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import type { DomesticParsedDocument } from '@/types/document';

interface DomesticDocumentViewerProps {
  document: DomesticParsedDocument;
  fileName?: string;
}

export function DomesticDocumentViewer({
  document,
  fileName = 'document',
}: DomesticDocumentViewerProps) {
  const handleDownload = () => {
    // JSON 다운로드
    const jsonString = JSON.stringify(document, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('JSON 파일이 다운로드되었습니다.');
  };

  return (
    <Card className="overflow-hidden shadow-2xl">
      {/* 툴바 - 외신 스타일 */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <h3 className="font-semibold text-gray-700">국내 정책보도</h3>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          다운로드
        </Button>
      </div>

      {/* 문서 내용 - 외신과 동일한 스타일 */}
      <div className="bg-white p-12">
        {/* 헤더 - 외신 스타일 */}
        <div className="text-center mb-12 pb-8 border-b-4 border-blue-500">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">{document.header.title}</h1>
          <div className="text-lg text-gray-600 space-y-1">
            {document.header.meta.map((meta, i) => (
              <p key={i}>{meta}</p>
            ))}
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="space-y-12">
          {/* 종합 요약 - 외신 스타일 */}
          {document.summary && document.summary.length > 0 && (
            <section className="bg-gradient-to-br from-purple-50 to-blue-50 border-l-4 border-purple-500 rounded-lg p-8 mb-12">
              <h2 className="text-3xl font-semibold text-purple-700 mb-6">종합 요약</h2>
              <ul className="space-y-4">
                {document.summary.map((category, idx) => (
                  <li key={idx}>
                    <div className="text-xl font-semibold text-gray-800 mb-3 pl-2 bg-gradient-to-r from-blue-100 to-transparent rounded py-2">
                      {category.category}
                    </div>
                    <ul className="space-y-2 pl-6">
                      {category.items.map((item, itemIdx) => (
                        <li
                          key={itemIdx}
                          className="text-base text-gray-700 leading-relaxed ml-6"
                        >
                          {item.content}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 사설 요약 - 외신 스타일 (국내 전용) */}
          {document.editorials && document.editorials.length > 0 && (
            <section className="bg-gradient-to-br from-amber-50 to-yellow-50 border-l-4 border-amber-500 rounded-lg p-8 mb-12">
              <h2 className="text-3xl font-semibold text-amber-700 mb-6">금일 사설</h2>
              <ul className="space-y-4">
                {document.editorials.map((editorial, idx) => (
                  <li
                    key={idx}
                    className="bg-white/60 rounded-lg p-4 border border-amber-200"
                  >
                    <span className="font-bold text-amber-900 text-lg mr-3">
                      {editorial.category}
                    </span>
                    <span className="text-gray-700 text-base leading-relaxed">{editorial.content}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 본문 - 외신 스타일 */}
          {document.content && document.content.length > 0 && (
            <div className="mt-12 space-y-12">
              {document.content.map((section, sectionIdx) => (
                <section key={sectionIdx} className="mb-12">
                  <h2 className="text-3xl font-semibold text-blue-600 mb-6 pb-2 border-b-2 border-gray-200">
                    {section.category}
                  </h2>
                  <div className="space-y-8">
                    {section.articles.map((article, articleIdx) => (
                      <article
                        key={articleIdx}
                        className="bg-gray-50 rounded-lg p-6 border-l-4 border-gray-300"
                      >
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                          {article.title}
                        </h3>
                        <div className="space-y-3 text-base text-gray-700 leading-relaxed">
                          {article.paragraphs.map((para, paraIdx) => {
                            if (para.type === 'quote') {
                              return (
                                <blockquote
                                  key={paraIdx}
                                  className="bg-amber-50 border-l-4 border-amber-400 px-4 py-3 italic text-gray-700 rounded"
                                >
                                  {para.content}
                                </blockquote>
                              );
                            } else if (para.type === 'list' && para.items) {
                              return (
                                <ul key={paraIdx} className="pl-6 space-y-2 list-disc">
                                  {para.items.map((item, itemIdx) => (
                                    <li key={itemIdx} className="text-gray-700">
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              );
                            } else {
                              return <p key={paraIdx} className="mb-3">{para.content}</p>;
                            }
                          })}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
