import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { pgTable, varchar, integer, timestamp, text } from 'drizzle-orm/pg-core';
import { eq, desc } from 'drizzle-orm';

// Schema
export const conversions = pgTable('conversions', {
  id: varchar('id', { length: 21 }).primaryKey(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileSize: integer('file_size').notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  inputUrl: text('input_url'),
  outputUrl: text('output_url'),
  method: varchar('method', { length: 20 }),
  tokens: integer('tokens'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export type Conversion = typeof conversions.$inferSelect;
export type NewConversion = typeof conversions.$inferInsert;

// 로컬 개발용 메모리 데이터베이스
const localDb = new Map<string, Conversion>();
const isLocal = !process.env.POSTGRES_URL;

// Database client (프로덕션용)
let db: ReturnType<typeof drizzle> | null = null;
if (!isLocal) {
  db = drizzle(sql);
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
