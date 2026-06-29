#!/bin/bash
# ============================================================
# CXE — STOP SCRIPT
# Run this on your DigitalOcean server (via SSH) when you're
# done using the website to stop all containers.
# ============================================================

set -e

DEPLOY_DIR="$HOME/cxe-deploy"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║        CXE — Stopping Services       ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Navigate to deploy directory
if [ ! -d "$DEPLOY_DIR" ]; then
  echo "❌ Deploy directory not found at $DEPLOY_DIR"
  echo "   Make sure you deployed at least once via GitHub Actions first."
  exit 1
fi

cd "$DEPLOY_DIR"

# Gracefully stop and remove all containers
echo "🛑 Stopping all CXE containers..."
docker compose down

echo ""
echo "✅ All containers stopped."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 To save 100% of compute cost, also power off"
echo "   your Droplet from the DigitalOcean dashboard:"
echo "   https://cloud.digitalocean.com/droplets"
echo "   → Click your Droplet → Power → Turn Off"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
