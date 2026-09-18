-- Lollipop development schema uses BIGINT identifiers to match the current SQLAlchemy ORM.
-- Production should apply migrations rather than relying on Base.metadata.create_all().
-- Files are stored outside the database; storage_key points to private object storage.

CREATE TABLE IF NOT EXISTS media (
  id BIGSERIAL PRIMARY KEY,
  creator_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  original_filename VARCHAR(255) NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  storage_key VARCHAR(500) NOT NULL UNIQUE,
  size_bytes BIGINT NOT NULL,
  checksum_sha256 VARCHAR(64) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'SCANNING',
  moderation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS consent_records (
  id BIGSERIAL PRIMARY KEY,
  media_id BIGINT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  participant_reference VARCHAR(255) NOT NULL,
  authorization_version VARCHAR(100) NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_creator_status ON media (creator_id, status);
CREATE INDEX IF NOT EXISTS idx_media_status ON media (status);
CREATE INDEX IF NOT EXISTS idx_consent_media ON consent_records (media_id);
