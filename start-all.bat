@echo off
title CPLMS - Academic Project Management Platform
echo ========================================================
echo   Starting AI-Powered Academic Project Management Platform
echo ========================================================
echo.

echo [1/3] Starting FastAPI AI Microservice on port 8000...
start "CPLMS - AI Microservice (Port 8000)" cmd /k "cd ai-service && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

timeout /t 2 /nobreak >nul

echo [2/3] Starting Spring Boot Backend on port 8080...
start "CPLMS - Spring Boot Backend (Port 8080)" cmd /k "cd backend && ..\.tools\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run"

timeout /t 5 /nobreak >nul

echo [3/3] Starting Vite React Frontend on port 5173...
start "CPLMS - React Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo   All 3 services are launching in separate windows!
echo.
echo   - Frontend:       http://localhost:5173
echo   - Backend API:    http://localhost:8080
echo   - Swagger UI:     http://localhost:8080/swagger-ui.html
echo   - AI Service:     http://localhost:8000
echo   - AI Docs:        http://localhost:8000/docs
echo.
echo   Demo Login Accounts:
echo   - Student Lead:        student.lead@gcet.edu.in / password123
echo   - Student Member:      student.member@gcet.edu.in / password123
echo   - Internal Guide:      internalguide@gcet.edu.in / password123
echo   - Section Coordinator: sectionguide@gcet.edu.in / password123
echo   - Overall Coordinator: coordinator@gcet.edu.in / password123
echo   - Panel Reviewer:      panel.member@gcet.edu.in / password123
echo   - Admin:               admin@gcet.edu.in / password123
echo ========================================================
pause
