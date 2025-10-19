'use client';

import { useState } from 'react';
import { Download, FileJson, FileCode, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import type { ParsedDocument } from '@/types/document';
import Link from 'next/link';

interface JsonViewerProps {
  data: ParsedDocument;
  conversionId: string;
  fileName?: string;
}

export function JsonViewer({ data, conversionId, fileName = 'document' }: JsonViewerProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['header']));

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleDownloadJson = () => {
    const jsonString = JSON.stringify(data, null, 2);
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

  const isExpanded = (sectionId: string) => expandedSections.has(sectionId);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileJson className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">구조화된 JSON 데이터</h3>
          </div>
          <div className="flex gap-2">
            <Link href={`/view/${conversionId}`}>
              <Button variant="outline" size="sm">
                <FileCode className="h-4 w-4 mr-2" />
                HTML 뷰
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleDownloadJson}>
              <Download className="h-4 w-4 mr-2" />
              JSON 다운로드
            </Button>
          </div>
        </div>
      </Card>

      {/* Header Section */}
      <Card className="overflow-hidden">
        <button
          onClick={() => toggleSection('header')}
          className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            {isExpanded('header') ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <h4 className="font-semibold">문서 헤더</h4>
          </div>
        </button>
        {isExpanded('header') && (
          <div className="p-4 space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">제목:</span>
                <p className="mt-1">{data.header.title}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">날짜:</span>
                <p className="mt-1">{data.header.date}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">호수:</span>
                <p className="mt-1">{data.header.issue}</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Summary Section */}
      {data.summary && data.summary.length > 0 && (
        <Card className="overflow-hidden">
          <button
            onClick={() => toggleSection('summary')}
            className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              {isExpanded('summary') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <h4 className="font-semibold">요지 ({data.summary.length}개 카테고리)</h4>
            </div>
          </button>
          {isExpanded('summary') && (
            <div className="p-4 space-y-4">
              {data.summary.map((category, catIndex) => (
                <div key={`summary-${catIndex}`} className="border-l-4 border-blue-500 pl-4">
                  <h5 className="font-medium text-blue-900 mb-2">{category.category}</h5>
                  <div className="space-y-2">
                    {category.articles.map((article, artIndex) => (
                      <div key={`summary-article-${catIndex}-${artIndex}`} className="bg-gray-50 p-3 rounded">
                        <h6 className="font-medium text-sm mb-1">{article.title}</h6>
                        {article.summary && (
                          <p className="text-sm text-gray-700 whitespace-pre-line">{article.summary}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Content Section */}
      {data.content && data.content.length > 0 && (
        <Card className="overflow-hidden">
          <button
            onClick={() => toggleSection('content')}
            className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              {isExpanded('content') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <h4 className="font-semibold">본문 ({data.content.length}개 섹션)</h4>
            </div>
          </button>
          {isExpanded('content') && (
            <div className="p-4 space-y-6">
              {data.content.map((section, secIndex) => (
                <div key={`content-${secIndex}`} className="border-l-4 border-green-500 pl-4">
                  <h5 className="font-medium text-green-900 mb-3">{section.category}</h5>
                  <div className="space-y-4">
                    {section.articles.map((article, artIndex) => (
                      <Card key={`content-article-${secIndex}-${artIndex}`} className="p-4">
                        <h6 className="font-medium mb-3">{article.title}</h6>
                        <div className="space-y-2">
                          {article.paragraphs.map((para, paraIndex) => (
                            <div key={`para-${secIndex}-${artIndex}-${paraIndex}`}>
                              {para.type === 'text' && (
                                <p className="text-sm text-gray-700">{para.content}</p>
                              )}
                              {para.type === 'heading' && (
                                <h6 className="font-semibold text-sm mt-2">{para.content}</h6>
                              )}
                              {para.type === 'list' && para.items && para.items.length > 0 && (
                                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                  {para.items.map((item, itemIndex) => (
                                    <li key={`item-${secIndex}-${artIndex}-${paraIndex}-${itemIndex}`}>
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Metadata Section */}
      <Card className="overflow-hidden">
        <button
          onClick={() => toggleSection('metadata')}
          className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            {isExpanded('metadata') ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <h4 className="font-semibold">메타데이터</h4>
          </div>
        </button>
        {isExpanded('metadata') && (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">총 페이지:</span>
                <p className="mt-1">{data.metadata.totalPages}페이지</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">언어:</span>
                <p className="mt-1">{data.metadata.language}</p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
