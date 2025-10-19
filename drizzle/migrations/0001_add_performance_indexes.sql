-- Migration: Add performance indexes for search optimization
-- Created: 2025-10-19

-- ====================================
-- pdfcon_conversions 테이블 인덱스
-- ====================================

-- 상태별 검색 최적화 (WHERE status = 'completed')
CREATE INDEX IF NOT EXISTS idx_conversions_status
ON pdfcon_conversions(status);

-- 최신순 정렬 최적화 (ORDER BY created_at DESC)
CREATE INDEX IF NOT EXISTS idx_conversions_created_at
ON pdfcon_conversions(created_at DESC);

-- JSON 데이터 필터링 최적화 (WHERE has_structured_data = true)
CREATE INDEX IF NOT EXISTS idx_conversions_has_json
ON pdfcon_conversions(has_structured_data)
WHERE has_structured_data = true;

-- 복합 인덱스: 상태 + 생성일 (가장 빈번한 쿼리 패턴)
CREATE INDEX IF NOT EXISTS idx_conversions_status_created
ON pdfcon_conversions(status, created_at DESC);

-- 파일명 검색 최적화 (LIKE 쿼리용)
CREATE INDEX IF NOT EXISTS idx_conversions_filename
ON pdfcon_conversions(file_name text_pattern_ops);

-- ====================================
-- pdfcon_document_data 테이블 인덱스
-- ====================================

-- conversion_id 외래키 조회 최적화
CREATE INDEX IF NOT EXISTS idx_document_conversion_id
ON pdfcon_document_data(conversion_id);

-- JSONB 데이터 전체 검색 최적화 (GIN 인덱스)
CREATE INDEX IF NOT EXISTS idx_document_data_gin
ON pdfcon_document_data USING GIN(data);

-- JSONB 특정 경로 검색 최적화 (jsonb_path_ops - 더 빠르고 작음)
CREATE INDEX IF NOT EXISTS idx_document_data_path_ops
ON pdfcon_document_data USING GIN(data jsonb_path_ops);

-- 업데이트 날짜 정렬 최적화
CREATE INDEX IF NOT EXISTS idx_document_updated_at
ON pdfcon_document_data(updated_at DESC);

-- ====================================
-- 성능 분석용 통계 수집
-- ====================================

-- 테이블 통계 업데이트 (쿼리 플래너 최적화)
ANALYZE pdfcon_conversions;
ANALYZE pdfcon_document_data;

-- ====================================
-- 인덱스 설명
-- ====================================

COMMENT ON INDEX idx_conversions_status IS 'Optimize status filtering queries';
COMMENT ON INDEX idx_conversions_created_at IS 'Optimize recent conversions sorting';
COMMENT ON INDEX idx_conversions_has_json IS 'Partial index for JSON availability filtering';
COMMENT ON INDEX idx_conversions_status_created IS 'Composite index for status + date queries';
COMMENT ON INDEX idx_conversions_filename IS 'Text pattern search for filenames';
COMMENT ON INDEX idx_document_conversion_id IS 'Foreign key lookup optimization';
COMMENT ON INDEX idx_document_data_gin IS 'Full JSONB containment and existence queries';
COMMENT ON INDEX idx_document_data_path_ops IS 'JSONB path queries (more compact)';
COMMENT ON INDEX idx_document_updated_at IS 'Recent document updates sorting';
