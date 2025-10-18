import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { convertPDFToJSONWithGemini } from '@/lib/gemini';
import { convertDocumentToHTML } from '@/lib/html-generator';
import { uploadPDF, uploadHTML } from '@/lib/storage';
import {
  createConversion,
  updateConversion,
  completeConversion,
  failConversion,
  saveDocumentData,
} from '@/lib/db';

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

    // 3. PDF → JSON 변환 (Gemini JSON 모드)
    let jsonResult;
    try {
      console.log('[API] Gemini JSON 변환 시작...');
      jsonResult = await convertPDFToJSONWithGemini(pdfBuffer, file.name);
      console.log('[API] Gemini JSON 변환 완료:', {
        summaryCount: jsonResult.data.summary.length,
        contentCount: jsonResult.data.content.length,
      });
    } catch (error) {
      console.error('[API] Gemini JSON 변환 실패:', error);
      await failConversion(conversionId);
      throw error;
    }

    // 4. 구조화된 데이터를 DB에 저장
    const documentId = nanoid();
    try {
      await saveDocumentData({
        id: documentId,
        conversionId,
        data: jsonResult.data,
      });
      console.log('[API] 구조화된 데이터 저장 완료:', documentId);
    } catch (error) {
      console.error('[API] 데이터 저장 실패:', error);
      await failConversion(conversionId);
      throw new Error('구조화된 데이터 저장 중 오류가 발생했습니다.');
    }

    // 5. JSON → HTML 변환
    let html: string;
    try {
      console.log('[API] HTML 생성 시작...');
      html = convertDocumentToHTML(jsonResult.data);
      console.log('[API] HTML 생성 완료:', html.length, 'bytes');
    } catch (error) {
      console.error('[API] HTML 생성 실패:', error);
      await failConversion(conversionId);
      throw new Error('HTML 생성 중 오류가 발생했습니다.');
    }

    // 6. HTML 업로드
    const { url: outputUrl } = await uploadHTML(html, file.name);

    // 7. 변환 완료 처리 (hasStructuredData 플래그 설정)
    const conversion = await completeConversion(
      conversionId,
      outputUrl,
      jsonResult.method,
      jsonResult.tokens
    );

    // hasStructuredData 플래그 업데이트
    await updateConversion(conversionId, { hasStructuredData: true });

    return NextResponse.json({
      success: true,
      conversionId,
      documentId,
      outputUrl,
      conversion,
      structured: true, // JSON 구조 사용 표시
    });
  } catch (error) {
    console.error('Gemini conversion error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '변환 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
