#!/bin/bash
#
# Web Deployment Script for zkTelos Wallet
#
# This script builds the React web app and deploys it to AWS S3.
#
# Usage:
#   ./scripts/deploy-web.sh [environment]
#
# Arguments:
#   environment - Target environment: "staging" or "production" (default: staging)
#
# Examples:
#   ./scripts/deploy-web.sh           # Deploy to staging
#   ./scripts/deploy-web.sh staging   # Deploy to staging
#   ./scripts/deploy-web.sh production # Deploy to production
#
# Prerequisites:
#   - Node.js 20.x
#   - Yarn
#   - AWS CLI configured with appropriate credentials
#
# Environment Variables:
#   AWS_ACCESS_KEY_ID     - AWS access key (required)
#   AWS_SECRET_ACCESS_KEY - AWS secret key (required)
#   AWS_REGION           - AWS region (default: us-east-2)

set -e  # Exit on error

# Configuration
ENVIRONMENT="${1:-staging}"
AWS_REGION="${AWS_REGION:-us-east-2}"

# S3 bucket configuration
if [ "$ENVIRONMENT" = "production" ]; then
    S3_BUCKET="telos-privacy-ui"
    REACT_APP_CONFIG="prod"
elif [ "$ENVIRONMENT" = "staging" ]; then
    S3_BUCKET="telos-privacy-ui-staging"
    REACT_APP_CONFIG="dev"
else
    echo "Error: Invalid environment '$ENVIRONMENT'. Use 'staging' or 'production'."
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Print banner
echo ""
echo "=============================================="
echo "  zkTelos Wallet - Web Deployment Script"
echo "=============================================="
echo "  Environment: $ENVIRONMENT"
echo "  S3 Bucket:   $S3_BUCKET"
echo "  AWS Region:  $AWS_REGION"
echo "=============================================="
echo ""

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js not found. Please install Node.js 20.x"
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_warning "Node.js version $NODE_VERSION detected. Recommended: 20.x"
    fi

    # Check Yarn
    if ! command -v yarn &> /dev/null; then
        log_error "Yarn not found. Please install: npm install -g yarn"
        exit 1
    fi

    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI not found. Please install: https://aws.amazon.com/cli/"
        exit 1
    fi

    # Check AWS credentials
    if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
        log_error "AWS credentials not configured."
        log_error "Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables."
        log_error ""
        log_error "Example:"
        log_error "  export AWS_ACCESS_KEY_ID=\"your-access-key\""
        log_error "  export AWS_SECRET_ACCESS_KEY=\"your-secret-key\""
        log_error ""
        log_error "Or source the credentials file if available:"
        log_error "  source path/to/aws-credentials.txt"
        exit 1
    fi

    # Verify AWS credentials work
    log_info "Verifying AWS credentials..."
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials are invalid or expired."
        log_error "Please update your credentials and try again."
        exit 1
    fi

    log_success "All prerequisites met!"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."

    # Check if node_modules exists and yarn.lock hasn't changed
    if [ -d "node_modules" ] && [ -f "yarn.lock" ]; then
        log_info "node_modules exists, running yarn to update if needed..."
    fi

    yarn install

    log_success "Dependencies installed!"
}

# Build zkbob-client-js
build_client() {
    log_info "Building zkbob-client-js library..."

    yarn workspace zkbob-client-js build

    log_success "zkbob-client-js built!"
}

# Build web app
build_web() {
    log_info "Building web app for $ENVIRONMENT..."

    # Navigate to app directory
    cd apps/zktelos-wallet

    # Set environment variables for build
    export NODE_OPTIONS="--max-old-space-size=8192"
    export REACT_APP_CONFIG="$REACT_APP_CONFIG"
    export REACT_APP_BUILD_TARGET=""  # Web build, not electron

    # Run build
    yarn build

    # Return to root
    cd ../..

    log_success "Web app built!"
}

# Deploy to S3
deploy_to_s3() {
    log_info "Deploying to S3 bucket: $S3_BUCKET..."

    BUILD_DIR="apps/zktelos-wallet/build"

    if [ ! -d "$BUILD_DIR" ]; then
        log_error "Build directory not found: $BUILD_DIR"
        log_error "Please run the build step first."
        exit 1
    fi

    # Sync files to S3
    # --delete removes files from S3 that don't exist locally
    # --cache-control sets caching headers
    aws s3 sync "$BUILD_DIR" "s3://$S3_BUCKET/" \
        --delete \
        --cache-control "max-age=31536000" \
        --exclude "*.html" \
        --exclude "service-worker.js" \
        --exclude "manifest.json"

    # Upload HTML and service worker with no-cache headers
    aws s3 sync "$BUILD_DIR" "s3://$S3_BUCKET/" \
        --include "*.html" \
        --include "service-worker.js" \
        --include "manifest.json" \
        --cache-control "no-cache, no-store, must-revalidate"

    log_success "Deployed to S3!"
}

# Print deployment info
print_deployment_info() {
    echo ""
    echo "=============================================="
    echo "  Deployment Complete!"
    echo "=============================================="
    echo ""

    if [ "$ENVIRONMENT" = "production" ]; then
        echo "  Production URL:"
        echo "  http://telos-privacy-ui.s3-website.us-east-2.amazonaws.com/"
    else
        echo "  Staging URL:"
        echo "  http://telos-privacy-ui-staging.s3-website.us-east-2.amazonaws.com/"
    fi

    echo ""
    echo "  S3 Bucket: $S3_BUCKET"
    echo "  Region:    $AWS_REGION"
    echo ""
    echo "=============================================="
}

# Main execution
main() {
    log_info "Starting web deployment..."

    # Confirm production deployment
    if [ "$ENVIRONMENT" = "production" ]; then
        echo ""
        log_warning "You are about to deploy to PRODUCTION!"
        read -p "Are you sure you want to continue? (y/N) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Deployment cancelled."
            exit 0
        fi
    fi

    check_prerequisites
    install_dependencies
    build_client
    build_web
    deploy_to_s3
    print_deployment_info

    log_success "Web deployment completed successfully!"
}

# Run main
main
