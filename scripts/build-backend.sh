#!/bin/bash

# Build and push backend to ECR
set -e

# Configuration
AWS_REGION="us-east-1"
ECR_REPOSITORY="azspider-backend"
IMAGE_TAG="latest"
ACCOUNT_ID="589288742364"

# Full ECR URI
ECR_URI="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${IMAGE_TAG}"

echo "Building backend Docker image..."

# Build the image
docker build -t ${ECR_REPOSITORY}:${IMAGE_TAG} ./backend/

# Tag for ECR
docker tag ${ECR_REPOSITORY}:${IMAGE_TAG} ${ECR_URI}

echo "Logging into ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

echo "Pushing image to ECR..."
docker push ${ECR_URI}

echo "Backend image pushed successfully!"
echo "ECR URI: ${ECR_URI}"
