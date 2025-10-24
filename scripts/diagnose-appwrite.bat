@echo off
echo ========================================
echo   APPWRITE DIAGNOSTIC TOOL (Windows)
echo ========================================
echo Timestamp: %date% %time%
echo.

REM Check Docker
echo Checking Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker not found!
    echo Please install Docker Desktop
    pause
    exit /b 1
)
echo [OK] Docker installed
echo.

REM Check Appwrite containers
echo Checking Appwrite containers...
echo Running containers:
docker ps --format "table {{.Names}}\t{{.Status}}" | findstr appwrite
echo.

REM Check if main containers are running
docker ps | findstr "appwrite-mariadb" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] MariaDB container not running!
    echo Try: docker-compose up -d appwrite-mariadb
)

docker ps | findstr "appwrite " >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Appwrite container not running!
    echo Try: docker-compose up -d appwrite
)

REM Check Appwrite health
echo Checking Appwrite health...
curl -s http://192.168.2.3/v1/health >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Appwrite not responding!
    echo Check if Appwrite is running: docker ps
) else (
    echo [OK] Appwrite is responding
)
echo.

REM Check MariaDB connection
echo Checking MariaDB connection...
docker exec appwrite-mariadb mysql -u aFY3Sq5TzKjmwsnS -pUcR5zXFrLpGk84UeTAjRCSn4Mp9kUD2j -e "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] MariaDB connection failed!
    echo Try: docker restart appwrite-mariadb
) else (
    echo [OK] MariaDB connection successful
)
echo.

REM Check property_assessments table
echo Checking property_assessments collection...
docker exec appwrite-mariadb mysql -u aFY3Sq5TzKjmwsnS -pUcR5zXFrLpGk84UeTAjRCSn4Mp9kUD2j appwrite -e "SELECT COUNT(*) as count FROM _1_property_assessments;" 2>nul
if errorlevel 1 (
    echo [ERROR] Table not found or error accessing it
    echo Try running: node scripts\setup-admin.js
) else (
    echo [OK] Table exists
)
echo.

REM Check resource usage
echo Checking resource usage...
echo Docker stats (snapshot):
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | findstr appwrite
echo.

REM Check recent logs
echo Recent Appwrite logs (last 10 lines)...
docker logs appwrite --tail 10
echo.

echo Recent MariaDB logs (last 10 lines)...
docker logs appwrite-mariadb --tail 10
echo.

REM Summary
echo ========================================
echo   DIAGNOSTIC SUMMARY
echo ========================================
echo.
echo Next steps:
echo 1. If containers not running: docker-compose up -d
echo 2. If database connection fails: docker restart appwrite-mariadb
echo 3. If Appwrite not responding: docker restart appwrite
echo 4. Check full logs: docker logs appwrite
echo 5. Run table debug in browser: await quickStatus('property_assessments')
echo.
echo Diagnostic complete!
echo.
pause
