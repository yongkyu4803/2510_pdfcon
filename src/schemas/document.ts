/**
 * Zod 스키마 정의 - 런타임 검증 및 Gemini JSON 모드용
 *
 * 이 파일은 Gemini API의 responseSchema에 사용되며,
 * 런타임에서 JSON 응답을 검증하는 역할을 합니다.
 */

import { z } from 'zod';

/**
 * 단락 타입 스키마
 */
export const ParagraphTypeSchema = z.enum(['text', 'list', 'quote']);

/**
 * 단락 스키마
 */
export const ParagraphSchema = z.object({
  type: ParagraphTypeSchema,
  content: z.string().min(1, '단락 내용은 필수입니다'),
  items: z.array(z.string()).nullable().optional(), // null 또는 undefined 허용
});

/**
 * 본문 기사 스키마
 */
export const ContentArticleSchema = z.object({
  title: z.string().min(1, '기사 제목은 필수입니다'),
  paragraphs: z.array(ParagraphSchema), // 빈 배열 허용
});

/**
 * 본문 섹션 스키마
 */
export const ContentSectionSchema = z.object({
  category: z.string().min(1, '카테고리명은 필수입니다'),
  articles: z.array(ContentArticleSchema), // 빈 배열 허용
});

/**
 * 요지 기사 스키마
 */
export const SummaryArticleSchema = z.object({
  title: z.string().min(1, '기사 제목은 필수입니다 (○ 기호 포함)'),
  summary: z.string().nullable().default(''), // 요약이 없는 기사도 허용 (null 가능)
});

/**
 * 요지 카테고리 스키마
 */
export const SummaryCategorySchema = z.object({
  category: z.string().min(1, '카테고리명은 필수입니다 (□ 기호 포함)'),
  articles: z.array(SummaryArticleSchema), // 빈 배열 허용
});

/**
 * 문서 헤더 스키마
 */
export const DocumentHeaderSchema = z.object({
  title: z.string().min(1, '문서 제목은 필수입니다'),
  date: z.string().optional(),
  subtitle: z.string().optional(),
});

/**
 * 메타데이터 스키마
 */
export const DocumentMetadataSchema = z.object({
  originalFileName: z.string().min(1, '원본 파일명은 필수입니다'),
  processedAt: z.string().datetime({ message: 'ISO 8601 형식의 날짜가 필요합니다' }),
  model: z.string().min(1, '모델명은 필수입니다'),
  totalPages: z.number().int().positive().optional(),
  language: z.string().optional(),
});

/**
 * 파싱된 문서 스키마
 *
 * 이 스키마는 Gemini API의 responseSchema에 직접 사용됩니다.
 */
export const ParsedDocumentSchema = z.object({
  header: DocumentHeaderSchema,
  summary: z.array(SummaryCategorySchema), // 빈 배열 허용
  content: z.array(ContentSectionSchema), // 빈 배열 허용
  metadata: DocumentMetadataSchema,
});

/**
 * 데이터베이스 문서 데이터 스키마
 */
export const DocumentDataSchema = ParsedDocumentSchema.extend({
  id: z.string().uuid({ message: 'UUID 형식이 필요합니다' }),
  conversionId: z.string().min(1, '변환 ID는 필수입니다'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * HTML 생성 옵션 스키마
 */
export const HtmlGenerationOptionsSchema = z.object({
  includeStyles: z.boolean().default(true),
  darkMode: z.boolean().default(true),
  printOptimized: z.boolean().default(true),
  classPrefix: z.string().default('doc'),
});

/**
 * Gemini JSON 모드용 스키마 변환
 *
 * Zod 스키마를 Gemini API의 responseSchema 형식으로 변환합니다.
 */
export function zodToGeminiSchema(zodSchema: z.ZodType): any {
  // Gemini는 JSON Schema 형식을 사용합니다
  // zod-to-json-schema 라이브러리를 사용하여 변환
  // 현재는 수동으로 정의하거나, 라이브러리 추가 필요

  // 간단한 수동 변환 (필요시 zod-to-json-schema 라이브러리 추가)
  return {
    type: 'object',
    properties: {
      header: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          date: { type: 'string' },
          subtitle: { type: 'string' },
        },
        required: ['title'],
      },
      summary: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            category: { type: 'string' },
            articles: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  summary: { type: 'string' },
                },
                required: ['title', 'summary'],
              },
            },
          },
          required: ['category', 'articles'],
        },
      },
      content: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            category: { type: 'string' },
            articles: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  paragraphs: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        type: { type: 'string', enum: ['text', 'list', 'quote'] },
                        content: { type: 'string' },
                        items: { type: 'array', items: { type: 'string' } },
                      },
                      required: ['type', 'content'],
                    },
                  },
                },
                required: ['title', 'paragraphs'],
              },
            },
          },
          required: ['category', 'articles'],
        },
      },
      metadata: {
        type: 'object',
        properties: {
          originalFileName: { type: 'string' },
          processedAt: { type: 'string' },
          model: { type: 'string' },
          totalPages: { type: 'number' },
          language: { type: 'string' },
        },
        required: ['originalFileName', 'processedAt', 'model'],
      },
    },
    required: ['header', 'summary', 'content', 'metadata'],
  };
}

/**
 * 검증 헬퍼 함수들
 */

/**
 * ParsedDocument 검증
 */
export function validateParsedDocument(data: unknown) {
  return ParsedDocumentSchema.parse(data);
}

/**
 * ParsedDocument 안전 검증 (에러 반환)
 */
export function safeParseParsedDocument(data: unknown) {
  return ParsedDocumentSchema.safeParse(data);
}

/**
 * DocumentData 검증
 */
export function validateDocumentData(data: unknown) {
  return DocumentDataSchema.parse(data);
}

/**
 * DocumentData 안전 검증 (에러 반환)
 */
export function safeParseDocumentData(data: unknown) {
  return DocumentDataSchema.safeParse(data);
}

// ============================================================================
// 국내 정책보도 전용 스키마
// ============================================================================

/**
 * 국내 정책보도 - 세부 항목 스키마
 */
export const DomesticDetailItemSchema = z.object({
  content: z.string().min(1, '세부 항목 내용은 필수입니다'),
});

/**
 * 국내 정책보도 - 종합 요약 카테고리 스키마
 */
export const DomesticSummaryCategorySchema = z.object({
  category: z.string().min(1, '카테고리명은 필수입니다 (○ 기호 포함)'),
  items: z.array(DomesticDetailItemSchema),
});

/**
 * 국내 정책보도 - 사설 요약 카테고리 스키마
 */
export const DomesticEditorialCategorySchema = z.object({
  category: z.string().min(1, '사설 카테고리명은 필수입니다'),
  content: z.string().min(1, '사설 내용은 필수입니다'),
});

/**
 * 국내 정책보도 - 문서 헤더 스키마
 */
export const DomesticDocumentHeaderSchema = z.object({
  title: z.string().min(1, '문서 제목은 필수입니다'),
  meta: z.array(z.string()),
});

/**
 * 국내 정책보도 - 파싱된 문서 스키마
 */
export const DomesticParsedDocumentSchema = z.object({
  header: DomesticDocumentHeaderSchema,
  summary: z.array(DomesticSummaryCategorySchema),
  editorials: z.array(DomesticEditorialCategorySchema),
  content: z.array(ContentSectionSchema),
  metadata: DocumentMetadataSchema,
});

/**
 * 국내 정책보도 문서 검증
 */
export function validateDomesticParsedDocument(data: unknown) {
  return DomesticParsedDocumentSchema.parse(data);
}

/**
 * 국내 정책보도 문서 안전 검증 (에러 반환)
 */
export function safeParseDomesticParsedDocument(data: unknown) {
  return DomesticParsedDocumentSchema.safeParse(data);
}
