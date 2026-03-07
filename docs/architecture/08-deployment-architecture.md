# Deployment Architecture

## Environment

- Frontend: Kubernetes/EKS
- Backend: Kubernetes/EKS
- Database: PostgreSQL (RDS)
- Backups: Daily pg_dump → S3
- Monitoring: Sentry + UptimeRobot

## Environments

- Local
- Staging
- Production

## Zero Downtime Strategy

- Blue/Green deployment (future)
- Database migrations backward compatible