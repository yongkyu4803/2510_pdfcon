import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { convertPDFToHTMLWithGemini } from '@/lib/gemini';
import { uploadPDF, uploadHTML } from '@/lib/storage';
import { createConversion, completeConversion, failConversion } from '@/lib/db';

export const maxDuration = 60; // 최대 60초

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }

    // 파일 검증
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'PDF 파일만 업로드 가능합니다.' }, { status: 400 });
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '파일 크기는 50MB를 초과할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 고유 ID 생성
    const conversionId = nanoid();

    // 1. PDF 업로드
    const pdfBuffer = Buffer.from(await file.arrayBuffer());
    const { url: inputUrl } = await uploadPDF(file);

    // 2. DB에 변환 작업 생성
    await createConversion({
      id: conversionId,
      fileName: file.name,
      fileSize: file.size,
      status: 'processing',
      inputUrl,
    });

    // 3. PDF → HTML 변환 (Gemini API 사용)
    let htmlResult;
    try {
      htmlResult = await convertPDFToHTMLWithGemini(pdfBuffer, file.name);
    } catch (error) {
      await failConversion(conversionId);
      throw error;
    }

    // 4. HTML 업로드
    const { url: outputUrl } = await uploadHTML(htmlResult.html, file.name);

    // 5. 변환 완료 처리
    const conversion = await completeConversion(
      conversionId,
      outputUrl,
      htmlResult.method,
      htmlResult.tokens
    );

    return NextResponse.json({
      success: true,
      conversionId,
      outputUrl,
      conversion,
    });
  } catch (error) {
    console.error('Gemini conversion error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '변환 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
