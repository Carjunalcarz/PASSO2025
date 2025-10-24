#!/bin/bash

echo "🔍 ========== APPWRITE DIAGNOSTIC TOOL =========="
echo "⏰ Timestamp: $(date)"
echo ""

# Check Docker
echo "🐳 Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found!"
    exit 1
fi
echo "✅ Docker installed"
echo ""

# Check Appwrite containers
echo "📦 Checking Appwrite containers..."
echo "Running containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep appwrite
echo ""

# Check if main containers are running
if ! docker ps | grep -q "appwrite-mariadb"; then
    echo "❌ MariaDB container not running!"
    echo "💡 Try: docker-compose up -d appwrite-mariadb"
fi

if ! docker ps | grep -q "appwrite "; then
    echo "❌ Appwrite container not running!"
    echo "💡 Try: docker-compose up -d appwrite"
fi

# Check Appwrite health
echo "🏥 Checking Appwrite health..."
HEALTH=$(curl -s http://192.168.2.3/v1/health 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Appwrite is responding"
    echo "Response: $HEALTH"
else
    echo "❌ Appwrite not responding!"
    echo "💡 Check if Appwrite is running: docker ps | grep appwrite"
fi
echo ""

# Check MariaDB connection
echo "🗄️ Checking MariaDB connection..."
DB_CHECK=$(docker exec appwrite-mariadb mysql -u aFY3Sq5TzKjmwsnS -pUcR5zXFrLpGk84UeTAjRCSn4Mp9kUD2j -e "SELECT 1;" 2>&1)
if [ $? -eq 0 ]; then
    echo "✅ MariaDB connection successful"
else
    echo "❌ MariaDB connection failed!"
    echo "Error: $DB_CHECK"
    echo "💡 Try: docker restart appwrite-mariadb"
fi
echo ""

# Check database size
echo "📊 Checking database size..."
DB_SIZE=$(docker exec appwrite-mariadb mysql -u aFY3Sq5TzKjmwsnS -pUcR5zXFrLpGk84UeTAjRCSn4Mp9kUD2j appwrite -e "SELECT table_schema AS 'Database', ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' FROM information_schema.TABLES WHERE table_schema = 'appwrite' GROUP BY table_schema;" 2>&1)
echo "$DB_SIZE"
echo ""

# Check property_assessments table
echo "📋 Checking property_assessments collection..."
TABLE_COUNT=$(docker exec appwrite-mariadb mysql -u aFY3Sq5TzKjmwsnS -pUcR5zXFrLpGk84UeTAjRCSn4Mp9kUD2j appwrite -e "SELECT COUNT(*) as count FROM _1_property_assessments;" 2>&1 | tail -1)
if [ $? -eq 0 ]; then
    echo "✅ Table exists"
    echo "📊 Record count: $TABLE_COUNT"
else
    echo "❌ Table not found or error accessing it"
    echo "💡 Try running: node scripts/setup-admin.js"
fi
echo ""

# Check resource usage
echo "💾 Checking resource usage..."
echo "Docker stats (5 second snapshot):"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | grep appwrite
echo ""

# Check disk space
echo "💿 Checking disk space..."
df -h | grep -E "Filesystem|/$"
echo ""

# Check recent logs
echo "📝 Recent Appwrite logs (last 10 lines)..."
docker logs appwrite --tail 10 2>&1
echo ""

echo "📝 Recent MariaDB logs (last 10 lines)..."
docker logs appwrite-mariadb --tail 10 2>&1
echo ""

# Summary
echo "✅ ========== DIAGNOSTIC SUMMARY =========="
echo ""
echo "Next steps:"
echo "1. If containers not running: docker-compose up -d"
echo "2. If database connection fails: docker restart appwrite-mariadb"
echo "3. If Appwrite not responding: docker restart appwrite"
echo "4. Check full logs: docker logs appwrite"
echo "5. Run table debug in browser: await quickStatus('property_assessments')"
echo ""
echo "🔍 Diagnostic complete!"
