# Kubernetes/EKS Deployment Guide

## Overview

This document covers Kubernetes-specific deployment details for the TadFuq.ai platform.

## Architecture

```
┌─────────────────────────────────────────┐
│         AWS Application Load Balancer   │
│         (Ingress Controller)             │
└────────────┬────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────┐      ┌────▼─────┐
│Frontend│      │ Backend  │
│ Pods   │      │ Services │
│(Next.js)│     │  (Go)    │
└────────┘      └──────────┘
    │                │
    └────────┬───────┘
             │
        ┌────▼─────┐
        │   RDS    │
        │PostgreSQL│
        └──────────┘
```

## Container Images

### Backend Services

**Tenant Service:**
```dockerfile
Image: {ECR}/cashflow/tenant-service:latest
Port: 8080
Health: GET /healthz
```

**Ingestion Service:**
```dockerfile
Image: {ECR}/cashflow/ingestion-service:latest
Port: 8081
Health: GET /healthz
```

### Frontend

**Next.js App:**
```dockerfile
Image: {ECR}/cashflow/frontend:no-auth-v1
Port: 3000
Health: GET /api/health
```

## Helm Charts

### Available Charts

1. **`infra/helm/cashflow/`** - Complete stack (all services)
2. **`infra/helm/frontend/`** - Frontend only

### Deploy with Helm

```bash
# Deploy complete stack
helm upgrade --install cashflow ./infra/helm/cashflow \
  --namespace default \
  --create-namespace \
  --set imageRegistry.url=747253121951.dkr.ecr.us-east-1.amazonaws.com

# Deploy frontend only
helm upgrade --install frontend ./infra/helm/frontend \
  --namespace default
```

## Resource Requirements

### Frontend
```yaml
Requests:
  Memory: 512Mi
  CPU: 250m
Limits:
  Memory: 1Gi
  CPU: 500m
```

### Backend Services
```yaml
Requests:
  Memory: 512Mi
  CPU: 250m
Limits:
  Memory: 1Gi
  CPU: 500m
```

## Autoscaling

All services have HPA (Horizontal Pod Autoscaler) enabled:

```yaml
minReplicas: 2
maxReplicas: 10
targetCPUUtilizationPercentage: 70
targetMemoryUtilizationPercentage: 80
```

## Health Checks

### Backend Services

**Endpoint:** `GET /healthz`

**Response:**
```json
{
  "status": "ok",
  "service": "tenant-service"
}
```

**Kubernetes Probes:**
```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 5
```

### Frontend

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-07T00:00:00.000Z",
  "service": "frontend"
}
```

**Kubernetes Probes:**
```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 60
  periodSeconds: 20

readinessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
```

## Security

### Pod Security Context

All pods run as non-root users:

```yaml
podSecurityContext:
  runAsNonRoot: true
  runAsUser: 1001
  fsGroup: 1001

securityContext:
  allowPrivilegeEscalation: false
  capabilities:
    drop:
    - ALL
  readOnlyRootFilesystem: false
```

### Network Policies

(To be implemented)

## Secrets Management

### Required Secrets

1. **Database Credentials:**
   ```bash
   kubectl create secret generic db-credentials \
     --from-literal=host=<RDS_ENDPOINT> \
     --from-literal=password=<DB_PASSWORD> \
     -n default
   ```

2. **ECR Pull Credentials:**
   ```bash
   # Automatically managed by EKS with IAM roles
   ```

### Environment Variables

Set via Helm values or ConfigMaps:

```yaml
env:
  NODE_ENV: production
  DATABASE_URL: postgresql://...
  NEXT_PUBLIC_API_URL: http://tenant.api.tadfuq.ai
```

## Networking

### Service Types

- **Frontend:** LoadBalancer (for external access)
- **Backend:** ClusterIP (internal only)

### Ingress

Using AWS ALB Ingress Controller:

```yaml
ingress:
  enabled: true
  className: alb
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
  hosts:
    - host: app.tadfuq.ai
      paths:
        - path: /
          service: frontend
    - host: api.tadfuq.ai
      paths:
        - path: /api/tenant
          service: tenant-service
        - path: /api/ingestion
          service: ingestion-service
```

## Deployment Strategy

### Rolling Update

```yaml
updateStrategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
```

This ensures:
- Zero downtime deployments
- Always at least `minReplicas` available
- Gradual rollout

### Pod Disruption Budget

```yaml
podDisruptionBudget:
  enabled: true
  minAvailable: 1
```

Prevents all pods from being evicted simultaneously.

## High Availability

### Multi-AZ Deployment

Pods are spread across availability zones:

```yaml
topologySpreadConstraints:
  - maxSkew: 1
    topologyKey: topology.kubernetes.io/zone
    whenUnsatisfiable: DoNotSchedule
```

### Anti-Affinity

(To be implemented for production)

## Monitoring

### Metrics

Kubernetes metrics available via:
- `kubectl top pods`
- `kubectl top nodes`
- Prometheus (if installed)

### Logs

View logs:
```bash
# Frontend
kubectl logs -l app.kubernetes.io/name=frontend -n default --tail=100

# Tenant service
kubectl logs -l app=tenant-service -n default --tail=100

# Follow logs
kubectl logs -f deployment/frontend -n default
```

## Troubleshooting

### Pod Not Starting

```bash
# Check pod status
kubectl get pods -n default

# Describe pod
kubectl describe pod <pod-name> -n default

# Check events
kubectl get events -n default --sort-by='.lastTimestamp'
```

### Image Pull Errors

```bash
# Check if ECR credentials are valid
aws ecr get-login-password --region us-east-1

# Verify image exists
aws ecr describe-images \
  --repository-name cashflow/frontend \
  --region us-east-1
```

### Health Check Failures

```bash
# Port forward to pod
kubectl port-forward pod/<pod-name> 3000:3000 -n default

# Test health endpoint
curl http://localhost:3000/api/health
```

### Database Connection Issues

```bash
# Check secret exists
kubectl get secret db-credentials -n default

# Verify environment variables
kubectl exec -it <pod-name> -n default -- env | grep DB
```

## Best Practices

### 1. Resource Limits
Always set resource requests and limits to prevent resource exhaustion.

### 2. Health Checks
Use HTTP health checks instead of TCP for better reliability.

### 3. Graceful Shutdown
Ensure applications handle SIGTERM for graceful shutdown.

### 4. Readiness vs Liveness
- **Readiness:** Service ready to accept traffic
- **Liveness:** Service is alive (restart if fails)

### 5. ConfigMaps for Configuration
Use ConfigMaps for non-sensitive configuration.

### 6. Secrets for Credentials
Always use Kubernetes Secrets for sensitive data.

## Production Checklist

- [ ] Resource limits configured
- [ ] Health checks working
- [ ] Autoscaling tested
- [ ] Secrets properly configured
- [ ] Ingress/LoadBalancer configured
- [ ] SSL/TLS certificates installed
- [ ] Monitoring enabled
- [ ] Log aggregation configured
- [ ] Backup strategy defined
- [ ] Disaster recovery plan
- [ ] Network policies applied
- [ ] Pod security policies enforced

## Common Commands

```bash
# Get all resources
kubectl get all -n default

# Scale deployment
kubectl scale deployment frontend --replicas=3 -n default

# Restart deployment
kubectl rollout restart deployment/frontend -n default

# Check rollout status
kubectl rollout status deployment/frontend -n default

# Rollback deployment
kubectl rollout undo deployment/frontend -n default

# Execute command in pod
kubectl exec -it <pod-name> -n default -- /bin/sh

# Copy files from pod
kubectl cp <pod-name>:/path/to/file ./local-file -n default
```

## References

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [AWS EKS Best Practices](https://aws.github.io/aws-eks-best-practices/)
- [AWS Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller/)
