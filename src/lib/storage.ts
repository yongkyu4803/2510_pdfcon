import { put, del } from '@vercel/blob';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export interface UploadResult {
  url: string;
  pathname: string;
}

const isLocal = !process.env.BLOB_READ_WRITE_TOKEN;
const LOCAL_STORAGE_DIR = path.join(process.cwd(), '.local-storage');

/**
 * 로컬 환경에서 파일 저장 (개발용 - 파일 시스템 사용)
 */
async function saveToLocalStorage(fileName: string, buffer: Buffer): UploadResult {
  // .local-storage 디렉토리 생성
  const filePath = path.join(LOCAL_STORAGE_DIR, fileName);
  const dirPath = path.dirname(filePath);

  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
  }

  // 파일 시스템에 저장
  await writeFile(filePath, buffer);

  // 로컬 개발 환경에서는 API 라우트를 통해 제공
  return {
    url: `/api/storage/${fileName}`,
    pathname: fileName,
  };
}

/**
 * Vercel Blob에 파일 업로드 (프로덕션) 또는 로컬 스토리지 (개발)
 */
export async function uploadFile(
  file: Buffer | File,
  fileName: string,
  contentType: string
): Promise<UploadResult> {
  let buffer: Buffer;
  if (Buffer.isBuffer(file)) {
    buffer = file;
  } else {
    // File type
    const arrayBuffer = await (file as File).arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  }

  // 로컬 환경: 파일 시스템에 저장
  if (isLocal) {
    console.log('[Local Storage] Saving file:', fileName);
    return await saveToLocalStorage(fileName, buffer);
  }

  // 프로덕션 환경: Vercel Blob 사용
  try {
    const blob = await put(fileName, buffer, {
      access: 'public',
      contentType,
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
    };
  } catch (error) {
    console.error('Blob upload error:', error);
    throw new Error('파일 업로드 중 오류가 발생했습니다.');
  }
}

/**
 * Vercel Blob에서 파일 삭제
 */
export async function deleteFile(url: string): Promise<void> {
  if (isLocal) {
    // 로컬 환경에서는 삭제 불필요
    return;
  }

  try {
    await del(url);
  } catch (error) {
    console.error('Blob delete error:', error);
    // 삭제 실패는 치명적이지 않으므로 에러를 던지지 않음
  }
}

/**
 * PDF 파일 업로드
 */
export async function uploadPDF(file: File): Promise<UploadResult> {
  const timestamp = Date.now();
  const fileName = `pdfs/${timestamp}-${file.name}`;
  return uploadFile(file, fileName, 'application/pdf');
}

/**
 * HTML 파일 업로드
 */
export async function uploadHTML(html: string, originalFileName: string): Promise<UploadResult> {
  const timestamp = Date.now();
  const fileName = `html/${timestamp}-${originalFileName.replace('.pdf', '.html')}`;
  const buffer = Buffer.from(html, 'utf-8');
  return uploadFile(buffer, fileName, 'text/html');
}

/**
 * 로컬 스토리지에서 파일 가져오기 (개발용 - 파일 시스템에서 읽기)
 */
export async function getFromLocalStorage(fileName: string): Promise<Buffer | null> {
  const filePath = path.join(LOCAL_STORAGE_DIR, fileName);

  if (!existsSync(filePath)) {
    return null;
  }

  return await readFile(filePath);
}
