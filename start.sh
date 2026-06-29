#!/bin/bash
# ============================================================
# CXE — START SCRIPT
# Run this on your DigitalOcean server (via SSH) when you want
# to bring the website back up.
# ============================================================

set -e

DEPLOY_DIR="$HOME/cxe-deploy"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║        CXE — Starting Services       ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Navigate to deploy directory
if [ ! -d "$DEPLOY_DIR" ]; then
  echo "❌ Deploy directory not found at $DEPLOY_DIR"
  echo "   Make sure you have deployed at least once via GitHub Actions."
  exit 1
fi

cd "$DEPLOY_DIR"

# Pull latest images (in case a new version was pushed while server was off)
echo "🔄 Pulling latest Docker images..."
docker compose pull

# Start all containers in detached (background) mode
echo "🚀 Starting all CXE containers..."
docker compose up -d --remove-orphans

echo ""
echo "✅ All containers started!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Frontend:  http://$(hostname -I | awk '{print $1}'):8080"
echo "🔌 Backend:   http://$(hostname -I | awk '{print $1}'):3000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show running containers
echo "📦 Running containers:"
docker compose ps
echo ""
