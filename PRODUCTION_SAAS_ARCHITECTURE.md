# Production SaaS Architecture - Tadfuq Platform

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USERS / CLIENTS                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      AWS CLOUDFRONT (CDN)                            │
│  • Global edge locations                                             │
│  • HTTPS/HTTP2                                                       │
│  • Gzip/Brotli compression                                           │
│  • DDoS protection                                                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Static Site)                          │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │              Amazon S3 Bucket                               │    │
│  │  • Next.js static export (/out)                            │    │
│  │  • HTML, CSS, JS, images                                   │    │
│  │  • Versioning enabled                                      │    │
│  │  • Server-side encryption                                  │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  Cache Strategy:                                                     │
│  • HTML files: no-cache (max-age=0)                                 │
│  • Static assets: 1 year cache (max-age=31536000)                   │
│  • /_next/static/*: immutable                                       │
└───────────────────────────────────────────────────────────────────┘
                             │
                             │ API Calls
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    AWS APPLICATION LOAD BALANCER                     │
│  • SSL/TLS termination                                               │
│  • Health checks                                                     │
│  • Path-based routing                                                │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Kubernetes/EKS)                          │
│                                                                       │
│  ┌──────────────────────┐  ┌──────────────────────┐                │
│  │  Tenant Service      │  │  Ingestion Service   │                │
│  │  • Go microservice   │  │  • Go microservice   │                │
│  │  • Multi-tenancy     │  │  • Data ingestion    │                │
│  │  • Auth/RBAC         │  │  • RabbitMQ consumer │                │
│  │  • PostgreSQL        │  │  • PostgreSQL        │                │
│  └──────────────────────┘  └──────────────────────┘                │
│                                                                       │
│  ┌──────────────────────┐  ┌──────────────────────┐                │
│  │  NATS                │  │  RabbitMQ            │                │
│  │  • Messaging         │  │  • Message queue     │                │
│  └──────────────────────┘  └──────────────────────┘                │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │              PostgreSQL (RDS)                             │      │
│  │  • Multi-AZ deployment                                    │      │
│  │  • Automated backups                                      │      │
│  │  • Read replicas                                          │      │
│  └──────────────────────────────────────────────────────────┘      │
└───────────────────────────────────────────────────────────────────┘
```

## 📊 Component Breakdown

### Frontend Layer (S3 + CloudFront)

**Technology:** Next.js 14 (Static Export)

**Hosting:**
- **S3 Bucket:** `tadfuq-frontend-prod`
- **CloudFront Distribution:** Global CDN
- **Custom Domain:** `app.tadfuq.ai`, `www.tadfuq.ai`

**Features:**
- ✅ Static site generation (SSG)
- ✅ Global CDN distribution
- ✅ Automatic HTTPS
- ✅ HTTP/2 support
- ✅ Gzip/Brotli compression
- ✅ DDoS protection (AWS Shield)
- ✅ Zero server management
- ✅ Infinite scalability

**Cache Strategy:**
```
HTML files:        Cache-Control: public, max-age=0, must-revalidate
Static assets:     Cache-Control: public, max-age=31536000, immutable
/_next/static/*:   Cache-Control: public, max-age=31536000, immutable
```

### Backend Layer (EKS)

**Technology:** Go microservices on Kubernetes

**Services:**
1. **Tenant Service** (`/api/tenant/*`)
   - User management
   - Multi-tenancy
   - Authentication/Authorization
   - RBAC

2. **Ingestion Service** (`/api/ingestion/*`)
   - Data ingestion
   - File processing
   - RabbitMQ consumers

**Infrastructure:**
- **EKS Cluster:** `cashflow-cluster`
- **Region:** `us-east-1`
- **Load Balancer:** AWS ALB
- **Database:** PostgreSQL (RDS)
- **Messaging:** NATS, RabbitMQ

## 🚀 Deployment Workflow

### Frontend Deployment

```bash
# 1. Build static site
cd frontend
npm run build  # Generates /out directory

# 2. Deploy to S3
./scripts/deploy-frontend.sh

# 3. CloudFront invalidation
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/*"
```

**Automated via GitHub Actions:**
- Trigger: Push to `main` branch (frontend changes)
- Steps:
  1. Build Next.js static site
  2. Sync to S3
  3. Invalidate CloudFront cache
  4. Verify deployment

### Backend Deployment

```bash
# 1. Build Docker images
docker build -t <ECR_REGISTRY>/cashflow/tenant-service:latest \
  -f backend/Dockerfile backend/

docker build -t <ECR_REGISTRY>/cashflow/ingestion-service:latest \
  -f backend/Dockerfile.ingestion backend/

# 2. Push to ECR
docker push <ECR_REGISTRY>/cashflow/tenant-service:latest
docker push <ECR_REGISTRY>/cashflow/ingestion-service:latest

# 3. Deploy to EKS
kubectl apply -f infra/k8s/
kubectl rollout restart deployment/cashflow-tenant
kubectl rollout restart deployment/cashflow-ingestion
```

**Automated via GitHub Actions:**
- Trigger: Push to `main` branch (backend changes)
- Steps:
  1. Build Docker images
  2. Push to ECR
  3. Deploy to EKS
  4. Verify rollout

## 🔧 Configuration

### Environment Variables

**Frontend (`.env.production`):**
```bash
NEXT_PUBLIC_API_URL=https://api.tadfuq.ai
NEXT_PUBLIC_TENANT_API_URL=https://api.tadfuq.ai/api/tenant
NEXT_PUBLIC_INGESTION_API_URL=https://api.tadfuq.ai/api/ingestion
NEXT_PUBLIC_APP_NAME=CashFlow.ai
NEXT_PUBLIC_APP_URL=https://app.tadfuq.ai
```

**Backend (Kubernetes ConfigMap/Secrets):**
```yaml
DATABASE_URL: postgresql://...
NATS_URL: nats://nats:4222
RABBITMQ_URL: amqp://rabbitmq:5672
KEYCLOAK_URL: https://auth.tadfuq.ai
```

### GitHub Secrets

Required secrets for CI/CD:
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
CLOUDFRONT_DISTRIBUTION_ID
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_TENANT_API_URL
NEXT_PUBLIC_INGESTION_API_URL
```

## 📈 Scaling Strategy

### Frontend (S3/CloudFront)
- **Automatic:** CloudFront scales automatically
- **Global:** 450+ edge locations worldwide
- **Cost:** Pay per request + data transfer

### Backend (EKS)
- **Horizontal Pod Autoscaling (HPA):**
  ```yaml
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  ```

- **Cluster Autoscaling:**
  - Node groups scale based on pod demand
  - Min nodes: 2
  - Max nodes: 10

## 💰 Cost Optimization

### Frontend
- **S3:** ~$0.023/GB storage + $0.09/GB transfer
- **CloudFront:** ~$0.085/GB (first 10TB)
- **Estimated:** $50-200/month (depending on traffic)

### Backend
- **EKS:** $0.10/hour cluster + EC2 costs
- **RDS:** $100-500/month (db.t3.medium)
- **ALB:** $20/month
- **Estimated:** $300-800/month

**Total:** ~$350-1000/month

## 🔒 Security

### Frontend
- ✅ HTTPS only (TLS 1.2+)
- ✅ CloudFront OAI (Origin Access Identity)
- ✅ S3 bucket policy (no public access)
- ✅ DDoS protection (AWS Shield Standard)
- ✅ WAF (optional, can be added)

### Backend
- ✅ Private subnets for pods
- ✅ Security groups
- ✅ Network policies
- ✅ Secrets management (AWS Secrets Manager)
- ✅ IAM roles for service accounts (IRSA)

## 📊 Monitoring

### Frontend
- **CloudWatch Metrics:**
  - CloudFront requests
  - Error rates (4xx, 5xx)
  - Cache hit ratio
  - Data transfer

### Backend
- **Kubernetes Metrics:**
  - Pod CPU/memory usage
  - Request latency
  - Error rates
- **Application Metrics:**
  - Custom Prometheus metrics
  - Grafana dashboards

## 🔄 Rollback Strategy

### Frontend
```bash
# List S3 versions
aws s3api list-object-versions --bucket tadfuq-frontend-prod

# Restore previous version
aws s3api copy-object \
  --copy-source tadfuq-frontend-prod/index.html?versionId=<VERSION_ID> \
  --bucket tadfuq-frontend-prod \
  --key index.html

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/*"
```

### Backend
```bash
# Rollback deployment
kubectl rollout undo deployment/cashflow-tenant -n default
kubectl rollout undo deployment/cashflow-ingestion -n default
```

## 📝 Next Steps

1. **DNS Configuration:**
   - Point `app.tadfuq.ai` to CloudFront distribution
   - Point `api.tadfuq.ai` to ALB

2. **SSL Certificates:**
   - Request ACM certificate in `us-east-1` (for CloudFront)
   - Attach to CloudFront distribution

3. **Monitoring Setup:**
   - Configure CloudWatch alarms
   - Set up Grafana dashboards
   - Configure PagerDuty/Slack alerts

4. **Backup Strategy:**
   - RDS automated backups (7-day retention)
   - S3 versioning enabled
   - Kubernetes etcd backups

5. **Disaster Recovery:**
   - Multi-region failover (optional)
   - Database read replicas
   - S3 cross-region replication

---

**Architecture Status:** ✅ Production Ready  
**Last Updated:** March 8, 2026  
**Maintained By:** DevOps Team
