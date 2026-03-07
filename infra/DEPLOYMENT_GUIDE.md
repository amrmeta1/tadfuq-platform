# 🚀 دليل نشر البنية التحتية على AWS EKS

## 📋 المتطلبات الأساسية

### 1. الأدوات المطلوبة
```bash
# تأكد من تثبيت الأدوات التالية:
- AWS CLI (v2.x)
- Terraform (v1.5+)
- kubectl (v1.28+)
- Helm (v3.x)
- Docker
```

### 2. حساب AWS
```bash
✅ AWS Account مع صلاحيات Admin
✅ AWS Access Key ID & Secret Access Key
✅ Region: us-east-1 (أو حسب اختيارك)
```

---

## 🔧 الخطوة 1: إعداد AWS CLI

### تكوين AWS Credentials
```bash
# قم بتشغيل هذا الأمر وأدخل بياناتك
aws configure

# سيطلب منك:
AWS Access Key ID: YOUR_ACCESS_KEY
AWS Secret Access Key: YOUR_SECRET_KEY
Default region name: us-east-1
Default output format: json
```

### تحقق من الاتصال
```bash
# تأكد أن AWS CLI يشتغل
aws sts get-caller-identity

# يجب أن ترى:
# {
#   "UserId": "...",
#   "Account": "123456789012",
#   "Arn": "arn:aws:iam::123456789012:user/your-user"
# }
```

---

## 🏗️ الخطوة 2: تحضير Terraform

### انتقل لمجلد Terraform
```bash
cd /Users/adam/Desktop/tad/tadfuq-platform/infra/terraform
```

### نسخ ملف المتغيرات
```bash
# انسخ ملف المثال
cp terraform.tfvars.example terraform.tfvars

# افتح الملف للتعديل
nano terraform.tfvars
```

### تعديل terraform.tfvars
```hcl
# AWS Configuration
aws_region = "us-east-1"  # غير حسب رغبتك

# Environment
environment  = "dev"
project_name = "cashflow"

# Database
db_instance_class     = "db.t4g.micro"    # للتجربة
db_allocated_storage  = 20                # 20 GB

# EKS Configuration
eks_instance_type  = "t3.medium"          # نوع الـ nodes
eks_desired_nodes  = 2                    # عدد الـ nodes
eks_min_nodes      = 1
eks_max_nodes      = 4

# Networking
vpc_cidr           = "10.0.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b"]

# Domain (اختياري - اتركه فاضي للحين)
domain_name          = ""
create_hosted_zone   = false
create_api_subdomain = false
```

### احفظ الملف
```bash
# اضغط Ctrl+O ثم Enter للحفظ
# اضغط Ctrl+X للخروج
```

---

## 🚀 الخطوة 3: تنفيذ Terraform

### 3.1 - Initialize Terraform
```bash
terraform init

# يجب أن ترى:
# Terraform has been successfully initialized!
```

### 3.2 - Plan Infrastructure
```bash
terraform plan -out=tfplan

# سيعرض لك كل الموارد اللي هتتنشأ:
# - VPC + Subnets
# - EKS Cluster
# - RDS PostgreSQL
# - ECR Repositories
# - Security Groups
# - IAM Roles
# - ALB Load Balancer
```

### 3.3 - Review Plan
```bash
# راجع الـ plan بعناية
# تأكد من:
# ✅ Region صحيح
# ✅ Instance types مناسبة
# ✅ Database settings صحيحة
```

### 3.4 - Apply Infrastructure
```bash
# ⚠️ هذا الأمر سينشئ موارد حقيقية على AWS
# ⚠️ سيكلفك مال (~$100-150/شهر)
terraform apply tfplan

# اكتب "yes" للتأكيد
```

### ⏱️ وقت الانتظار
```
⏳ EKS Cluster: ~15-20 دقيقة
⏳ RDS Database: ~5-10 دقائق
⏳ VPC & Networking: ~2-3 دقائق
⏳ Total: ~20-25 دقيقة
```

---

## ✅ الخطوة 4: التحقق من البنية التحتية

### احصل على Outputs
```bash
# اعرض كل المخرجات
terraform output

# مخرجات مهمة:
terraform output eks_cluster_name
terraform output eks_cluster_endpoint
terraform output rds_endpoint
terraform output ecr_repository_urls
```

### تكوين kubectl
```bash
# اتصل بالـ EKS cluster
aws eks update-kubeconfig \
  --name cashflow-dev-cluster \
  --region us-east-1

# تحقق من الاتصال
kubectl get nodes

# يجب أن ترى الـ nodes:
# NAME                         STATUS   ROLES    AGE   VERSION
# ip-10-0-1-xxx.ec2.internal   Ready    <none>   5m    v1.31.x
# ip-10-0-2-xxx.ec2.internal   Ready    <none>   5m    v1.31.x
```

### تحقق من الـ Namespaces
```bash
kubectl get namespaces

# يجب أن ترى:
# default
# kube-system
# kube-public
# kube-node-lease
```

---

## 🐳 الخطوة 5: بناء ونشر Docker Images

### 5.1 - Login to ECR
```bash
# احصل على ECR URL من Terraform output
ECR_REGISTRY=$(terraform output -raw ecr_registry)

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin $ECR_REGISTRY
```

### 5.2 - Build Backend Images
```bash
# ارجع لجذر المشروع
cd /Users/adam/Desktop/tad/tadfuq-platform

# Build tenant-service
docker build \
  -f infra/docker/Dockerfile \
  -t $ECR_REGISTRY/cashflow/tenant-service:latest \
  .

# Build ingestion-service
docker build \
  -f infra/docker/Dockerfile.ingestion \
  -t $ECR_REGISTRY/cashflow/ingestion-service:latest \
  .
```

### 5.3 - Build Frontend Image
```bash
# Build frontend
docker build \
  -f frontend/Dockerfile \
  -t $ECR_REGISTRY/cashflow/frontend:latest \
  ./frontend
```

### 5.4 - Push Images to ECR
```bash
# Push tenant-service
docker push $ECR_REGISTRY/cashflow/tenant-service:latest

# Push ingestion-service
docker push $ECR_REGISTRY/cashflow/ingestion-service:latest

# Push frontend
docker push $ECR_REGISTRY/cashflow/frontend:latest
```

---

## 📦 الخطوة 6: تثبيت ALB Ingress Controller

### 6.1 - Create IAM Policy
```bash
cd infra/terraform

# Apply ALB controller resources
terraform apply -target=module.alb_controller
```

### 6.2 - Install ALB Controller with Helm
```bash
# Add EKS Helm repo
helm repo add eks https://aws.github.io/eks-charts
helm repo update

# Install ALB Ingress Controller
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=cashflow-dev-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

### 6.3 - Verify Installation
```bash
kubectl get deployment -n kube-system aws-load-balancer-controller

# يجب أن ترى:
# NAME                           READY   UP-TO-DATE   AVAILABLE
# aws-load-balancer-controller   2/2     2            2
```

---

## 🎯 الخطوة 7: نشر التطبيق باستخدام Helm

### 7.1 - Update Helm Values
```bash
cd /Users/adam/Desktop/tad/tadfuq-platform/infra/helm/cashflow

# افتح values.yaml
nano values.yaml
```

### تحديث القيم المهمة:
```yaml
global:
  image:
    registry: "YOUR_ECR_REGISTRY"  # من terraform output
    tag: "latest"

database:
  host: "YOUR_RDS_ENDPOINT"  # من terraform output
  port: 5432
  name: cashflow
  username: cashflow
  # password سيتم إضافته كـ secret

frontend:
  enabled: true
  replicaCount: 2

tenantService:
  enabled: true
  replicaCount: 2

ingestionService:
  enabled: true
  replicaCount: 2
```

### 7.2 - Create Database Secret
```bash
# احصل على RDS endpoint
RDS_ENDPOINT=$(cd ../../terraform && terraform output -raw rds_endpoint)

# Create Kubernetes secret
kubectl create secret generic db-credentials \
  --from-literal=host=$RDS_ENDPOINT \
  --from-literal=username=cashflow \
  --from-literal=password=YOUR_DB_PASSWORD \
  --from-literal=database=cashflow \
  -n default
```

### 7.3 - Deploy with Helm
```bash
# Install the application
helm install cashflow . \
  --namespace default \
  --create-namespace \
  --set global.image.registry=$ECR_REGISTRY

# أو للتحديث:
helm upgrade --install cashflow . \
  --namespace default
```

### 7.4 - Watch Deployment
```bash
# راقب الـ pods
kubectl get pods -n default -w

# يجب أن ترى:
# NAME                                READY   STATUS    RESTARTS
# frontend-xxx                        1/1     Running   0
# tenant-service-xxx                  1/1     Running   0
# ingestion-service-xxx               1/1     Running   0
```

---

## 🔍 الخطوة 8: التحقق من النشر

### 8.1 - Check Services
```bash
kubectl get svc -n default

# ابحث عن LoadBalancer services
```

### 8.2 - Get Load Balancer URL
```bash
# احصل على Frontend URL
kubectl get ingress -n default

# أو
kubectl get svc frontend -n default -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

### 8.3 - Test Health Endpoints
```bash
# Test tenant-service
TENANT_LB=$(kubectl get svc tenant-service -n default -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
curl http://$TENANT_LB:8080/healthz

# Test ingestion-service
INGESTION_LB=$(kubectl get svc ingestion-service -n default -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
curl http://$INGESTION_LB:8081/healthz

# Test frontend
FRONTEND_LB=$(kubectl get svc frontend -n default -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
curl http://$FRONTEND_LB:3000/api/health
```

---

## 🗄️ الخطوة 9: تشغيل Database Migrations

### 9.1 - Port Forward to Database
```bash
# Get RDS endpoint
RDS_ENDPOINT=$(cd infra/terraform && terraform output -raw rds_endpoint)

# Run migrations from local
cd /Users/adam/Desktop/tad/tadfuq-platform/backend
export DB_HOST=$RDS_ENDPOINT
export DB_PORT=5432
export DB_USER=cashflow
export DB_PASSWORD=YOUR_DB_PASSWORD
export DB_NAME=cashflow
export DB_SSLMODE=require

# Run migrations
migrate -path migrations \
  -database "postgres://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=require" \
  up
```

### 9.2 - Verify Migrations
```bash
# Connect to database
psql "postgres://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=require"

# Check tables
\dt

# يجب أن ترى:
# tenants, users, memberships, roles, etc.
```

---

## 📊 الخطوة 10: Monitoring & Logs

### View Logs
```bash
# Frontend logs
kubectl logs -f deployment/frontend -n default

# Tenant service logs
kubectl logs -f deployment/tenant-service -n default

# Ingestion service logs
kubectl logs -f deployment/ingestion-service -n default
```

### Check Pod Status
```bash
# Describe pod for details
kubectl describe pod <pod-name> -n default

# Get events
kubectl get events -n default --sort-by='.lastTimestamp'
```

---

## 🎉 النشر مكتمل!

### URLs النهائية:
```bash
# احصل على كل الـ URLs
echo "Frontend: http://$(kubectl get svc frontend -n default -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'):3000"
echo "Tenant API: http://$(kubectl get svc tenant-service -n default -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'):8080"
echo "Ingestion API: http://$(kubectl get svc ingestion-service -n default -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'):8081"
```

---

## 🔧 Troubleshooting

### Pods لا تبدأ
```bash
# Check pod status
kubectl get pods -n default

# Describe pod
kubectl describe pod <pod-name> -n default

# Check logs
kubectl logs <pod-name> -n default
```

### ImagePullBackOff Error
```bash
# تأكد من ECR permissions
# تأكد من أن الـ images موجودة في ECR
aws ecr list-images --repository-name cashflow/tenant-service --region us-east-1
```

### Database Connection Issues
```bash
# تأكد من Security Groups
# تأكد من RDS endpoint صحيح
# تأكد من credentials صحيحة
```

---

## 💰 التكلفة المتوقعة

### Dev Environment (~$100-150/month):
- EKS Cluster: ~$73/month
- EC2 Nodes (2x t3.medium): ~$60/month
- RDS (db.t4g.micro): ~$15/month
- ALB: ~$20/month
- NAT Gateway: ~$32/month
- Data Transfer: ~$5-10/month

---

## 🧹 تنظيف الموارد (Cleanup)

### حذف التطبيق
```bash
# Uninstall Helm chart
helm uninstall cashflow -n default

# Delete namespace
kubectl delete namespace default
```

### حذف البنية التحتية
```bash
cd infra/terraform

# ⚠️ هذا سيحذف كل شيء!
terraform destroy

# اكتب "yes" للتأكيد
```

---

## 📚 المراجع

- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)

---

**🎊 مبروك! البنية التحتية جاهزة والتطبيق منشور على EKS!**
