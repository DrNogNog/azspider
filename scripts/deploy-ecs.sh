#!/bin/bash

# Deploy AzSpider services to ECS
set -e

# Configuration
AWS_REGION="us-east-1"
CLUSTER_NAME="azspider-cluster"
BACKEND_SERVICE="azspider-backend-service"
WEBHOOK_SERVICE="azspider-webhook-service"
BACKEND_TASK_DEFINITION="aws/backend-task-definition.json"
WEBHOOK_TASK_DEFINITION="aws/webhook-task-definition.json"

echo "Deploying AzSpider services to ECS..."

# Register task definitions
echo "Registering backend task definition..."
aws ecs register-task-definition \
  --cli-input-json file://${BACKEND_TASK_DEFINITION} \
  --region ${AWS_REGION}

echo "Registering webhook task definition..."
aws ecs register-task-definition \
  --cli-input-json file://${WEBHOOK_TASK_DEFINITION} \
  --region ${AWS_REGION}

# Update services
echo "Updating backend service..."
aws ecs update-service \
  --cluster ${CLUSTER_NAME} \
  --service ${BACKEND_SERVICE} \
  --task-definition azspider-backend \
  --region ${AWS_REGION} \
  --force-new-deployment

echo "Updating webhook service..."
aws ecs update-service \
  --cluster ${CLUSTER_NAME} \
  --service ${WEBHOOK_SERVICE} \
  --task-definition azspider-webhook \
  --region ${AWS_REGION} \
  --force-new-deployment

echo "Deployment initiated! Check ECS console for status."
echo "Backend service: ${BACKEND_SERVICE}"
echo "Webhook service: ${WEBHOOK_SERVICE}"

