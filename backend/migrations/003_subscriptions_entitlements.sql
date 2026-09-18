-- Subscription and entitlement foundation.
-- Production deployments should apply migrations explicitly; the ORM create_all path is development-only.

CREATE TABLE IF NOT EXISTS creator_subscription_plans (
  id BIGSERIAL PRIMARY KEY,
  creator_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 100 AND price_cents <= 1000000),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  canceled_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT subscriptions_customer_creator_period UNIQUE (customer_id, creator_id, current_period_start)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_status
  ON subscriptions(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_creator_status
  ON subscriptions(creator_id, status);

ALTER TABLE media
  ADD COLUMN IF NOT EXISTS access_level VARCHAR(30) NOT NULL DEFAULT 'SUBSCRIBERS';
