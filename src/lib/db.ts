import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { pgTable, varchar, integer, timestamp, text, jsonb, boolean } from 'drizzle-orm/pg-core';
import { eq, desc } from 'drizzle-orm';
import type { ParsedDocument } from '@/types/document';

// Schema (테이블명에 pdfcon_ 접두어 추가)
export const conversions = pgTable('pdfcon_conversions', {
  id: varchar('id', { length: 21 }).primaryKey(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileSize: integer('file_size').notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  inputUrl: text('input_url'),
  outputUrl: text('output_url'),
  method: varchar('method', { length: 20 }),
  tokens: integer('tokens'),
  hasStructuredData: boolean('has_structured_data').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export const documentData = pgTable('pdfcon_document_data', {
  id: varchar('id', { length: 21 }).primaryKey(),
  conversionId: varchar('conversion_id', { length: 21 })
    .notNull()
    .references(() => conversions.id, { onDelete: 'cascade' }),
  data: jsonb('data').$type<ParsedDocument>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Conversion = typeof conversions.$inferSelect;
export type NewConversion = typeof conversions.$inferInsert;
export type DocumentData = typeof documentData.$inferSelect;
export type NewDocumentData = typeof documentData.$inferInsert;

// 로컬 개발용 메모리 데이터베이스
const localDb = new Map<string, Conversion>();
const localDocumentDb = new Map<string, DocumentData>();
const isLocal = !process.env.DATABASE_URL;

// Database client (Supabase PostgreSQL)
let db: ReturnType<typeof drizzle> | null = null;
let client: ReturnType<typeof postgres> | null = null;

if (!isLocal) {
  client = postgres(process.env.DATABASE_URL!, {
    prepare: false, // Supabase에서 필요
  });
  db = drizzle(client);
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
    };
    localDb.set(conversion.id, conversion);
    console.log('[Local DB] Created conversion:', conversion.id);
    return conversion;
  }

  const [conversion] = await db!.insert(conversions).values(data).returning();
  return conversion;
}

/**
 * 변환 작업 조회
 */
export async function getConversion(id: string): Promise<Conversion | null> {
  if (isLocal) {
    return localDb.get(id) || null;
  }

  const [conversion] = await db!.select().from(conversions).where(eq(conversions.id, id));
  return conversion || null;
}

/**
 * 변환 작업 업데이트
 */
export async function updateConversion(
  id: string,
  data: Partial<NewConversion>
): Promise<Conversion> {
  if (isLocal) {
    const existing = localDb.get(id);
    if (!existing) {
      throw new Error('Conversion not found');
    }
    const updated = { ...existing, ...data };
    localDb.set(id, updated);
    console.log('[Local DB] Updated conversion:', id);
    return updated;
  }

  const [conversion] = await db!
    .update(conversions)
    .set(data)
    .where(eq(conversions.id, id))
    .returning();
  return conversion;
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

  return db!.select().from(conversions).orderBy(desc(conversions.createdAt)).limit(limit);
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

  const [doc] = await db!.insert(documentData).values(data).returning();
  return doc;
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

  const [doc] = await db!
    .select()
    .from(documentData)
    .where(eq(documentData.conversionId, conversionId));
  return doc || null;
}

/**
 * 구조화된 문서 데이터 조회 (document ID로)
 */
export async function getDocumentData(id: string): Promise<DocumentData | null> {
  if (isLocal) {
    return localDocumentDb.get(id) || null;
  }

  const [doc] = await db!.select().from(documentData).where(eq(documentData.id, id));
  return doc || null;
}

/**
 * 구조화된 문서 데이터 업데이트
 */
export async function updateDocumentData(
  id: string,
  data: Partial<Pick<DocumentData, 'data'>>
): Promise<DocumentData> {
  if (isLocal) {
    const existing = localDocumentDb.get(id);
    if (!existing) {
      throw new Error('Document data not found');
    }
    const updated = { ...existing, ...data, updatedAt: new Date() };
    localDocumentDb.set(id, updated);
    console.log('[Local DB] Updated document data:', id);
    return updated;
  }

  const [doc] = await db!
    .update(documentData)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(documentData.id, id))
    .returning();
  return doc;
}
