'use client';

import { useState, useEffect } from 'react';
import { Download, Copy, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import DOMPurify from 'isomorphic-dompurify';

interface HTMLViewerProps {
  htmlContent: string;
  fileName?: string;
  shareUrl?: string;
}

export function HTMLViewer({ htmlContent, fileName = 'converted', shareUrl }: HTMLViewerProps) {
  const [sanitizedHTML, setSanitizedHTML] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // 일일외신 HTML 형식: 전체 HTML 문서 허용 (style, meta 등 포함)
    const clean = DOMPurify.sanitize(htmlContent, {
      WHOLE_DOCUMENT: true,
      ALLOWED_TAGS: [
        'html',
        'head',
        'body',
        'meta',
        'title',
        'style',
        'link',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'a',
        'ul',
        'ol',
        'li',
        'strong',
        'em',
        'br',
        'div',
        'span',
        'section',
        'article',
        'header',
        'footer',
        'main',
        'blockquote',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
      ],
      ALLOWED_ATTR: ['href', 'class', 'id', 'style', 'charset', 'name', 'content', 'rel', 'lang'],
    });
    setSanitizedHTML(clean);
  }, [htmlContent]);

  const handleDownload = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('HTML 파일이 다운로드되었습니다.');
  };

  const handleCopyUrl = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast.success('URL이 클립보드에 복사되었습니다.');
    }
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Card className="overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <h3 className="font-medium">변환 결과</h3>
        <div className="flex gap-2">
          {shareUrl && (
            <Button variant="outline" size="sm" onClick={handleCopyUrl}>
              <Copy className="h-4 w-4 mr-2" />
              URL 복사
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleFullscreen}>
            <Maximize2 className="h-4 w-4 mr-2" />
            전체화면
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            다운로드
          </Button>
        </div>
      </div>

      {/* HTML Content */}
      <div
        className={`
          ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'relative'}
        `}
      >
        {isFullscreen && (
          <div className="absolute top-4 right-4 z-10">
            <Button variant="outline" size="sm" onClick={handleFullscreen}>
              닫기
            </Button>
          </div>
        )}
        <iframe
          srcDoc={sanitizedHTML}
          className={`w-full border-0 ${isFullscreen ? 'h-screen' : 'h-[600px]'}`}
          sandbox="allow-same-origin"
          title="Converted HTML Preview"
        />
      </div>
    </Card>
  );
}
