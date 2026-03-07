# GitHub Actions Workflows

## Available Workflows

### 1. CI (`ci.yml`)

Runs on every push to `main` and on all pull requests.

**Jobs:**
- **Test**: Runs Go tests with PostgreSQL
- **Lint**: Runs golangci-lint
- **Build**: Builds Docker images (no push)

**Requirements:**
- None (uses GitHub-hosted runners)

### 2. Deploy to AWS (`deploy-aws.yml`)

Deploys to AWS EKS on push to `main` or manual trigger.

**Jobs:**
- Build and push Docker images to ECR
- Apply Terraform infrastructure
- Update Kubernetes deployments
- Run health checks

**Requirements:**

#### GitHub Secrets

Set these in: `Settings → Secrets and variables → Actions`

- `AWS_ROLE_ARN`: ARN of AWS IAM role for OIDC authentication
  - Example: `arn:aws:iam::747253121951:role/github-actions-role`
  - Must have permissions for:
    - ECR (push images)
    - EKS (update kubeconfig)
    - Terraform state (S3, DynamoDB)
    - Infrastructure resources

#### AWS Setup

1. **Create IAM OIDC Provider** for GitHub Actions:
   ```bash
   aws iam create-open-id-connect-provider \
     --url https://token.actions.githubusercontent.com \
     --client-id-list sts.amazonaws.com \
     --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
   ```

2. **Create IAM Role** with trust policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {
           "Federated": "arn:aws:iam::747253121951:oidc-provider/token.actions.githubusercontent.com"
         },
         "Action": "sts:AssumeRoleWithWebIdentity",
         "Condition": {
           "StringEquals": {
             "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
           },
           "StringLike": {
             "token.actions.githubusercontent.com:sub": "repo:amrmeta1/tadfuq-platform:*"
           }
         }
       }
     ]
   }
   ```

3. **Attach policies** to the role:
   - `AmazonEC2ContainerRegistryPowerUser`
   - `AmazonEKSClusterPolicy`
   - Custom policy for Terraform state access

#### GitHub Environment

Create environment `dev` in: `Settings → Environments`

- Add protection rules if needed (e.g., required reviewers)
- Environment secrets override repository secrets

## Current Status

⚠️ **Infrastructure Destroyed**: The AWS infrastructure has been destroyed for cost optimization. To use these workflows:

1. Deploy infrastructure first:
   ```bash
   cd infra/terraform
   terraform init
   terraform apply
   ```

2. Configure GitHub secrets (see above)

3. Push to `main` or trigger manually

## Manual Workflow Trigger

To manually trigger the deployment workflow:

1. Go to: `Actions → Deploy to AWS → Run workflow`
2. Select branch: `main`
3. Click "Run workflow"

## Troubleshooting

### CI Workflow Fails

**Tests fail:**
- Check test logs in the workflow run
- Ensure migrations are compatible with PostgreSQL 16

**Lint fails:**
- Run locally: `cd backend && golangci-lint run`
- Fix issues and push

**Build fails:**
- Check Dockerfile paths are correct
- Ensure `infra/docker/Dockerfile` exists

### Deploy Workflow Fails

**AWS credentials error:**
- Verify `AWS_ROLE_ARN` secret is set correctly
- Check IAM role trust policy allows GitHub Actions
- Ensure role has required permissions

**Terraform fails:**
- Check Terraform state is accessible
- Verify AWS credentials have Terraform permissions
- Review Terraform logs in workflow output

**Kubernetes deployment fails:**
- Ensure EKS cluster exists
- Check kubectl can access cluster
- Verify deployment manifests exist

**Health check fails:**
- Check service is running: `kubectl get pods -n default`
- Verify LoadBalancer is provisioned
- Check application logs

## Disabling Workflows

To temporarily disable a workflow:

1. Go to: `Actions → [Workflow Name]`
2. Click "..." → "Disable workflow"

Or delete/rename the `.yml` file.

## Local Testing

### Test CI workflow locally

Using [act](https://github.com/nektos/act):

```bash
# Install act
brew install act

# Run CI workflow
act -j test
act -j lint
act -j build
```

### Test Terraform locally

```bash
cd infra/terraform
terraform init
terraform plan
```

### Test Kubernetes deployment locally

```bash
# Build images
docker build -f infra/docker/Dockerfile -t tenant-service:local ./backend
docker build -f infra/docker/Dockerfile.ingestion -t ingestion-service:local ./backend

# Deploy to local k8s (minikube/kind)
kubectl apply -f infra/helm/tenant-service/templates/
```

## Best Practices

1. **Always test locally** before pushing
2. **Use pull requests** to trigger CI before merging
3. **Review workflow logs** for any warnings
4. **Keep secrets secure** - never commit them
5. **Update workflows** when infrastructure changes
6. **Monitor costs** - disable workflows if not needed

## Future Improvements

- [ ] Add frontend build/deploy workflow
- [ ] Add database migration workflow
- [ ] Add security scanning (Trivy, Snyk)
- [ ] Add performance testing
- [ ] Add automated rollback on failure
- [ ] Add Slack/Discord notifications
- [ ] Add deployment approval gates
