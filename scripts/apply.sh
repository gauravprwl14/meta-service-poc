#!/bin/sh

# Check if environment name and app name are provided
if [ $# -ne 2 ]; then
    echo "Usage: $0 <environment_name> <app_name>"
    exit 1
fi

ENV_NAME=$1
APP_NAME=$2

echo "Starting apply phase for environment: $ENV_NAME"
echo "Application: $APP_NAME"
echo "Timestamp: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "----------------------------------------"

# Function to simulate random delay
random_delay() {
    delay=$(awk -v min=2 -v max=5 'BEGIN{srand(); print int(min+rand()*(max-min+1))}')
    sleep $delay
}

# Function to simulate task with progress
show_progress() {
    task=$1
    echo "  → $task: Starting"
    for i in 1 2 3 4 5; do
        sleep 1
        echo "  → $task: $((i * 20))% complete"
    done
    echo "  → $task: Completed"
}

# Infrastructure setup
echo "1. Setting up base infrastructure..."
show_progress "Network configuration"
random_delay
show_progress "Security group setup"
random_delay

# Resource provisioning
echo "2. Provisioning resources..."
echo "  → Creating compute instances"
random_delay
show_progress "Storage allocation"
echo "  → Configuring load balancer"
random_delay
show_progress "Database setup"

# Service deployment
echo "3. Deploying services..."
show_progress "Container deployment"
random_delay
show_progress "Service mesh configuration"
random_delay

# Configuration and validation
echo "4. Configuring environment..."
show_progress "DNS configuration"
random_delay
show_progress "SSL certificate installation"
random_delay

# Health checks
echo "5. Running health checks..."
echo "  → Checking service endpoints"
random_delay
echo "  → Validating database connections"
random_delay
echo "  → Verifying network connectivity"
sleep 2

echo "✓ Environment setup completed"

# Example warnings
echo "Warning: Using default security settings" >&2
echo "Warning: Remember to update DNS records" >&2
echo "Warning: Backup system needs manual verification" >&2

exit 0 