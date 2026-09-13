# AI-Powered College Project Lifecycle Management & Intelligence Platform (CPLMS)

A full-stack, enterprise-grade academic project management platform featuring **Spring Boot 3**, **FastAPI AI Microservice**, **React 19 + TypeScript + Vite**, and **Dual-Channel Notifications (Email + Discord Webhooks)**.

---

## ⚡ Option 1: 1-Click Launch (Windows)

Simply double-click the included batch script in the root directory:
```powershell
.\start-all.bat
```
This will automatically launch all 3 microservices in dedicated terminal windows.

---

## 🛠️ Option 2: Run Manually in 3 Terminals

Open 3 separate terminal / PowerShell windows in this project root folder:

### Terminal 1: FastAPI AI Microservice (Port 8000)
```powershell
cd ai-service
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- **Service URL**: `http://localhost:8000`
- **Swagger Docs**: `http://localhost:8000/docs`

### Terminal 2: Spring Boot Backend (Port 8080)
```powershell
cd backend
..\.tools\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
```
*(Or use `mvn spring-boot:run` if you have Maven globally installed).*
- **Backend API**: `http://localhost:8080`
- **OpenAPI / Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **H2 In-Memory Database Console**: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:cplmsdb`, User: `sa`, Password: *blank*)

### Terminal 3: React Frontend (Port 5173)
```powershell
cd frontend
npm install
npm run dev
```
- **Frontend App**: `http://localhost:5173`

---

## 👤 Pre-Seeded Demo Accounts (5 Roles)

You can use the **1-Click Role Switcher** in the top-right navbar, or log in with any of these credentials:

| Role | Email | Password | Key Responsibilities |
| :--- | :--- | :--- | :--- |
| **Student (Team Lead)** | `student.lead@gcet.edu.in` | `password123` | Submit proposals, run AI duplicate checks, manage teams, approve contribution logs |
| **Student (Team Member)** | `student.member@gcet.edu.in` | `password123` | Accept/decline team invites, log individual module hours & GitHub links |
| **Internal Guide** | `internalguide@gcet.edu.in` | `password123` | Mentors assigned teams, scores rubrics (Problem, Methodology, Feasibility, Innovation) |
| **Section Coordinator** | `sectionguide@gcet.edu.in` | `password123` | Section-wide team oversight, guide capacity balancing |
| **Overall Coordinator** | `coordinator@gcet.edu.in` | `password123` | Department allocation, capacity caps, final sign-offs |
| **Panel Reviewer** | `panel.member@gcet.edu.in` | `password123` | Independent 3-reviewer rubric scoring & blind/open review policy enforcement |
| **Administrator** | `admin@gcet.edu.in` | `password123` | Bulk Excel imports with AI column mapping, system audit logs |

---

## 🌟 Core Features Included

1. **AI Vector Novelty & Redundancy Screening**:
   - Token-based cosine similarity and complexity checks against past academic archives and active submissions.
   - Triggers duplication warnings when similarity $\ge 70\%$.

2. **Dual-Channel Notification Engine (Email + Discord)**:
   - Dispatches institutional email logs and rich color-coded Discord Webhook embeds on invites, proposals, guide allocations, reviews, and contribution sign-offs.
   - Built-in Discord Webhook tester in the top navbar notification bell.

3. **Team Formation State Machine**:
   - Strictly validates 2–4 members per team with invitation acceptance flows.

4. **Guide Workload Balancer**:
   - Hard faculty project limits (default max 3 teams/guide) strictly enforced by backend logic to prevent faculty burnout.

5. **Two-Level Contribution Tracking**:
   - Level 1: Student self-logs task hours and commit links.
   - Level 2: Designated Team Lead reviews and approves/rejects before guide evaluation.

6. **Bulk Excel Importer with AI Fuzzy Header Reconciliation**:
   - Upload roster Excel/CSV spreadsheets; AI automatically maps irregular column headers to entity schemas.
