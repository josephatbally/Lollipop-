# Lollipop Architecture

## Product principle
Lollipop is a video-first creator platform with a cinematic, futuristic interface and safety/privacy built into the architecture.

## Domains
- Identity & access
- Creator profiles & verification
- Media & secure delivery
- Moderation & reports
- Subscriptions, purchases & tips
- Messaging
- Creator ledger & payouts
- Notifications
- Administration & audit

## Request flow
Web/mobile client → API → domain services → PostgreSQL/Redis/object storage → CDN.

## Development order
1. Foundation and identity
2. Creator onboarding and verification
3. Media upload, processing and moderation
4. Monetization and immutable ledger
5. Messaging and discovery
6. Admin, fraud, audit and controlled launch
