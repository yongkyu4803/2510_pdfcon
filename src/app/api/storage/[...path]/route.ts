import { NextRequest, NextResponse } from 'next/server';
import { getFromLocalStorage } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const fileName = path.join('/');

  // 로컬 스토리지에서 파일 가져오기
  const buffer = await getFromLocalStorage(fileName);

  if (!buffer) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  // MIME 타입 결정
  const mimeType = fileName.endsWith('.pdf') ? 'application/pdf' : 'text/html; charset=utf-8';

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': mimeType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
