# AzSpider AWS Deployment Guide

This guide will help you deploy AzSpider to AWS using ECR and ECS.

## Prerequisites

1. AWS CLI installed and configured
2. Docker installed
3. Node.js and npm installed
4. Your AWS account ID: `589288742364`

## Step 1: Set Up AWS Resources

### 1.1 Create ECR Repositories
```bash
aws ecr create-repository --repository-name azspider-backend --region us-east-1
aws ecr create-repository --repository-name azspider-webhook --region us-east-1
```

### 1.2 Create ECS Cluster
```bash
aws ecs create-cluster --cluster-name azspider-cluster --region us-east-1
```

### 1.3 Create CloudWatch Log Groups
```bash
aws logs create-log-group --log-group-name /ecs/azspider-backend --region us-east-1
aws logs create-log-group --log-group-name /ecs/azspider-webhook --region us-east-1
```

### 1.4 Create Secrets in AWS Secrets Manager
Create these secrets in the AWS Console (Secrets Manager):

- `azspider/openai-api-key` - Your OpenAI API key
- `azspider/phone-api-key` - Your phone validation API key (optional)
- `azspider/stripe-secret-key` - Your Stripe secret key
- `azspider/stripe-webhook-secret` - Your Stripe webhook secret
- `azspider/supabase-url` - Your Supabase project URL
- `azspider/supabase-service-key` - Your Supabase service role key

## Step 2: Build and Push Docker Images

### 2.1 Build Backend Image (with Python/Sherlock)
```bash
cd azspider-main/backend
# Install Node.js dependencies first
npm install

# Build the Docker image (includes Python and Sherlock)
docker build -t azspider-backend:latest .
docker tag azspider-backend:latest 589288742364.dkr.ecr.us-east-1.amazonaws.com/azspider-backend:latest
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 589288742364.dkr.ecr.us-east-1.amazonaws.com
docker push 589288742364.dkr.ecr.us-east-1.amazonaws.com/azspider-backend:latest
```

**Note**: The backend container includes:
- Node.js runtime for the API server
- Python 3 with virtual environment
- Sherlock project with all dependencies
- All required Python packages for social media analysis

### 2.2 Build Webhook Image
```bash
cd azspider-main/webhook-server
docker build -t azspider-webhook:latest .
docker tag azspider-webhook:latest 589288742364.dkr.ecr.us-east-1.amazonaws.com/azspider-webhook:latest
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 589288742364.dkr.ecr.us-east-1.amazonaws.com
docker push 589288742364.dkr.ecr.us-east-1.amazonaws.com/azspider-webhook:latest
```

## Step 3: Deploy to ECS

### 3.1 Register Task Definitions
```bash
aws ecs register-task-definition --cli-input-json file://aws/backend-task-definition.json --region us-east-1
aws ecs register-task-definition --cli-input-json file://aws/webhook-task-definition.json --region us-east-1
```

### 3.2 Create ECS Services
You'll need to create ECS services through the AWS Console or CLI. Here's an example for the backend service:

```bash
aws ecs create-service \
  --cluster azspider-cluster \
  --service-name azspider-backend-service \
  --task-definition azspider-backend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
  --region us-east-1
```

## Step 4: Configure Load Balancer

### 4.1 Create Application Load Balancer
1. Go to EC2 → Load Balancers
2. Create Application Load Balancer
3. Configure listeners for ports 80 and 443
4. Create target groups for backend (port 8000) and webhook (port 3000)

### 4.2 Configure DNS
1. Point your domain `azspider.com` to the load balancer
2. Set up SSL certificate for HTTPS

## Step 5: Update Frontend Configuration

Update your frontend to point to the deployed backend:

```env
VITE_API_URL=https://azspider.com/api
```

## Step 6: Configure Stripe Webhook

In your Stripe dashboard:
- **Endpoint URL**: `https://azspider.com/webhook`
- **Events**: Select the events your webhook handles
- **API Version**: `2025-09-30.clover`

## Troubleshooting

### Check ECS Service Status
```bash
aws ecs describe-services --cluster azspider-cluster --services azspider-backend-service --region us-east-1
```

### View Logs
```bash
aws logs tail /ecs/azspider-backend --follow --region us-east-1
aws logs tail /ecs/azspider-webhook --follow --region us-east-1
```

### Test Health Endpoints
- Backend: `https://azspider.com/health`
- Webhook: `https://azspider.com/webhook/health`

## Architecture Overview

```
Internet → ALB → ECS Services
                ├── Backend (port 8000) → OpenAI API + Python/Sherlock
                └── Webhook (port 3000) → Supabase
```

### Backend Container Details
- **Node.js API Server**: Handles HTTP requests and orchestrates analysis
- **Python Virtual Environment**: Contains Sherlock project for social media analysis
- **Sherlock Dependencies**: All required packages for OSINT analysis
- **Health Checks**: Built-in health monitoring for container orchestration

## Cost Optimization

- Use Fargate Spot for non-critical workloads
- Set up auto-scaling based on CPU/memory usage
- Use CloudFront for frontend static assets
- Consider Reserved Instances for predictable workloads
