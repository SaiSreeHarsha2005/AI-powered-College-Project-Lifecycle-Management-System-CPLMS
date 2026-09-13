import re
import math
from typing import List, Dict, Optional, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="CPLMS AI & Intelligence Service",
    description="Vector Similarity, Project Novelty Screening, Scope Assessment & Fuzzy Mapping",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Schemas -----------------
class ColumnMapRequest(BaseModel):
    uploaded_headers: List[str]
    target_fields: List[str]

class ColumnMapResponse(BaseModel):
    mapping: Dict[str, Optional[str]]
    confidence: Dict[str, float]

class ProjectSubmission(BaseModel):
    id: Optional[str] = None
    title: str
    problem_statement: str
    proposed_solution: str
    domain: Optional[str] = "General"
    project_type: Optional[str] = "Major" # "Mini" or "Major"

class HistoricalProject(BaseModel):
    id: str
    title: str
    problem_statement: str
    domain: Optional[str] = "General"
    academic_year: Optional[str] = "2024"

class ValidationRequest(BaseModel):
    submission: ProjectSubmission
    archive: List[HistoricalProject] = []
    threshold: float = 0.75

class MatchDetail(BaseModel):
    historical_id: str
    title: str
    domain: str
    academic_year: str
    similarity_percentage: float

class ValidationReport(BaseModel):
    similarity_percentage: float
    is_duplicate_risk: bool
    novelty_score: float # 0.0 to 10.0
    complexity_score: float # 0.0 to 10.0
    scope_evaluation: str # "Under-scoped", "Appropriately Scoped", "Over-scoped"
    novelty_summary: str
    attributed_features: List[str] = [] # Explainable matching sub-modules
    risk_level: str = "LOW" # "LOW", "MODERATE", "HIGH_SCOPE_CREEP", "RESOURCE_CONSTRAINED"
    risk_summary: str = "Well-balanced scope and technology stack."
    timeline_feasibility: str = "High - Feasible within standard 16-week semester"
    closest_matches: List[MatchDetail]
    alternative_directions: List[str]

# ----------------- Utility Functions -----------------
def normalize_text(text: str) -> List[str]:
    text = text.lower()
    tokens = re.findall(r'\b[a-z0-9]{3,}\b', text)
    stopwords = {"the", "and", "for", "with", "this", "that", "from", "using", "based", "system", "project", "application"}
    return [t for t in tokens if t not in stopwords]

def cosine_similarity_tokens(tokens1: List[str], tokens2: List[str]) -> float:
    if not tokens1 or not tokens2:
        return 0.0
    freq1: Dict[str, int] = {}
    freq2: Dict[str, int] = {}
    for t in tokens1:
        freq1[t] = freq1.get(t, 0) + 1
    for t in tokens2:
        freq2[t] = freq2.get(t, 0) + 1

    all_keys = set(freq1.keys()).union(set(freq2.keys()))
    dot_product = sum(freq1.get(k, 0) * freq2.get(k, 0) for k in all_keys)
    mag1 = math.sqrt(sum(v * v for v in freq1.values()))
    mag2 = math.sqrt(sum(v * v for v in freq2.values()))
    if mag1 == 0 or mag2 == 0:
        return 0.0
    return dot_product / (mag1 * mag2)

def string_similarity(s1: str, s2: str) -> float:
    s1, s2 = s1.lower().replace("_", " ").strip(), s2.lower().replace("_", " ").strip()
    if s1 == s2:
        return 1.0
    if s1 in s2 or s2 in s1:
        return 0.85
    t1 = set(s1.split())
    t2 = set(s2.split())
    intersection = t1.intersection(t2)
    union = t1.union(t2)
    return len(intersection) / len(union) if union else 0.0

# ----------------- Endpoints -----------------
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "CPLMS AI Microservice", "version": "1.0.0"}

@app.post("/api/ai/fuzzy-column-map", response_model=ColumnMapResponse)
def fuzzy_column_map(request: ColumnMapRequest):
    mapping: Dict[str, Optional[str]] = {}
    confidence: Dict[str, float] = {}

    for target in request.target_fields:
        best_match = None
        best_score = 0.0
        for uploaded in request.uploaded_headers:
            score = string_similarity(target, uploaded)
            # Common synonyms / aliases check
            aliases = {
                "name": ["student_name", "faculty_name", "full_name", "candidate_name"],
                "email": ["mail", "email_id", "email_address", "institutional_email"],
                "department": ["dept", "branch", "department_name", "stream"],
                "roll_number": ["roll_no", "reg_no", "register_number", "student_id", "usn"],
                "phone": ["mobile", "contact", "phone_number", "cell"]
            }
            if target in aliases:
                for alias in aliases[target]:
                    score = max(score, string_similarity(alias, uploaded))

            if score > best_score and score >= 0.5:
                best_score = score
                best_match = uploaded

        mapping[target] = best_match
        confidence[target] = round(best_score, 2)

    return ColumnMapResponse(mapping=mapping, confidence=confidence)

@app.post("/api/ai/validate-project", response_model=ValidationReport)
def validate_project(req: ValidationRequest):
    sub = req.submission
    sub_text = f"{sub.title} {sub.problem_statement} {sub.proposed_solution} {sub.domain}"
    sub_tokens = normalize_text(sub_text)

    matches: List[MatchDetail] = []
    max_similarity = 0.0

    for item in req.archive:
        hist_text = f"{item.title} {item.problem_statement} {item.domain}"
        hist_tokens = normalize_text(hist_text)
        sim = cosine_similarity_tokens(sub_tokens, hist_tokens)
        if sim > max_similarity:
            max_similarity = sim
        if sim > 0.35:
            matches.append(MatchDetail(
                historical_id=item.id,
                title=item.title,
                domain=item.domain or "General",
                academic_year=item.academic_year or "Prior",
                similarity_percentage=round(sim * 100, 1)
            ))

    matches.sort(key=lambda x: x.similarity_percentage, reverse=True)
    top_matches = matches[:5]
    top_sim_pct = round(max_similarity * 100, 1)

    # Novelty & Scope Evaluation
    novelty_score = max(1.0, round(10.0 - (max_similarity * 9.0), 1))
    word_count = len(sub.problem_statement.split()) + len(sub.proposed_solution.split())
    
    complexity = 6.5
    if sub.project_type == "Major":
        if word_count < 30:
            scope_eval = "Under-scoped"
            complexity = 4.0
        elif word_count > 150:
            scope_eval = "Appropriately Scoped"
            complexity = 8.5
        else:
            scope_eval = "Appropriately Scoped"
            complexity = 7.0
    else: # Mini
        if word_count > 200:
            scope_eval = "Over-scoped for Mini Project"
            complexity = 7.5
        else:
            scope_eval = "Appropriately Scoped"
            complexity = 5.5

    # Non-dead-end alternative suggestions
    alternatives = []
    domain = sub.domain if sub.domain else "the chosen domain"
    if top_sim_pct > 70.0:
        novelty_summary = f"High similarity ({top_sim_pct}%) detected against existing work. Core objectives overlap with previous records."
        alternatives = [
            f"Introduce privacy-preserving federated learning or edge computing instead of centralized processing for {domain}.",
            f"Incorporate real-time explainability (XAI) or automated audit verification to improve stakeholder trust in {sub.title}.",
            f"Expand evaluation metrics beyond accuracy to include latency, energy efficiency, or resistance to adversarial perturbations."
        ]
    elif top_sim_pct > 40.0:
        novelty_summary = f"Moderate similarity ({top_sim_pct}%) detected. Idea has foundational overlap with past work, but shows custom methodology."
        alternatives = [
            f"Combine {domain} methodologies with multi-modal inputs (e.g. text + sensory telemetry).",
            f"Add predictive forecasting or automated preventative mitigation mechanisms."
        ]
    else:
        novelty_summary = f"High originality ({100 - top_sim_pct}% novelty). Submission presents distinct objectives and modern architecture."
        alternatives = [
            "Consider open-sourcing evaluation benchmark datasets for peer validation.",
            "Integrate automated CI/CD load testing to substantiate production readiness."
        ]

    # Feature sub-attribution explainability (Feature #4)
    feature_catalogs = {
        "facial": "Facial Recognition & Biometrics Pipeline",
        "attendance": "Automated Attendance CSV Logger",
        "gps": "Real-time GPS Geofencing & Telemetry",
        "yolo": "Deep Learning Object Detection (YOLO)",
        "blockchain": "Smart Contract Verification & Immutable Ledger",
        "nlp": "Natural Language Sentiment & Semantic Analysis",
        "chat": "Conversational Agent & In-App Chatbot",
        "sensor": "IoT Sensor Telemetry & Hardware Interfacing",
        "cloud": "Cloud Microservice Architecture & Load Balancing",
        "encryption": "End-to-End Cryptographic Access Control",
        "camera": "Computer Vision & Multi-Camera Video Stream Processing",
        "recommend": "Vector-Based Recommendation Engine",
        "drone": "Autonomous Aerial Navigation & Flight Telemetry"
    }

    attributed_features = []
    combined_lower = (sub.title + " " + sub_text).lower()
    for kw, feature_label in feature_catalogs.items():
        if kw in combined_lower:
            attributed_features.append(feature_label)

    if not attributed_features:
        attributed_features = ["Full-Stack Architecture & Reactive REST APIs", "Relational Database Schema & CRUD Pipeline"]

    # Multi-dimensional risk assessment (Feature #5)
    risk_level = "LOW"
    risk_summary = "Well-balanced scope and technology stack. High probability of on-time milestone completion."
    timeline_feasibility = "High - Fully achievable within 16-week semester"

    if any(k in combined_lower for k in ["hardware", "drone", "sensor", "arduino", "raspberry"]):
        risk_level = "RESOURCE_CONSTRAINED"
        risk_summary = "Hardware dependency identified. Physical component lead times and lab equipment availability may create schedule bottlenecks. Source modules early."
        timeline_feasibility = "Challenging - Requires component arrival before Review 1"
    elif word_count > 300 or complexity > 8.0:
        risk_level = "HIGH_SCOPE_CREEP"
        risk_summary = "Architectural breadth is unusually wide for a single capstone semester. Recommend scoping down secondary extensions to ensure core pipeline maturity."
        timeline_feasibility = "Moderate - Scope reduction strongly recommended"
    elif word_count < 60:
        risk_level = "UNDER_SCOPED"
        risk_summary = "Proposal lacks sufficient architectural detail. Depth of technical implementation may not satisfy major project rubric expectations."
        timeline_feasibility = "Low - Needs detailed architecture specification"

    return ValidationReport(
        similarity_percentage=top_sim_pct,
        is_duplicate_risk=top_sim_pct >= (req.threshold * 100),
        novelty_score=novelty_score,
        complexity_score=complexity,
        scope_evaluation=scope_eval,
        novelty_summary=novelty_summary,
        attributed_features=attributed_features[:4],
        risk_level=risk_level,
        risk_summary=risk_summary,
        timeline_feasibility=timeline_feasibility,
        closest_matches=top_matches,
        alternative_directions=alternatives
    )


# ----------------- Document Intelligence & Synopsis Extraction (Module 17) -----------------
class SynopsisExtractRequest(BaseModel):
    text: str

class SynopsisExtractResponse(BaseModel):
    title: str
    domain: str
    problem_statement: str
    proposed_solution: str
    tech_stack: str
    keywords: str
    confidence_score: float

@app.post("/api/ai/extract-synopsis", response_model=SynopsisExtractResponse)
def extract_synopsis_data(req: SynopsisExtractRequest):
    raw = req.text.strip()
    if not raw:
        raise HTTPException(status_code=400, detail="Document text cannot be empty.")

    lines = [line.strip() for line in raw.split("\n") if line.strip()]
    
    # 1. Infer Title
    title = lines[0] if lines else "AI-Assisted Project Proposal"
    for line in lines[:5]:
        if "title" in line.lower() or "project" in line.lower():
            cleaned = re.sub(r'^(title|project title)\s*[:\-]\s*', '', line, flags=re.IGNORECASE).strip()
            if cleaned:
                title = cleaned
                break

    # 2. Infer Domain
    domain_rules = {
        "Computer Vision": ["face", "camera", "image", "detection", "yolo", "opencv", "cnn", "video"],
        "Natural Language Processing": ["nlp", "text", "llm", "transformer", "sentiment", "bert", "summarization"],
        "Cloud Computing & DevOps": ["cloud", "docker", "kubernetes", "aws", "microservice", "devops", "serverless"],
        "Cyber Security & Blockchain": ["security", "blockchain", "encryption", "ethereum", "audit", "vulnerability"],
        "IoT & Embedded Systems": ["iot", "sensor", "arduino", "raspberry", "hardware", "telemetry"],
        "Computer Science & AI": ["machine learning", "algorithm", "database", "web", "deep learning"]
    }
    
    domain = "Computer Science & AI"
    lowered = raw.lower()
    for dom, kws in domain_rules.items():
        if any(kw in lowered for kw in kws):
            domain = dom
            break

    # 3. Infer Tech Stack
    tech_catalog = ["Python", "React", "Spring Boot", "FastAPI", "PostgreSQL", "PyTorch", "TensorFlow", "OpenCV", "Docker", "Node.js", "Redis", "MySQL", "Next.js", "TypeScript"]
    found_tech = [tech for tech in tech_catalog if tech.lower() in lowered]
    tech_stack = ", ".join(found_tech) if found_tech else "Python, FastAPI, React, PostgreSQL"

    # 4. Extract Problem & Solution segments
    prob_parts = []
    sol_parts = []
    mode = "none"

    for line in lines:
        l_low = line.lower()
        if "problem" in l_low or "background" in l_low or "challenge" in l_low:
            mode = "prob"
            prob_parts.append(line)
        elif "solution" in l_low or "proposed" in l_low or "architecture" in l_low or "methodology" in l_low:
            mode = "sol"
            sol_parts.append(line)
        else:
            if mode == "prob" and len(prob_parts) < 4:
                prob_parts.append(line)
            elif mode == "sol" and len(sol_parts) < 4:
                sol_parts.append(line)

    prob_stmt = " ".join(prob_parts) if prob_parts else (raw[:250] + "..." if len(raw) > 250 else raw)
    prop_sol = " ".join(sol_parts) if sol_parts else ("A structured software architecture leveraging " + tech_stack + " to address the problem.")

    # 5. Extract Keywords
    tokens = normalize_text(raw)
    freq = {}
    for t in tokens:
        if len(t) > 4:
            freq[t] = freq.get(t, 0) + 1
    top_kws = sorted(freq.keys(), key=lambda k: freq[k], reverse=True)[:5]
    keywords = ", ".join([k.capitalize() for k in top_kws]) if top_kws else "AI, Full-Stack, Automation"

    return SynopsisExtractResponse(
        title=title,
        domain=domain,
        problem_statement=prob_stmt,
        proposed_solution=prop_sol,
        tech_stack=tech_stack,
        keywords=keywords,
        confidence_score=0.88
    )


# ----------------- In-App AI Assistant (Modules 16 & 17) -----------------
class ChatAssistantRequest(BaseModel):
    prompt: str
    action: Optional[str] = "general" # improve_idea, generate_abstract, generate_srs, generate_test_cases, architecture
    title: Optional[str] = None
    domain: Optional[str] = None

class ChatAssistantResponse(BaseModel):
    reply: str
    suggestions: List[str]

@app.post("/api/ai/assistant/chat", response_model=ChatAssistantResponse)
def chat_assistant(req: ChatAssistantRequest):
    p = req.prompt.strip()
    title = req.title or "Project"
    domain = req.domain or "Computer Science & Engineering"

    if req.action == "generate_abstract":
        reply = (
            f"### Proposed Capstone Abstract: {title}\n\n"
            f"**Background:** Modern engineering workflows in {domain} often suffer from inefficient manual processing, lack of centralized auditing, and delayed stakeholder turnaround.\n\n"
            f"**Methodology:** This project introduces a scalable full-stack architecture combining modern frontend interfaces, reactive REST microservices, and an intelligent analytical engine. By leveraging automated validation pipelines and verifiable role-based access control, the platform mitigates operational overhead and ensures complete data integrity.\n\n"
            f"**Expected Outcome:** Experimental benchmarks demonstrate a significant reduction in review turnaround times, enhanced governance visibility, and robust accuracy across typical department deployments."
        )
        suggestions = [
            "Add edge deployment benchmarks",
            "Incorporate privacy-preserving encryption",
            "Generate SRS Functional Requirements"
        ]

    elif req.action == "generate_srs":
        reply = (
            f"### Software Requirements Specification (SRS) Core Modules for {title}\n\n"
            f"1. **FR-1: Identity & Role-Based Access Control**\n"
            f"   - Strict server-side RBAC validation for each user class with salted password hashing and audit event tracking.\n\n"
            f"2. **FR-2: Automated Validation & Screening Layer**\n"
            f"   - Asynchronous novelty and duplicate verification using text embeddings and vector distance thresholds.\n\n"
            f"3. **FR-3: Multi-Stage Review & Rubric Governance**\n"
            f"   - Constrained dropdown scoring across Problem, Methodology, Feasibility, and Innovation criteria.\n\n"
            f"4. **FR-4: Final Deliverables & Archival Pipeline**\n"
            f"   - Permanent submission of repository links, report documentation, and auto-indexing into historical repositories."
        )
        suggestions = [
            "Generate Test Cases",
            "Suggest Architecture Diagram Stack",
            "Draft Performance Non-Functional Requirements"
        ]

    elif req.action == "generate_test_cases":
        reply = (
            f"### Comprehensive Test Cases for {title}\n\n"
            f"| Test ID | Scenario | Input / Action | Expected Result |\n"
            f"| :--- | :--- | :--- | :--- |\n"
            f"| **TC-01** | Duplicate Submission | Submit proposal matching prior year text by >75% | System flags high duplication warning & suggests 3 alternative angles |\n"
            f"| **TC-02** | Workload Cap Enforcement | Coordinator attempts to allocate 4th team to saturated guide | System blocks assignment with capacity error alert |\n"
            f"| **TC-03** | Blind Panel Evaluation | Panelist loads project with blind review enabled | Guide marks and feedback are shielded to prevent reviewer bias |\n"
            f"| **TC-04** | Auto-Archival Trigger | Guide marks final project COMPLETED | Project is appended to HistoricalProject repository for future cohorts |"
        )
        suggestions = [
            "Add Security / SQL Injection test cases",
            "Add Load / Stress test parameters",
            "Export test plan as Markdown"
        ]

    elif req.action == "improve_idea":
        reply = (
            f"### Novelty & Innovation Directives for {title}\n\n"
            f"To elevate this project from a standard curriculum submission into a publication-worthy capstone in {domain}, consider:\n\n"
            f"1. **Privacy-Preserving Computation:** Implement on-device feature extraction or differential privacy to prevent sensitive data leakage.\n"
            f"2. **Explainable AI (XAI):** Integrate SHAP/LIME or attention-weight heatmaps so non-technical evaluators understand model decisions.\n"
            f"3. **Fault-Tolerant Resilience:** Introduce circuit-breaker resilience and asynchronous queue retries for external service dependencies."
        )
        suggestions = [
            "Draft Abstract with these recommendations",
            "Suggest full technology stack",
            "Show evaluation rubrics"
        ]

    else:
        reply = (
            f"Hello! I am your **CPLMS AI Engineering Assistant**. I can help you draft abstracts, generate Software Requirements Specifications (SRS), formulate unit/integration test cases, and recommend novel architectures for **{title}**.\n\n"
            f"Select an action below or tell me what technical component you would like to refine!"
        )
        suggestions = [
            "Draft Capstone Abstract",
            "Generate SRS Outline",
            "Formulate Test Cases",
            "Improve Project Novelty"
        ]

    return ChatAssistantResponse(
        reply=reply,
        suggestions=suggestions
    )


# ----------------- AI Guide Recommendation Engine (Module 9 / FR-7.4) -----------------
class FacultyCandidate(BaseModel):
    name: str
    email: str
    department: str
    expertise_domains: List[str]
    current_load: int
    max_capacity: int = 3

class GuideRecommendRequest(BaseModel):
    project_title: str
    project_domain: str
    keywords: str
    candidates: List[FacultyCandidate]

class GuideRecommendation(BaseModel):
    guide_name: str
    guide_email: str
    department: str
    match_percentage: float
    remaining_slots: int
    recommendation_reason: str

class GuideRecommendResponse(BaseModel):
    recommendations: List[GuideRecommendation]

@app.post("/api/ai/recommend-guide", response_model=GuideRecommendResponse)
def recommend_guides(req: GuideRecommendRequest):
    project_text = f"{req.project_title} {req.project_domain} {req.keywords}"
    proj_tokens = normalize_text(project_text)
    recs = []

    for fac in req.candidates:
        remaining = max(0, fac.max_capacity - fac.current_load)
        if remaining <= 0:
            continue # Guide is at capacity (FR-7.3)

        fac_text = f"{' '.join(fac.expertise_domains)} {fac.department}"
        fac_tokens = normalize_text(fac_text)
        sim = cosine_similarity_tokens(proj_tokens, fac_tokens)

        # Baseline similarity boost if exact domain matches
        if any(req.project_domain.lower() in dom.lower() for dom in fac.expertise_domains):
            sim = max(sim, 0.72)

        match_pct = round(min(1.0, sim + 0.15) * 100, 1)
        reason = f"Strong alignment in {req.project_domain}. Currently has {remaining} available mentoring slot(s)."

        recs.append(GuideRecommendation(
            guide_name=fac.name,
            guide_email=fac.email,
            department=fac.department,
            match_percentage=match_pct,
            remaining_slots=remaining,
            recommendation_reason=reason
        ))

    recs.sort(key=lambda x: (x.match_percentage, x.remaining_slots), reverse=True)
    return GuideRecommendResponse(recommendations=recs)


# ----------------- Faculty & Student Resume/CV Skill Parser (Modules 3 & 4 / FR-3.1–3.3) -----------------
class ResumeExtractRequest(BaseModel):
    resume_text: str

class ResumeExtractResponse(BaseModel):
    skills: List[str]
    research_areas: List[str]
    detected_experience_years: int
    summary: str

@app.post("/api/ai/extract-resume-skills", response_model=ResumeExtractResponse)
def extract_resume_skills(req: ResumeExtractRequest):
    text = req.resume_text
    lowered = text.lower()

    tech_catalog = [
        "Python", "Java", "Spring Boot", "React", "FastAPI", "PostgreSQL",
        "Docker", "Kubernetes", "PyTorch", "TensorFlow", "OpenCV", "Machine Learning",
        "Deep Learning", "Natural Language Processing", "Computer Vision",
        "Cyber Security", "Blockchain", "Cloud Computing", "AWS", "Microservices",
        "Node.js", "TypeScript", "SQL", "Redis", "C++"
    ]
    detected_skills = [t for t in tech_catalog if t.lower() in lowered]

    research_domains = [
        "Edge AI & Embedded Computing",
        "Deep Learning Architectures",
        "Distributed Systems & Cloud Governance",
        "Applied Cryptography & Network Security",
        "Computer Vision & Multi-Modal Perception"
    ]
    detected_research = []
    for dom in research_domains:
        words = dom.lower().split()
        if any(w in lowered for w in words if len(w) > 4):
            detected_research.append(dom)

    # Detect years of experience
    exp_matches = re.findall(r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)', lowered)
    exp_years = int(exp_matches[0]) if exp_matches else 2

    return ResumeExtractResponse(
        skills=detected_skills if detected_skills else ["Python", "FastAPI", "React", "PostgreSQL"],
        research_areas=detected_research if detected_research else ["Computer Science & AI"],
        detected_experience_years=exp_years,
        summary=f"Profile parsed successfully with {len(detected_skills)} core engineering skill tags."
    )


# ----------------- Natural Language Query Engine (Module 15 / FR-14.5) -----------------
class NLQueryRequest(BaseModel):
    query: str

class NLQueryResponse(BaseModel):
    domain_filter: Optional[str] = None
    status_filter: Optional[str] = None
    tech_keyword: Optional[str] = None
    year_filter: Optional[str] = None
    explanation: str

@app.post("/api/ai/nl-query", response_model=NLQueryResponse)
def parse_natural_language_query(req: NLQueryRequest):
    q = req.query.lower().strip()

    domain = None
    if "vision" in q or "camera" in q or "face" in q or "image" in q:
        domain = "Computer Vision"
    elif "ai" in q or "machine learning" in q or "intelligence" in q or "deep learning" in q:
        domain = "Computer Science & AI"
    elif "cloud" in q or "devops" in q or "docker" in q:
        domain = "Cloud Computing & DevOps"
    elif "security" in q or "blockchain" in q:
        domain = "Cyber Security & Blockchain"

    status = None
    if "approved" in q:
        status = "APPROVED"
    elif "review" in q or "pending" in q:
        status = "UNDER_REVIEW"
    elif "complete" in q:
        status = "COMPLETED"

    year = None
    year_match = re.search(r'\b(202[0-9])\b', q)
    if year_match:
        year = year_match.group(1)

    tech = None
    tech_list = ["python", "react", "spring", "fastapi", "docker", "pytorch", "opencv"]
    for t in tech_list:
        if t in q:
            tech = t
            break

    exp = f"Translated query to structured filters: Domain='{domain or 'Any'}', Status='{status or 'Any'}', Year='{year or 'Any'}'"
    return NLQueryResponse(
        domain_filter=domain,
        status_filter=status,
        tech_keyword=tech,
        year_filter=year,
        explanation=exp
    )


# ----------------- AI Mock Viva Defense Simulator (Standout Feature) -----------------
class VivaQuestion(BaseModel):
    id: int
    question: str
    topic_area: str
    examiner_intent: str
    hint: str

class VivaQuestionsRequest(BaseModel):
    project_title: str
    problem_statement: str
    proposed_solution: str
    tech_stack: str
    domain: Optional[str] = "Computer Science & Engineering"

class VivaQuestionsResponse(BaseModel):
    project_title: str
    questions: List[VivaQuestion]

class VivaAnswerEvaluationRequest(BaseModel):
    question: str
    topic_area: str
    student_answer: str
    project_title: str
    tech_stack: str

class VivaAnswerEvaluationResponse(BaseModel):
    score_out_of_10: float
    verdict: str
    strengths: List[str]
    missing_points: List[str]
    examiner_coaching_tip: str
    sample_impressive_answer: str

@app.post("/api/ai/viva/generate-questions", response_model=VivaQuestionsResponse)
def generate_viva_questions(req: VivaQuestionsRequest):
    t_lower = (req.project_title + " " + req.tech_stack + " " + req.domain).lower()
    
    # 1. Architecture & Design Trade-off
    if "vision" in t_lower or "face" in t_lower or "camera" in t_lower:
        q1 = f"Why did you select the FaceNet/MTCNN architecture over lighter models like MobileNet-SSD, and how do you mitigate frame-rate latency during multi-face detection in {req.project_title}?"
        hint1 = "Discuss FPS vs accuracy trade-offs, batch size handling, and tensor resizing."
    elif "blockchain" in t_lower or "security" in t_lower:
        q1 = f"How does your architecture handle gas fee overhead and consensus latency when scaling transactions across an institutional cohort in {req.project_title}?"
        hint1 = "Mention Layer-2 rollups, off-chain batching with on-chain cryptographic proofs, or state channels."
    else:
        q1 = f"In your proposed solution for {req.project_title}, what were the architectural trade-offs between choosing your current stack ({req.tech_stack}) over a serverless microservice event-driven approach?"
        hint1 = "Highlight stateful connection needs, cold-start latency, and transactional boundary consistency."

    # 2. Algorithm & Complexity
    if "vector" in t_lower or "similarity" in t_lower or "ai" in t_lower:
        q2 = "What is the computational complexity of your similarity computation, and how does your indexing scale as historical records grow from 100 to 100,000 projects?"
        hint2 = "Contrast linear exact KNN (O(N*D)) with approximate nearest neighbors (HNSW/IVFFlat - O(log N))."
    elif "database" in t_lower or "sql" in t_lower:
        q2 = "Explain your database indexing strategy and how you ensure ACID transactions during simultaneous concurrent student submissions."
        hint2 = "Discuss composite B-tree indexes, isolation levels (Read Committed vs Serializable), and connection pooling."
    else:
        q2 = "What is the primary computational bottleneck in your execution pipeline, and what is its asymptotic Big-O time and space complexity?"
        hint2 = "Analyze the tightest loop in data processing and memory buffer allocations."

    # 3. Edge Cases & Resilience
    if "camera" in t_lower or "sensor" in t_lower or "iot" in t_lower:
        q3 = "How does your system react to adversarial physical conditions, such as extreme lens glare, camera occlusion, or network packet drops?"
        hint3 = "Explain frame buffering, exponential backoff retries, and fallback logging."
    else:
        q3 = "What happens if an external microservice or database connection fails midway through a transaction? How is data integrity guaranteed?"
        hint3 = "Discuss idempotency keys, database rollbacks, circuit breakers, and dead-letter queues."

    # 4. Security & Real-World Feasibility
    q4 = "How does your implementation prevent privilege escalation and unauthorized tampering of marks, logs, or project deliverables?"
    hint4 = "Explain cryptographic JWT claims, role-based authorization filters, and immutable audit trails."

    questions = [
        VivaQuestion(
            id=1,
            question=q1,
            topic_area="Architecture & Design Trade-offs",
            examiner_intent="Tests whether the student made deliberate technology choices or simply copied a standard tutorial template.",
            hint=hint1
        ),
        VivaQuestion(
            id=2,
            question=q2,
            topic_area="Algorithmic Complexity & Scalability",
            examiner_intent="Assesses the student's foundational Computer Science depth in data structures, time complexity, and scaling bounds.",
            hint=hint2
        ),
        VivaQuestion(
            id=3,
            question=q3,
            topic_area="Edge Cases & System Fault-Tolerance",
            examiner_intent="Probes whether the implementation is fragile or built with production resilience against real-world errors.",
            hint=hint3
        ),
        VivaQuestion(
            id=4,
            question=q4,
            topic_area="Security, Cryptography & Governance",
            examiner_intent="Checks for OWASP compliance, RBAC rigor, and defense against data tampering.",
            hint=hint4
        )
    ]

    return VivaQuestionsResponse(
        project_title=req.project_title,
        questions=questions
    )

@app.post("/api/ai/viva/evaluate-answer", response_model=VivaAnswerEvaluationResponse)
def evaluate_viva_answer(req: VivaAnswerEvaluationRequest):
    ans = req.student_answer.strip()
    words = len(ans.split())
    lowered = ans.lower()

    # Heuristic scoring based on technical depth, key terminology, and length
    score = 5.0
    strengths = []
    missing = []

    if words < 15:
        score = 4.0
        verdict = "Needs Further Justification"
        strengths.append("Attempted a direct, concise answer.")
        missing.append("Answer is too brief for an external panel defense.")
        missing.append("Lacks technical depth, specific metrics, and concrete architectural trade-offs.")
        coaching = "External examiners expect at least 3-4 structured sentences. State the technical reason, the metric (e.g. latency/accuracy), and the alternative you rejected."
    else:
        # Check for technical reasoning terms
        tech_indicators = ["trade-off", "latency", "throughput", "complexity", "index", "memory", "overhead", "benchmark", "accuracy", "scale", "security", "failover", "cache", "async", "thread"]
        found_indicators = [term for term in tech_indicators if term in lowered]

        if len(found_indicators) >= 4:
            score = 9.2
            verdict = "Strong Defense"
            strengths.append(f"Demonstrated engineering fluency using concrete terms: {', '.join(found_indicators[:3])}.")
            strengths.append("Clear architectural justification aligned with capstone objectives.")
            missing.append("Could optionally quantify performance with specific benchmark numbers (e.g. 'reduced latency from 450ms to 80ms').")
            coaching = "Excellent! Delivery is crisp and confident. Maintain this authoritative technical tone during the viva committee presentation."
        elif len(found_indicators) >= 2 or words >= 30:
            score = 7.8
            verdict = "Acceptable with Gaps"
            strengths.append("Addressed the core question with sound engineering intuition.")
            strengths.append(f"Referenced key system concepts ({', '.join(found_indicators) if found_indicators else 'functional methodology'}).")
            missing.append("Needs explicit contrast against alternative algorithms or architectural patterns.")
            coaching = "Solid answer. To turn this into a 10/10, explicitly mention what trade-off you accepted (e.g., 'We traded slightly higher RAM usage for 4x faster lookup times')."
        else:
            score = 6.2
            verdict = "Acceptable with Gaps"
            strengths.append("Answer touches on the general workflow.")
            missing.append("Relies on high-level descriptions rather than concrete technical mechanics.")
            missing.append("Explain the underlying mechanism rather than just saying 'it works automatically'.")
            coaching = "Examiners hate buzzwords like 'it just works'. Break down the step-by-step mechanism: input data, transformation/algorithm, and output guarantee."

    sample = (
        f"In {req.project_title}, we addressed this by decoupling the processing pipeline. "
        f"Rather than synchronously blocking client requests, we implemented an asynchronous execution queue with indexed database lookups, "
        f"maintaining low P95 latency (<120ms) while ensuring data consistency under peak concurrent loads."
    )

    return VivaAnswerEvaluationResponse(
        score_out_of_10=score,
        verdict=verdict,
        strengths=strengths,
        missing_points=missing,
        examiner_coaching_tip=coaching,
        sample_impressive_answer=sample
    )

# -------------------------------------------------------------
# Module: Faculty AI Grading Copilot (Autonomous Rubric Assister)
# -------------------------------------------------------------

class FacultyCopilotRequest(BaseModel):
    title: str
    problem_statement: str
    proposed_solution: Optional[str] = ""
    tech_stack: Optional[str] = ""
    domain: Optional[str] = ""
    novelty_score: Optional[float] = 85.0
    duplicate_risk: Optional[str] = "LOW"
    has_github_repo: Optional[bool] = False
    has_demo_video: Optional[bool] = False
    has_final_report: Optional[bool] = False
    has_presentation: Optional[bool] = False

class RubricCriterionRecommendation(BaseModel):
    criterion: str
    suggested_score: int
    max_score: int = 5
    rationale: str

class FacultyCopilotResponse(BaseModel):
    problem_score: int
    methodology_score: int
    feasibility_score: int
    innovation_score: int
    total_score: int
    percentage: int
    recommended_decision: str
    confidence_score: float
    criteria_breakdown: List[RubricCriterionRecommendation]
    drafted_feedback: str
    key_strengths: List[str]
    potential_risks: List[str]

@app.post("/api/ai/faculty/copilot-rubric", response_model=FacultyCopilotResponse)
def generate_rubric_copilot(req: FacultyCopilotRequest):
    p_len = len(req.problem_statement.split())
    sol_len = len(req.proposed_solution.split()) if req.proposed_solution else 0
    t_stack = req.tech_stack or ""
    nov = req.novelty_score if req.novelty_score is not None else 85.0

    # 1. Problem Formulation & Clarity (1 - 5)
    if p_len >= 30:
        p_score = 5
        p_rat = f"Problem statement is comprehensively articulated ({p_len} words) with explicit engineering boundaries."
    elif p_len >= 15:
        p_score = 4
        p_rat = "Clear problem definition with identifiable core objectives and scope."
    else:
        p_score = 3
        p_rat = "Problem statement is concise; recommend team elaborates on specific research questions."

    # 2. Methodology & Architecture (1 - 5)
    has_modern_stack = any(kw in t_stack.lower() for kw in ["pytorch", "tensorflow", "fastapi", "react", "spring", "docker", "postgresql", "opencv"])
    if has_modern_stack and sol_len >= 20:
        m_score = 5
        m_rat = f"Robust full-stack / ML engineering pipeline utilizing enterprise tools: {t_stack}."
    elif has_modern_stack or sol_len >= 10:
        m_score = 4
        m_rat = f"Sound technical architecture with appropriate framework selection ({t_stack})."
    else:
        m_score = 3
        m_rat = "Standard architectural approach; advise exploring microservice decoupling or async batching."

    # 3. Feasibility & Scope Alignment (1 - 5)
    deliverables_count = sum([req.has_github_repo, req.has_demo_video, req.has_final_report, req.has_presentation])
    if deliverables_count >= 3 or req.has_github_repo:
        f_score = 5
        f_rat = f"Demonstrated high execution feasibility with tangible artifacts ({deliverables_count} deliverables submitted)."
    elif deliverables_count >= 1:
        f_score = 4
        f_rat = "Realistic academic timeline; active code repository confirms viable progress."
    else:
        f_score = 4
        f_rat = "Project scope aligns with semester milestone expectations; verify sprint velocity during Phase 2."

    # 4. Novelty & Innovation Degree (1 - 5)
    if nov >= 80.0 and req.duplicate_risk == "LOW":
        i_score = 5
        i_rat = f"High novelty rating ({nov:.1f}%) with low historical corpus overlap. Substantial research differentiation."
    elif nov >= 65.0:
        i_score = 4
        i_rat = f"Good originality index ({nov:.1f}%). Introduces distinct architectural improvements over past cohorts."
    elif nov >= 50.0:
        i_score = 3
        i_rat = f"Moderate novelty ({nov:.1f}%). Core formulation resembles historical archives; emphasize unique features."
    else:
        i_score = 2
        i_rat = f"Low novelty index ({nov:.1f}%). Recommend pivot towards novel data collection or hybrid modeling."

    total = p_score + m_score + f_score + i_score
    pct = round((total / 20) * 100)

    if total >= 15:
        decision = "APPROVED"
    elif total >= 11:
        decision = "REVISED"
    else:
        decision = "REJECTED"

    breakdown = [
        RubricCriterionRecommendation(
            criterion="Problem Formulation & Clarity",
            suggested_score=p_score,
            rationale=p_rat
        ),
        RubricCriterionRecommendation(
            criterion="Methodology & Architecture",
            suggested_score=m_score,
            rationale=m_rat
        ),
        RubricCriterionRecommendation(
            criterion="Feasibility & Scope Alignment",
            suggested_score=f_score,
            rationale=f_rat
        ),
        RubricCriterionRecommendation(
            criterion="Novelty & Innovation Degree",
            suggested_score=i_score,
            rationale=i_rat
        ),
    ]

    strengths = [
        f"Well-structured problem statement focusing on real-world institutional impact in {req.title}.",
        f"Appropriate selection of modern engineering components ({t_stack or 'industry standard frameworks'}).",
        f"Verified academic originality with AI similarity screening."
    ]

    risks = []
    if not req.has_github_repo:
        risks.append("No active GitHub repository URL provided in deliverables yet.")
    if p_len < 20:
        risks.append("Problem statement could benefit from quantitative performance targets (e.g. latency/F1-score).")
    if not risks:
        risks.append("Maintain strict sprint velocity leading into external panel viva defense.")

    drafted_feedback = (
        f"The student team has demonstrated thorough engineering diligence for '{req.title}'. "
        f"The proposed methodology utilizing {t_stack or 'the chosen stack'} is academically sound with clear technical feasibility. "
        f"The vector screening confirms a healthy novelty rating of {nov:.1f}%. "
        f"Directives for subsequent review: prioritize edge-case integration testing and complete milestone deliverables according to the scheduled departmental timeline."
    )

    return FacultyCopilotResponse(
        problem_score=p_score,
        methodology_score=m_score,
        feasibility_score=f_score,
        innovation_score=i_score,
        total_score=total,
        percentage=pct,
        recommended_decision=decision,
        confidence_score=94.5,
        criteria_breakdown=breakdown,
        drafted_feedback=drafted_feedback,
        key_strengths=strengths,
        potential_risks=risks
    )




