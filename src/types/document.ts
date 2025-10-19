/**
 * TypeScript 타입 정의 - PDF 문서의 구조화된 데이터 표현
 *
 * 이 파일은 Gemini API로부터 받은 JSON 응답의 타입을 정의합니다.
 */

/**
 * 단락 타입
 * - text: 일반 텍스트 단락
 * - list: 리스트 항목
 * - quote: 인용문
 */
export type ParagraphType = 'text' | 'list' | 'quote';

/**
 * 단락 구조
 */
export interface Paragraph {
  /** 단락 타입 */
  type: ParagraphType;
  /** 단락 내용 (특수기호 포함) */
  content: string;
  /** 리스트일 경우 하위 항목들 */
  items?: string[];
}

/**
 * 본문 기사 구조
 */
export interface ContentArticle {
  /** 기사 소제목 (특수기호 포함: <>, ▲, □, - 등) */
  title: string;
  /** 기사 본문 단락들 */
  paragraphs: Paragraph[];
}

/**
 * 본문 섹션 (카테고리별)
 */
export interface ContentSection {
  /** 섹션 카테고리명 (예: "국내 정치", "북한", "미국") */
  category: string;
  /** 해당 카테고리의 기사들 */
  articles: ContentArticle[];
}

/**
 * 요지 기사 구조 (3단계 중 2단계)
 */
export interface SummaryArticle {
  /** 기사 제목 (○ 기호 포함) */
  title: string;
  /** 기사 요약 내용 (- 기호 포함, null 가능) */
  summary: string | null;
}

/**
 * 요지 카테고리 구조 (3단계 중 1단계)
 */
export interface SummaryCategory {
  /** 카테고리명 (□ 기호 포함) */
  category: string;
  /** 해당 카테고리의 기사들 */
  articles: SummaryArticle[];
}

/**
 * 문서 헤더 정보
 */
export interface DocumentHeader {
  /** 문서 제목 */
  title: string;
  /** 문서 날짜 (예: "2025년 1월 15일") */
  date?: string;
  /** 문서 부제목 또는 설명 */
  subtitle?: string;
}

/**
 * 메타데이터
 */
export interface DocumentMetadata {
  /** 원본 PDF 파일명 */
  originalFileName: string;
  /** 처리 시간 (ISO 8601 형식) */
  processedAt: string;
  /** 사용된 AI 모델 */
  model: string;
  /** 총 페이지 수 */
  totalPages?: number;
  /** 문서 언어 */
  language?: string;
}

/**
 * 파싱된 문서 전체 구조
 *
 * 이 타입은 Gemini API로부터 받은 JSON 응답의 최상위 구조입니다.
 */
export interface ParsedDocument {
  /** 문서 헤더 정보 */
  header: DocumentHeader;
  /** 요지 섹션 (3단계 계층 구조) */
  summary: SummaryCategory[];
  /** 본문 섹션 (카테고리별 기사들) */
  content: ContentSection[];
  /** 메타데이터 */
  metadata: DocumentMetadata;
}

/**
 * 데이터베이스에 저장될 문서 데이터
 * ParsedDocument에 추가 DB 관련 필드를 포함
 */
export interface DocumentData extends ParsedDocument {
  /** DB 레코드 ID */
  id: string;
  /** 변환 ID (conversions 테이블과의 관계) */
  conversionId: string;
  /** 생성 시간 */
  createdAt: Date;
  /** 수정 시간 */
  updatedAt: Date;
}

/**
 * HTML 생성 옵션
 */
export interface HtmlGenerationOptions {
  /** CSS 스타일 포함 여부 */
  includeStyles?: boolean;
  /** 다크모드 지원 여부 */
  darkMode?: boolean;
  /** 인쇄 최적화 여부 */
  printOptimized?: boolean;
  /** 커스텀 CSS 클래스 접두사 */
  classPrefix?: string;
}
