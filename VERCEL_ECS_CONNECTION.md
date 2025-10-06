# Vercel + AWS ECS Connection Guide

This guide explains how to connect your Vercel frontend to your AWS ECS backend.

## Architecture Overview

```
Internet → Vercel (azspider.com) → AWS ALB → ECS Backend (API)
                                ↓
                            AWS ECS Webhook → Supabase
```

## Step 1: Deploy Backend to AWS ECS

### 1.1 Create ECS Cluster and Services
```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name azspider-cluster --region us-east-1

# Register task definitions
aws ecs register-task-definition --cli-input-json file://aws/backend-task-definition.json --region us-east-1
aws ecs register-task-definition --cli-input-json file://aws/webhook-task-definition.json --region us-east-1
```

### 1.2 Create Application Load Balancer (ALB)
1. Go to EC2 → Load Balancers
2. Create Application Load Balancer
3. Configure listeners:
   - Port 80 (HTTP) → Redirect to HTTPS
   - Port 443 (HTTPS) → Backend target group
4. Create target groups:
   - Backend: Port 8000
   - Webhook: Port 3000

### 1.3 Get ALB DNS Name
After creating the ALB, note the DNS name (e.g., `azspider-123456789.us-east-1.elb.amazonaws.com`)

## Step 2: Configure DNS

### 2.1 Set up Subdomains
- `azspider.com` → Vercel (frontend)
- `api.azspider.com` → AWS ALB (backend)
- `webhook.azspider.com` → AWS ALB (webhook)

### 2.2 DNS Configuration
In your DNS provider (e.g., Cloudflare, Route 53):
```
azspider.com          A    Vercel IP
api.azspider.com      CNAME azspider-123456789.us-east-1.elb.amazonaws.com
webhook.azspider.com  CNAME azspider-123456789.us-east-1.elb.amazonaws.com
```

## Step 3: Configure Vercel

### 3.1 Environment Variables
In Vercel dashboard, add these environment variables:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=https://api.azspider.com
```

### 3.2 Build and Deploy
```bash
# Build with production environment
npm run build:prod

# Deploy to Vercel
vercel --prod
```

## Step 4: Configure CORS

### 4.1 Backend CORS (Already configured)
Your backend already has CORS enabled for all origins:
```javascript
res.header('Access-Control-Allow-Origin', '*');
```

### 4.2 Test CORS
```bash
# Test from Vercel domain
curl -H "Origin: https://azspider.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://api.azspider.com/api/search
```

## Step 5: Configure Stripe Webhook

### 5.1 Stripe Webhook URL
In Stripe dashboard:
- **Endpoint URL**: `https://webhook.azspider.com/webhook`
- **Events**: Select the events your webhook handles
- **API Version**: `2025-09-30.clover`

## Step 6: Test the Connection

### 6.1 Test Backend Health
```bash
curl https://api.azspider.com/health
# Should return: {"status":"healthy","timestamp":"...","environment":"production"}
```

### 6.2 Test Frontend → Backend
1. Go to `https://azspider.com`
2. Open browser dev tools → Network tab
3. Try the analyze function
4. Check that API calls go to `https://api.azspider.com/api/search`

### 6.3 Test Webhook
```bash
curl -X POST https://webhook.azspider.com/webhook \
     -H "Content-Type: application/json" \
     -d '{"test": "webhook"}'
```

## Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Check that backend CORS is configured
   - Verify the Origin header in requests

2. **API Not Found (404)**
   - Check ALB target group health
   - Verify ECS service is running
   - Check security group rules

3. **Connection Refused**
   - Check ALB listener configuration
   - Verify DNS resolution
   - Check security groups

4. **SSL Certificate Issues**
   - Ensure ALB has SSL certificate
   - Check certificate covers both domains

### Debug Commands:
```bash
# Check ECS service status
aws ecs describe-services --cluster azspider-cluster --services azspider-backend-service --region us-east-1

# Check ALB target health
aws elbv2 describe-target-health --target-group-arn your-target-group-arn --region us-east-1

# Test DNS resolution
nslookup api.azspider.com
```

## Cost Optimization

- Use Fargate Spot for non-critical workloads
- Set up auto-scaling based on CPU/memory
- Use CloudFront for static assets
- Consider Reserved Instances for predictable workloads

## Security Best Practices

- Use HTTPS everywhere
- Implement rate limiting on ALB
- Use AWS WAF for additional protection
- Rotate API keys regularly
- Monitor CloudTrail logs
