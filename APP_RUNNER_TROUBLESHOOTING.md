# AWS App Runner Troubleshooting Guide

## Current Issue
Your App Runner backend at `https://ctmq2synkb.us-east-1.awsapprunner.com` is responding with "Cannot GET /health" errors.

## Possible Causes

### 1. Wrong Application Running
The App Runner might be running a different application or the wrong container.

### 2. Port Configuration Issue
App Runner might not be configured to use port 8000.

### 3. Health Check Endpoint Missing
The backend might not have the health endpoint configured.

## Solutions

### Solution 1: Check App Runner Configuration

1. Go to AWS Console → App Runner
2. Find your service `ctmq2synkb`
3. Check the configuration:
   - **Port**: Should be 8000
   - **Health Check Path**: Should be `/health`
   - **Start Command**: Should be `node app.js`

### Solution 2: Update App Runner Service

If the configuration is wrong, update it:

```bash
# Update the App Runner service configuration
aws apprunner update-service \
  --service-arn arn:aws:apprunner:us-east-1:589288742364:service/ctmq2synkb \
  --source-configuration '{
    "ImageRepository": {
      "ImageIdentifier": "589288742364.dkr.ecr.us-east-1.amazonaws.com/azspider-backend:latest",
      "ImageConfiguration": {
        "Port": "8000",
        "RuntimeEnvironmentVariables": {
          "NODE_ENV": "production",
          "PORT": "8000"
        }
      },
      "ImageRepositoryType": "ECR"
    }
  }' \
  --instance-configuration '{
    "Cpu": "0.25 vCPU",
    "Memory": "0.5 GB"
  }' \
  --health-check-configuration '{
    "Protocol": "HTTP",
    "Path": "/health",
    "Interval": 10,
    "Timeout": 5,
    "HealthyThreshold": 1,
    "UnhealthyThreshold": 5
  }'
```

### Solution 3: Redeploy with Correct Configuration

1. **Push your backend image to ECR**:
   ```bash
   cd azspider-main/backend
   docker build -t azspider-backend:latest .
   docker tag azspider-backend:latest 589288742364.dkr.ecr.us-east-1.amazonaws.com/azspider-backend:latest
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 589288742364.dkr.ecr.us-east-1.amazonaws.com
   docker push 589288742364.dkr.ecr.us-east-1.amazonaws.com/azspider-backend:latest
   ```

2. **Update App Runner service** to use the new image

### Solution 4: Check Backend Logs

1. Go to AWS Console → App Runner
2. Click on your service
3. Go to "Logs" tab
4. Check for any error messages

## Expected Response

Once fixed, your backend should respond:

```bash
curl https://ctmq2synkb.us-east-1.awsapprunner.com/health
# Should return: {"status":"healthy","timestamp":"...","environment":"production"}
```

## Quick Test

Test the API endpoint:
```bash
curl -X POST https://ctmq2synkb.us-east-1.awsapprunner.com/api/search \
  -H "Content-Type: application/json" \
  -d '{"username": "test"}'
```

## Alternative: Create New App Runner Service

If the current service can't be fixed, create a new one:

1. Go to AWS Console → App Runner
2. Click "Create service"
3. Choose "Container registry" → ECR
4. Select your `azspider-backend` repository
5. Configure:
   - **Port**: 8000
   - **Health check path**: `/health`
   - **Environment variables**: Add your secrets
6. Deploy

## Environment Variables Needed

Make sure these are set in App Runner:
- `NODE_ENV=production`
- `PORT=8000`
- `OPENAI_API_KEY=your_key`
- `PHONE_VALIDATION_API_KEY=your_key` (optional)


