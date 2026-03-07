# Deployment Guide

## Current Status

**⚠️ Infrastructure Status: DESTROYED**

All AWS infrastructure has been completely removed:
- EKS Cluster
- RDS Database
- Load Balancers
- VPC & Networking
- ECR Repositories
- All Kubernetes resources

## Prerequisites

### Required Tools
- AWS CLI configured with credentials
- kubectl
- Terraform >= 1.5
- Docker
- Helm 3
- ArgoCD CLI (optional)

### AWS Resources Required
- AWS Account with appropriate permissions
- Route53 Hosted Zone (optional for custom domain)
- ECR repositories for container images

## Infrastructure Setup

### 1. Terraform Configuration

```bash
cd infra/terraform

# Copy and configure variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

# Initialize Terraform
terraform init

# Review plan
terraform plan

# Apply infrastructure
terraform apply
```

### 2. Configure kubectl

```bash
# Update kubeconfig for EKS cluster
aws eks update-kubeconfig --name cashflow-dev-cluster --region us-east-1

# Verify connection
kubectl get nodes
```

### 3. Install ArgoCD

```bash
# Run installation script
./infra/scripts/install-argocd.sh

# Get ArgoCD password
kubectl get secret argocd-initial-admin-secret -n argocd \
  -o jsonpath='{.data.password}' | base64 --decode

# Port-forward to access UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

## Application Deployment

### Backend Services

#### 1. Build Docker Images

```bash
# Tenant Service
cd backend
docker build -f ../infra/docker/Dockerfile -t tenant-service:latest .

# Tag for ECR
docker tag tenant-service:latest \
  747253121951.dkr.ecr.us-east-1.amazonaws.com/cashflow/tenant-service:latest

# Push to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  747253121951.dkr.ecr.us-east-1.amazonaws.com

docker push 747253121951.dkr.ecr.us-east-1.amazonaws.com/cashflow/tenant-service:latest
```

#### 2. Deploy with Helm

```bash
# Tenant Service
helm upgrade --install tenant-service \
  ./infra/helm/tenant-service \
  --namespace default \
  --create-namespace

# Ingestion Service
helm upgrade --install ingestion-service \
  ./infra/helm/ingestion-service \
  --namespace default
```

### Frontend

#### 1. Build Production Image

```bash
cd frontend

# Build for production
docker build -f Dockerfile.production \
  -t 747253121951.dkr.ecr.us-east-1.amazonaws.com/cashflow/frontend:latest \
  --push .
```

#### 2. Deploy with Helm

```bash
helm upgrade --install frontend-helm \
  ./infra/helm/frontend \
  --namespace default
```

### 3. Verify Deployment

```bash
# Check pods
kubectl get pods -n default

# Check services
kubectl get svc -n default

# Check ArgoCD applications
kubectl get applications -n argocd
```

## Database Migrations

### Run Migrations

```bash
# Get RDS endpoint from Terraform output
terraform output rds_endpoint

# Run migrations
cd backend/migrations
export DATABASE_URL="postgres://user:password@endpoint:5432/cashflow"
migrate -path . -database $DATABASE_URL up
```

## Environment Variables

### Backend Services

Required environment variables:
```bash
DATABASE_URL=postgresql://user:password@host:5432/dbname
RABBITMQ_URL=amqp://user:password@host:5672/
NATS_URL=nats://host:4222
PORT=8080
```

### Frontend

Required environment variables:
```bash
NEXT_PUBLIC_API_URL=http://tenant.api.tadfuq.ai
NODE_ENV=production
```

## Monitoring & Logs

### View Logs

```bash
# Frontend logs
kubectl logs -l app.kubernetes.io/name=frontend-helm -n default --tail=100

# Tenant service logs
kubectl logs -l app=tenant-service -n default --tail=100

# Ingestion service logs
kubectl logs -l app=ingestion-service -n default --tail=100
```

### Health Checks

```bash
# Check service health
curl http://tenant-service:8080/health
curl http://ingestion-service:8081/health
```

## Troubleshooting

### Pods Not Starting

```bash
# Describe pod
kubectl describe pod <pod-name> -n default

# Check events
kubectl get events -n default --sort-by='.lastTimestamp'

# Check logs
kubectl logs <pod-name> -n default
```

### Database Connection Issues

```bash
# Test database connectivity
kubectl run -it --rm debug --image=postgres:16 --restart=Never -- \
  psql -h <rds-endpoint> -U <username> -d cashflow
```

### ArgoCD Sync Issues

```bash
# Check application status
kubectl get app -n argocd

# Force sync
kubectl patch app <app-name> -n argocd \
  --type merge -p '{"operation":{"sync":{}}}'

# Or use ArgoCD CLI
argocd app sync <app-name>
```

## Rollback

### Helm Rollback

```bash
# List releases
helm list -n default

# Rollback to previous version
helm rollback frontend-helm -n default

# Rollback to specific revision
helm rollback frontend-helm 2 -n default
```

### Docker Image Rollback

```bash
# Update Helm values with previous image tag
helm upgrade frontend-helm ./infra/helm/frontend \
  --set image.tag=previous-tag \
  --namespace default
```

## Scaling

### Manual Scaling

```bash
# Scale deployment
kubectl scale deployment frontend-helm --replicas=3 -n default

# Or update Helm values
helm upgrade frontend-helm ./infra/helm/frontend \
  --set replicaCount=3 \
  --namespace default
```

### Horizontal Pod Autoscaler (HPA)

```bash
# Create HPA
kubectl autoscale deployment frontend-helm \
  --cpu-percent=70 \
  --min=2 \
  --max=10 \
  -n default
```

## Security Considerations

### Current State (No Auth)
⚠️ **The frontend currently has NO authentication**
- All users have admin permissions
- Tenant ID is from header (not validated)
- **DO NOT use in production without re-enabling auth**

### To Re-enable Authentication
1. Restore Keycloak or implement alternative auth
2. Update frontend to use NextAuth or similar
3. Update backend middleware to validate tokens
4. Deploy with proper secrets management

## Cost Optimization

### Shutdown Non-Production Resources

```bash
# Scale down to zero
kubectl scale deployment --all --replicas=0 -n default

# Or destroy infrastructure
cd infra/terraform
terraform destroy
```

### Resource Requests/Limits

Ensure all deployments have appropriate resource limits:
```yaml
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "256Mi"
    cpu: "200m"
```

## Backup & Recovery

### Database Backup

```bash
# Manual backup
pg_dump -h <rds-endpoint> -U <username> cashflow > backup.sql

# Restore
psql -h <rds-endpoint> -U <username> cashflow < backup.sql
```

### Automated Backups

RDS automated backups are configured via Terraform:
- Retention period: 7 days
- Backup window: 03:00-04:00 UTC
- Maintenance window: Sun 04:00-05:00 UTC

## Production Checklist

Before going to production:

- [ ] Re-enable authentication
- [ ] Configure SSL/TLS certificates
- [ ] Set up monitoring and alerting
- [ ] Configure log aggregation
- [ ] Enable database backups
- [ ] Set up disaster recovery plan
- [ ] Configure secrets management (AWS Secrets Manager)
- [ ] Enable network policies
- [ ] Set resource limits on all pods
- [ ] Configure HPA for auto-scaling
- [ ] Set up CI/CD pipelines
- [ ] Perform security audit
- [ ] Load testing
- [ ] Document runbooks

## Support

For issues or questions:
- Check logs: `kubectl logs <pod-name>`
- Review ArgoCD UI: `http://localhost:8080`
- Check Terraform state: `terraform show`
