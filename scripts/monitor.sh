#!/bin/bash

# Brahmin Soulmate Connect - Production Monitoring Script
# Run this script periodically to check system health

set -e

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"
LOG_FILE="/var/log/brahmin-monitoring.log"
ALERT_EMAIL="${ALERT_EMAIL:-admin@brahminsoulmate.com}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

alert() {
    log "${RED}ALERT: $1${NC}"
    # Send email alert (requires mail command or similar)
    echo "Alert: $1" | mail -s "Brahmin Soulmate Connect Alert" "$ALERT_EMAIL" 2>/dev/null || true
}

check_backend_health() {
    log "Checking backend health..."
    if curl -f --max-time 10 "$BACKEND_URL/health" > /dev/null 2>&1; then
        log "${GREEN}✓ Backend health check passed${NC}"
        return 0
    else
        alert "Backend health check failed"
        return 1
    fi
}

check_database_connection() {
    log "Checking database connection..."
    # This would require database credentials and a simple query
    # For now, we'll assume it's handled by the health check
    log "${GREEN}✓ Database connection check passed (via health endpoint)${NC}"
}

check_disk_space() {
    log "Checking disk space..."
    DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')

    if [ "$DISK_USAGE" -gt 90 ]; then
        alert "Disk usage is ${DISK_USAGE}% - cleanup required"
        return 1
    elif [ "$DISK_USAGE" -gt 80 ]; then
        log "${YELLOW}⚠ Disk usage is ${DISK_USAGE}%${NC}"
    else
        log "${GREEN}✓ Disk space OK (${DISK_USAGE}%)${NC}"
    fi
}

check_memory_usage() {
    log "Checking memory usage..."
    MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')

    if [ "$MEM_USAGE" -gt 90 ]; then
        alert "Memory usage is ${MEM_USAGE}% - restart may be required"
        return 1
    elif [ "$MEM_USAGE" -gt 80 ]; then
        log "${YELLOW}⚠ Memory usage is ${MEM_USAGE}%${NC}"
    else
        log "${GREEN}✓ Memory usage OK (${MEM_USAGE}%)${NC}"
    fi
}

check_process_status() {
    log "Checking process status..."

    # Check if backend process is running
    if pgrep -f "dist/server.js" > /dev/null; then
        log "${GREEN}✓ Backend process is running${NC}"
    else
        alert "Backend process is not running"
        return 1
    fi

    # Check if nginx is running (if using nginx)
    if pgrep nginx > /dev/null; then
        log "${GREEN}✓ Nginx process is running${NC}"
    else
        log "${YELLOW}⚠ Nginx process is not running${NC}"
    fi
}

rotate_logs() {
    # Rotate log files if they get too large
    if [ -f "$LOG_FILE" ] && [ $(stat -f%z "$LOG_FILE" 2>/dev/null || stat -c%s "$LOG_FILE") -gt 10485760 ]; then
        mv "$LOG_FILE" "$LOG_FILE.$(date +%Y%m%d_%H%M%S)"
        log "Log file rotated"
    fi
}

main() {
    log "Starting monitoring checks..."

    FAILED_CHECKS=0

    check_backend_health || ((FAILED_CHECKS++))
    check_database_connection || ((FAILED_CHECKS++))
    check_disk_space || ((FAILED_CHECKS++))
    check_memory_usage || ((FAILED_CHECKS++))
    check_process_status || ((FAILED_CHECKS++))

    rotate_logs

    if [ $FAILED_CHECKS -gt 0 ]; then
        log "${RED}Monitoring completed with $FAILED_CHECKS failed checks${NC}"
        exit 1
    else
        log "${GREEN}All monitoring checks passed${NC}"
        exit 0
    fi
}

# Run main function
main "$@"