import { createClient } from '@supabase/supabase-js';
import type { ParsedDocument } from '@/types/document';

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Types
export interface Conversion {
  id: string;
  fileName: string;
  fileSize: number;
  status: string;
  inputUrl: string | null;
  outputUrl: string | null;
  method: string | null;
  tokens: number | null;
  hasStructuredData: boolean;
  createdAt: Date;
  completedAt: Date | null;
}

export type NewConversion = Omit<Conversion, 'createdAt' | 'completedAt'> & {
  createdAt?: Date;
  completedAt?: Date | null;
};

export interface DocumentData {
  id: string;
  conversionId: string;
  data: ParsedDocument;
  createdAt: Date;
  updatedAt: Date;
}

export type NewDocumentData = Omit<DocumentData, 'createdAt' | 'updatedAt'> & {
  createdAt?: Date;
  updatedAt?: Date;
};

// 로컬 메모리 DB
const localDb = new Map<string, Conversion>();
const localDocumentDb = new Map<string, DocumentData>();
const isLocal = !supabase;

if (supabase) {
  console.log('[DB] Using Supabase');
} else {
  console.log('[DB] Using local memory database');
}

// Helper: DB row to Conversion
function rowToConversion(row: any): Conversion {
  return {
    id: row.id,
    fileName: row.file_name,
    fileSize: row.file_size,
    status: row.status,
    inputUrl: row.input_url,
    outputUrl: row.output_url,
    method: row.method,
    tokens: row.tokens,
    hasStructuredData: row.has_structured_data,
    createdAt: new Date(row.created_at),
    completedAt: row.completed_at ? new Date(row.completed_at) : null,
  };
}

// Helper: Conversion to DB row
function conversionToRow(data: NewConversion) {
  return {
    id: data.id,
    file_name: data.fileName,
    file_size: data.fileSize,
    status: data.status,
    input_url: data.inputUrl || null,
    output_url: data.outputUrl || null,
    method: data.method || null,
    tokens: data.tokens || null,
    has_structured_data: data.hasStructuredData || false,
    created_at: data.createdAt ? data.createdAt.toISOString() : undefined,
    completed_at: data.completedAt ? data.completedAt.toISOString() : null,
  };
}

/**
 * 새 변환 작업 생성
 */
export async function createConversion(data: NewConversion): Promise<Conversion> {
  if (isLocal) {
    const conversion: Conversion = {
      ...data,
      createdAt: data.createdAt || new Date(),
      completedAt: data.completedAt || null,
      inputUrl: data.inputUrl || null,
      outputUrl: data.outputUrl || null,
      method: data.method || null,
      tokens: data.tokens || null,
      hasStructuredData: data.hasStructuredData || false,
    };
    localDb.set(conversion.id, conversion);
    console.log('[Local DB] Created conversion:', conversion.id);
    return conversion;
  }

  const { data: row, error } = await supabase!
    .from('pdfcon_conversions')
    .insert(conversionToRow(data))
    .select()
    .single();

  if (error) throw error;
  return rowToConversion(row);
}

/**
 * 변환 작업 조회
 */
export async function getConversion(id: string): Promise<Conversion | null> {
  if (isLocal) {
    return localDb.get(id) || null;
  }

  const { data, error } = await supabase!
    .from('pdfcon_conversions')
    .select()
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return rowToConversion(data);
}

/**
 * 변환 작업 업데이트
 */
export async function updateConversion(
  id: string,
  updates: Partial<NewConversion>
): Promise<Conversion> {
  if (isLocal) {
    const existing = localDb.get(id);
    if (!existing) {
      throw new Error('Conversion not found');
    }
    const updated = { ...existing, ...updates };
    localDb.set(id, updated);
    console.log('[Local DB] Updated conversion:', id);
    return updated;
  }

  const updateData: any = {};
  if (updates.fileName) updateData.file_name = updates.fileName;
  if (updates.fileSize) updateData.file_size = updates.fileSize;
  if (updates.status) updateData.status = updates.status;
  if (updates.inputUrl !== undefined) updateData.input_url = updates.inputUrl;
  if (updates.outputUrl !== undefined) updateData.output_url = updates.outputUrl;
  if (updates.method !== undefined) updateData.method = updates.method;
  if (updates.tokens !== undefined) updateData.tokens = updates.tokens;
  if (updates.hasStructuredData !== undefined)
    updateData.has_structured_data = updates.hasStructuredData;
  if (updates.completedAt !== undefined)
    updateData.completed_at = updates.completedAt ? updates.completedAt.toISOString() : null;

  const { data, error } = await supabase!
    .from('pdfcon_conversions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return rowToConversion(data);
}

/**
 * 최근 변환 목록 조회 (최대 30개)
 */
export async function getRecentConversions(limit = 30): Promise<Conversion[]> {
  if (isLocal) {
    return Array.from(localDb.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  const { data, error } = await supabase!
    .from('pdfcon_conversions')
    .select()
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data.map(rowToConversion);
}

/**
 * 변환 완료 처리
 */
export async function completeConversion(
  id: string,
  outputUrl: string,
  method: string,
  tokens?: number
): Promise<Conversion> {
  return updateConversion(id, {
    status: 'completed',
    outputUrl,
    method,
    tokens,
    completedAt: new Date(),
  });
}

/**
 * 변환 실패 처리
 */
export async function failConversion(id: string): Promise<Conversion> {
  return updateConversion(id, {
    status: 'failed',
    completedAt: new Date(),
  });
}

/**
 * 구조화된 문서 데이터 저장
 */
export async function saveDocumentData(data: NewDocumentData): Promise<DocumentData> {
  if (isLocal) {
    const doc: DocumentData = {
      ...data,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    };
    localDocumentDb.set(doc.id, doc);
    console.log('[Local DB] Saved document data:', doc.id);
    return doc;
  }

  const { data: row, error } = await supabase!
    .from('pdfcon_document_data')
    .insert({
      id: data.id,
      conversion_id: data.conversionId,
      data: data.data,
      created_at: data.createdAt ? data.createdAt.toISOString() : undefined,
      updated_at: data.updatedAt ? data.updatedAt.toISOString() : undefined,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: row.id,
    conversionId: row.conversion_id,
    data: row.data as ParsedDocument,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * 구조화된 문서 데이터 조회 (conversion ID로)
 */
export async function getDocumentDataByConversionId(
  conversionId: string
): Promise<DocumentData | null> {
  if (isLocal) {
    const docs = Array.from(localDocumentDb.values());
    return docs.find((doc) => doc.conversionId === conversionId) || null;
  }

  const { data, error } = await supabase!
    .from('pdfcon_document_data')
    .select()
    .eq('conversion_id', conversionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return {
    id: data.id,
    conversionId: data.conversion_id,
    data: data.data as ParsedDocument,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * 데이터베이스 통계 정보
 */
export interface DatabaseStats {
  totalConversions: number;
  completedConversions: number;
  failedConversions: number;
  processingConversions: number;
  totalDocuments: number;
  totalTokens: number;
  totalFileSize: number;
  averageFileSize: number;
  statusBreakdown: Record<string, number>;
  methodBreakdown: Record<string, number>;
  recentActivity: {
    last24h: number;
    last7days: number;
    last30days: number;
  };
}

/**
 * 데이터베이스 통계 조회
 */
export async function getDatabaseStats(): Promise<DatabaseStats> {
  if (isLocal) {
    const conversions = Array.from(localDb.values());
    const documents = Array.from(localDocumentDb.values());

    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const statusBreakdown: Record<string, number> = {};
    const methodBreakdown: Record<string, number> = {};
    let totalTokens = 0;
    let totalFileSize = 0;

    conversions.forEach((conv) => {
      statusBreakdown[conv.status] = (statusBreakdown[conv.status] || 0) + 1;
      if (conv.method) {
        methodBreakdown[conv.method] = (methodBreakdown[conv.method] || 0) + 1;
      }
      totalTokens += conv.tokens || 0;
      totalFileSize += conv.fileSize;
    });

    return {
      totalConversions: conversions.length,
      completedConversions: conversions.filter((c) => c.status === 'completed').length,
      failedConversions: conversions.filter((c) => c.status === 'failed').length,
      processingConversions: conversions.filter((c) => c.status === 'processing').length,
      totalDocuments: documents.length,
      totalTokens,
      totalFileSize,
      averageFileSize: conversions.length > 0 ? totalFileSize / conversions.length : 0,
      statusBreakdown,
      methodBreakdown,
      recentActivity: {
        last24h: conversions.filter((c) => now - c.createdAt.getTime() < day).length,
        last7days: conversions.filter((c) => now - c.createdAt.getTime() < 7 * day).length,
        last30days: conversions.filter((c) => now - c.createdAt.getTime() < 30 * day).length,
      },
    };
  }

  // Supabase에서 통계 조회
  const { data: conversions, error: convError } = await supabase!
    .from('pdfcon_conversions')
    .select('status, method, tokens, file_size, created_at');

  if (convError) throw convError;

  const { count: docCount, error: docError } = await supabase!
    .from('pdfcon_document_data')
    .select('*', { count: 'exact', head: true });

  if (docError) throw docError;

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const statusBreakdown: Record<string, number> = {};
  const methodBreakdown: Record<string, number> = {};
  let totalTokens = 0;
  let totalFileSize = 0;

  conversions.forEach((conv: any) => {
    statusBreakdown[conv.status] = (statusBreakdown[conv.status] || 0) + 1;
    if (conv.method) {
      methodBreakdown[conv.method] = (methodBreakdown[conv.method] || 0) + 1;
    }
    totalTokens += conv.tokens || 0;
    totalFileSize += conv.file_size;
  });

  return {
    totalConversions: conversions.length,
    completedConversions: conversions.filter((c: any) => c.status === 'completed').length,
    failedConversions: conversions.filter((c: any) => c.status === 'failed').length,
    processingConversions: conversions.filter((c: any) => c.status === 'processing').length,
    totalDocuments: docCount || 0,
    totalTokens,
    totalFileSize,
    averageFileSize: conversions.length > 0 ? totalFileSize / conversions.length : 0,
    statusBreakdown,
    methodBreakdown,
    recentActivity: {
      last24h: conversions.filter((c: any) => now - new Date(c.created_at).getTime() < day).length,
      last7days: conversions.filter((c: any) => now - new Date(c.created_at).getTime() < 7 * day).length,
      last30days: conversions.filter((c: any) => now - new Date(c.created_at).getTime() < 30 * day).length,
    },
  };
}

/**
 * 구조화된 문서 데이터 조회 (document ID로)
 */
export async function getDocumentData(id: string): Promise<DocumentData | null> {
  if (isLocal) {
    return localDocumentDb.get(id) || null;
  }

  const { data, error } = await supabase!
    .from('pdfcon_document_data')
    .select()
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return {
    id: data.id,
    conversionId: data.conversion_id,
    data: data.data as ParsedDocument,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * 구조화된 문서 데이터 업데이트
 */
export async function updateDocumentData(
  id: string,
  updates: Partial<Pick<DocumentData, 'data'>>
): Promise<DocumentData> {
  if (isLocal) {
    const existing = localDocumentDb.get(id);
    if (!existing) {
      throw new Error('Document data not found');
    }
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    localDocumentDb.set(id, updated);
    console.log('[Local DB] Updated document data:', id);
    return updated;
  }

  const { data, error } = await supabase!
    .from('pdfcon_document_data')
    .update({
      data: updates.data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    conversionId: data.conversion_id,
    data: data.data as ParsedDocument,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

// Export types
export type { Conversion as ConversionType };
