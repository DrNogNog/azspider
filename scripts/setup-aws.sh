#!/bin/bash

# Complete AWS setup for AzSpider
set -e

AWS_REGION="us-east-1"
ACCOUNT_ID="589288742364"

echo "Setting up AzSpider on AWS..."

# 1. Create ECR repositories
echo "Creating ECR repositories..."
aws ecr create-repository --repository-name azspider-backend --region ${AWS_REGION} || echo "Backend repository already exists"
aws ecr create-repository --repository-name azspider-webhook --region ${AWS_REGION} || echo "Webhook repository already exists"

# 2. Create CloudWatch log groups
echo "Creating CloudWatch log groups..."
aws logs create-log-group --log-group-name /ecs/azspider-backend --region ${AWS_REGION} || echo "Backend log group already exists"
aws logs create-log-group --log-group-name /ecs/azspider-webhook --region ${AWS_REGION} || echo "Webhook log group already exists"

# 3. Create ECS cluster
echo "Creating ECS cluster..."
aws ecs create-cluster --cluster-name azspider-cluster --region ${AWS_REGION} || echo "Cluster already exists"

# 4. Create VPC and networking (if needed)
echo "Setting up networking..."
# This would create VPC, subnets, security groups, etc.
# For now, we'll assume you have a default VPC

# 5. Create Application Load Balancer (if needed)
echo "Setting up load balancer..."
# This would create ALB, target groups, etc.

# 6. Create Secrets Manager secrets
echo "Creating secrets in Secrets Manager..."
echo "Please manually create these secrets in AWS Secrets Manager:"
echo "- azspider/openai-api-key"
echo "- azspider/phone-api-key"
echo "- azspider/stripe-secret-key"
echo "- azspider/stripe-webhook-secret"
echo "- azspider/supabase-url"
echo "- azspider/supabase-service-key"

echo "Setup complete! Next steps:"
echo "1. Create secrets in AWS Secrets Manager"
echo "2. Run: ./scripts/build-backend.sh"
echo "3. Run: ./scripts/build-webhook.sh"
echo "4. Run: ./scripts/deploy-ecs.sh"


