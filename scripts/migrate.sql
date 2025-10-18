-- NewsBrief Converter Database Schema
-- Create conversions table

CREATE TABLE IF NOT EXISTS conversions (
  id VARCHAR(21) PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL,
  input_url TEXT,
  output_url TEXT,
  method VARCHAR(20),
  tokens INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_conversions_status ON conversions(status);
CREATE INDEX IF NOT EXISTS idx_conversions_created_at ON conversions(created_at DESC);

-- Comments
COMMENT ON TABLE conversions IS 'PDF to HTML conversion jobs';
COMMENT ON COLUMN conversions.id IS 'Unique conversion ID (nanoid)';
COMMENT ON COLUMN conversions.status IS 'pending, processing, completed, failed';
COMMENT ON COLUMN conversions.method IS 'claude-direct';
