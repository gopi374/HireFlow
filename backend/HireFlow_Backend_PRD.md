# **HireFlow — Backend Development PRD** 

_Product Requirements Document | Version 1.0 | Backend_ 

## **1. Executive Summary** 

HireFlow is a production-oriented Job Recruitment and Applicant Tracking System (ATS). The backend provides secure APIs and business workflows for candidates, recruiters, companies, and administrators. It manages job creation, discovery, applications, recruitment stages, interviews, evaluations, notifications, company verification, reporting, and audit activity. 

This PRD defines backend requirements and is intended as the implementation contract while building the project from scratch. 

## **2. Product Goals** 

- Provide secure REST APIs for the complete recruitment lifecycle. 

- Support Candidate, Recruiter, and Admin roles with role-based authorization. 

- Maintain consistent application and interview state transitions. 

- Provide searchable, filterable, paginated job data. 

- Support resume/file metadata with cloud storage. 

- Provide persistent and real-time notifications. 

- Provide auditable administrative and recruiter actions. 

- Create a testable, maintainable, deployable backend. 

## **3. Non-Goals for MVP** 

- AI candidate ranking/resume scoring 

- Built-in video conferencing 

- Payroll or post-hiring HRMS 

- Microservices architecture 

- Native mobile application 

## **4. Users & Roles** 

**Candidate —** Searches jobs, maintains profile, uploads resume, applies, tracks applications and interviews. 

**Recruiter —** Creates jobs, reviews applications, manages hiring stages, schedules interviews, and evaluates candidates. 

**Admin —** Moderates users, companies, jobs, reports, and platform activity. 

## **5. Technology Requirements** 

- Node.js + Express.js + TypeScript 

- MongoDB + Mongoose 

- JWT access/refresh authentication 

- bcrypt-compatible password hashing 

- Zod/Joi validation 

- Socket.IO 

- Cloudinary or S3-compatible object storage 

HireFlow Backend PRD • Version 1.0 

- Nodemailer/transactional email provider 

- Jest + Supertest 

- OpenAPI/Swagger 

- Helmet + CORS + rate limiting 

- Structured logging 

- Docker-ready deployment 

## **6. High-Level Architecture** 

```
Client
```

```
  ↓
```

```
Express HTTP Server
```

```
  ├─ Authentication → Authorization/RBAC → Validation
  ├─ Controllers → Services → Mongoose Models
  ├─ Socket.IO
```

```
  └─ Central Error Handler
```

```
          ↓
```

```
   MongoDB / Object Storage / Email Provider
```

## **7. Core Modules** 

**Authentication —** Registration, login, logout, refresh tokens, verification, password reset. 

**User/Profile —** Candidate and recruiter profile, skills, education, experience, links. 

**Company —** Company creation, ownership, profile, verification. 

**Job —** Create, edit, publish, close, archive, search, filter, paginate. 

**Application —** Apply, duplicate prevention, status transitions, notes. 

**Recruitment Pipeline —** Applied → Screening → Shortlisted → Interview → Selected/Rejected. 

**Interview —** Schedule, reschedule, cancel, complete, evaluate. 

**Resume/File —** Upload metadata, primary resume, ownership, secure access. 

**Notification —** Persistent notifications and Socket.IO delivery. 

**Admin/Moderation —** User/company/job moderation and reporting. 

**Audit —** Important state-changing actions with actor and timestamp. 

## **8. Authentication Requirements** 

- Unique email registration. 

- Never store plaintext passwords. 

- Use short-lived access tokens and refresh-token sessions. 

- Protect private endpoints with authentication middleware. 

- Refresh sessions must be revocable. 

- Logout invalidates the relevant refresh session. 

- Support email verification. 

- Forgot-password tokens are short-lived and single-use. 

- Rate-limit login, registration, reset, and verification endpoints. 

HireFlow Backend PRD • Version 1.0 

## **9. Authorization / RBAC** 

- CANDIDATE 

- RECRUITER 

- ADMIN 

Role checks are not enough: every private resource must also enforce ownership. A recruiter may manage only authorized companies/jobs/applications; a candidate may access only their own private resources. 

## **10. Functional Requirements** 

### **10.1 Candidate** 

- Manage profile, skills, education, experience, projects and certifications 

- Upload/manage resume and set primary resume 

- Search/filter jobs 

- Save/unsave jobs 

- Apply to jobs 

- View/withdraw eligible applications 

- View interviews and candidate-visible evaluations 

### **10.2 Recruiter & Company** 

- Create/update company 

- Submit company for verification 

- Create/edit/publish/close jobs 

- View authorized applications 

- Change application status 

- Add recruiter notes 

- Schedule/manage interviews 

- Submit interview evaluations 

### **10.3 Admin** 

- Search users 

- Suspend/reactivate accounts 

- Approve/reject company verification 

- Moderate jobs 

- Review reports 

- View platform metrics 

- Inspect audit logs 

## **11. Job Lifecycle** 

```
DRAFT → PUBLISHED → ACTIVE → CLOSED → ARCHIVED
Rules:
```

- `Only authorized recruiters can publish.` 

- `Closed/expired jobs reject new applications.` 

- `Archived jobs are effectively read-only.` 

- `Publishing requires required fields and a valid application window.` 

HireFlow Backend PRD • Version 1.0 

## **12. Application Lifecycle** 

```
APPLIED → SCREENING → SHORTLISTED → INTERVIEW → SELECTED
```

```
                         └──────────────→ REJECTED
```

```
All transitions are validated server-side.
```

## **13. Application Business Rules** 

- Candidate cannot apply twice to the same job in MVP. 

- Only authenticated candidates can apply. 

- Closed/expired jobs reject applications. 

- Submitted resume must belong to or be authorized for the candidate. 

- Only authorized recruiters can modify applications. 

- Every status change records actor, previous status, new status, and timestamp. 

- Important status changes generate notifications. 

## **14. Interview Requirements** 

- Interview belongs to an application. 

- Only authorized recruiters/interviewers can modify interviews. 

- Interview stores date/time, duration, type, mode, participants, and optional meeting URL. 

- Support schedule, reschedule, cancel, complete, and evaluate. 

- Private recruiter notes are not exposed to candidates unless explicitly shareable. 

## **15. Search, Filtering & Pagination** 

- Keyword 

- Location 

- Employment type 

- Experience range 

- Salary range 

- Skills 

- Remote/on-site/hybrid 

- Posted date 

- Sorting 

- Pagination 

## **16. Suggested API Contract** 

#### **Auth** 

- POST /api/v1/auth/register 

- POST /api/v1/auth/login 

- POST /api/v1/auth/refresh 

- POST /api/v1/auth/logout 

- GET /api/v1/auth/me 

- POST /api/v1/auth/verify-email 

- POST /api/v1/auth/forgot-password 

- POST /api/v1/auth/reset-password 

**Profile** 

HireFlow Backend PRD • Version 1.0 

- GET /api/v1/users/me 

- PATCH /api/v1/users/me 

- GET /api/v1/users/me/applications 

- GET /api/v1/users/me/interviews 

#### **Jobs** 

- GET /api/v1/jobs 

- GET /api/v1/jobs/:jobId 

- POST /api/v1/jobs 

- PATCH /api/v1/jobs/:jobId 

- DELETE /api/v1/jobs/:jobId 

- POST /api/v1/jobs/:jobId/publish 

- POST /api/v1/jobs/:jobId/close 

#### **Applications** 

- POST /api/v1/jobs/:jobId/apply 

- GET /api/v1/applications/me 

- GET /api/v1/applications/:applicationId 

- GET /api/v1/jobs/:jobId/applications 

- PATCH /api/v1/applications/:applicationId/status 

- POST /api/v1/applications/:applicationId/withdraw 

#### **Companies** 

- POST /api/v1/companies 

- GET /api/v1/companies/:companyId 

- PATCH /api/v1/companies/:companyId 

- POST /api/v1/companies/:companyId/verification 

#### **Interviews** 

- POST /api/v1/interviews 

- GET /api/v1/interviews 

- GET /api/v1/interviews/:interviewId 

- PATCH /api/v1/interviews/:interviewId 

- POST /api/v1/interviews/:interviewId/cancel 

- POST /api/v1/interviews/:interviewId/evaluation 

#### **Notifications** 

- GET /api/v1/notifications 

- PATCH /api/v1/notifications/:notificationId/read 

- PATCH /api/v1/notifications/read-all 

## **17. Data Model Requirements** 

**User —** name, email, passwordHash, role, phone, profile, isVerified, status, timestamps 

**CandidateProfile —** user, headline, summary, location, skills, education, experience, projects, certifications, links 

**Company —** name, description, website, logo, location, industry, recruiterIds, verificationStatus, timestamps 

HireFlow Backend PRD • Version 1.0 

**Job —** company, recruiter, title, description, responsibilities, requirements, skills, location, workMode, employmentType, experience, salary, status, deadline, timestamps 

**Application —** candidate, job, resume, coverLetter, answers, status, recruiterNotes, timestamps 

**Interview —** application, interviewerIds, scheduledAt, duration, type, mode, meetingUrl, status, evaluation, timestamps 

**Resume —** candidate, fileName, storageKey/url, mimeType, size, isPrimary, timestamps 

**Notification —** recipient, type, title, message, entityType, entityId, isRead, timestamps 

**AuditLog —** actor, action, entityType, entityId, metadata, timestamp 

## **18. Database Indexing** 

- Unique index on User.email. 

- Indexes on Job.status and Job.createdAt. 

- Indexes for common Job search/filter fields based on measured query patterns. 

- Compound uniqueness strategy for Application.job + Application.candidate. 

- Indexes on Application.candidate/job/status/timestamps. 

- Indexes on Interview.application/scheduledAt. 

- Indexes on Notification.recipient + isRead + createdAt. 

## **19. Validation** 

- Validate body, query, route parameters, and file metadata. 

- Reject invalid enum values. 

- Validate email/password policy. 

- Validate salary/experience ranges. 

- Validate deadlines and interview timestamps. 

- Safely handle user-provided text. 

- Return consistent validation errors. 

## **20. Error Response** 

```
{
```

```
  "success": false,
  "error": {
```

```
    "code": "JOB_NOT_FOUND",
```

```
    "message": "Job was not found.",
    "details": []
  },
```

```
  "requestId": "..."
}
```

Use appropriate HTTP status codes. Never expose stack traces, secrets, database internals, or credentials in production responses. 

## **21. Security** 

- HTTPS in production 

- Secure password hashing 

- HTTP-only/secure refresh cookies when applicable 

HireFlow Backend PRD • Version 1.0 

- Explicit CORS allowlist 

- Helmet/security headers 

- Rate limiting 

- File type and size validation 

- Server-side authorization and ownership checks 

- IDOR/BOLA prevention 

- No secrets or tokens in logs 

- Environment variables for credentials 

## **22. Notifications** 

- New application → recruiter 

- Application status change → candidate 

- Interview scheduled/rescheduled/cancelled → affected users 

- Company verification result → recruiter 

- Admin moderation → affected user where appropriate 

- Persist notifications for offline users and use Socket.IO for real-time delivery 

## **23. File Uploads** 

- Resume formats: PDF/DOC/DOCX for MVP. 

- Enforce size and MIME/type restrictions. 

- Store files outside MongoDB. 

- Persist file metadata and ownership. 

- Prevent unauthorized access by guessed URLs/IDs. 

- Support replacement/deletion according to ownership policy. 

## **24. Audit Logging** 

Audit important actions including: 

- Job publish/close 

- Application status change 

- Interview schedule/change/cancel 

- Company approve/reject 

- User suspend/reactivate 

- Admin moderation 

Audit logs are append-oriented and access-controlled. Do not store secrets in them. 

## **25. Testing Requirements** 

- Unit tests for business rules 

- API/integration tests for authentication 

- Authorization tests for every role 

- Ownership/IDOR tests 

- Duplicate application tests 

- Invalid state transition tests 

- Closed/expired job tests 

- Interview tests 

HireFlow Backend PRD • Version 1.0 

- Validation/error tests 

- Critical workflow test: register → login → create job → apply → shortlist → interview 

## **26. Observability** 

- Generate request IDs. 

- Log route/status/latency without sensitive payloads. 

- Log unexpected errors with useful context. 

- Monitor API latency, error rate, DB failures, and external-service failures. 

- Provide /health and /ready endpoints. 

## **27. API Documentation** 

- Document method/path/auth/request/response/status/error cases. 

- Provide OpenAPI/Swagger. 

- Include examples. 

- Document role/permission requirements. 

- Document pagination/filter parameters. 

## **28. Environment Variables** 

```
NODE_ENV=
PORT=
MONGODB_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
ACCESS_TOKEN_EXPIRES_IN=
REFRESH_TOKEN_EXPIRES_IN=
CLIENT_URL=
CORS_ORIGINS=
STORAGE_PROVIDER=
STORAGE_API_KEY=
STORAGE_API_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

Commit only .env.example; never commit real credentials. 

## **29. Suggested Folder Structure** 

```
backend/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── repositories/
│   ├── validators/
│   ├── utils/
│   ├── sockets/
│   ├── jobs/
```

HireFlow Backend PRD • Version 1.0 

```
│   ├── types/
│   ├── app.ts
│   └── server.ts
├── tests/
├── docs/
```

```
├── .env.example
├── Dockerfile
├── package.json
└── README.md
```

## **30. MVP Acceptance Criteria** 

- Candidate can register, verify, login, complete profile, upload resume, search jobs, and apply. 

- Duplicate applications are rejected. 

- Recruiter can create company and create/publish/close jobs. 

- Recruiter can view applications only for authorized jobs. 

- Recruiter can move candidates through valid stages. 

- Recruiter can schedule interviews. 

- Candidate can view interview information. 

- Admin can verify companies and moderate users/jobs. 

- Protected endpoints enforce authentication and ownership. 

- Core APIs have automated tests. 

- API documentation exists. 

- Application runs using documented environment variables and can be containerized. 

## **31. Definition of Done** 

- Feature implemented in controller/service/model layers. 

- Validation exists. 

- Authentication/authorization enforced. 

- Success/error responses consistent. 

- Relevant indexes considered. 

- Business rules tested. 

- API documentation updated. 

- No secrets committed. 

- Logs contain no sensitive data. 

- Manual API/frontend testing completed. 

- README/setup instructions accurate. 

## **32. Development Milestones** 

**M1 —** Project setup, Express, TypeScript, MongoDB, configuration, errors 

- **M2 —** Authentication, refresh tokens, RBAC, profiles 

- **M3 —** Company and recruiter module 

- **M4 —** Job CRUD, lifecycle, search, filtering, pagination 

- **M5 —** Candidate application workflow 

- **M6 —** Recruitment pipeline and recruiter notes 

HireFlow Backend PRD • Version 1.0 

**M7 —** Interview scheduling and evaluations 

**M8 —** Notifications, Socket.IO, email 

- **M9 —** Admin moderation and audit logs 

**M10 —** Testing, security, API documentation 

**M11 —** Docker, production configuration, deployment 

## **33. Interview-Readiness Requirements** 

The implementation should be understandable by its author. Be prepared to explain: 

- MongoDB schema choices 

- JWT access/refresh design 

- RBAC vs ownership authorization 

- Duplicate application prevention 

- State-transition validation 

- Pagination/filtering 

- Socket.IO authentication/scoping 

- Secure file uploads 

- Centralized errors 

- MongoDB indexing/query performance 

- Scaling beyond one server 

- Architecture trade-offs 

## **34. Future Enhancements** 

- Advanced candidate search 

- Email templates 

- Calendar integration 

- Interview question library 

- Assessments 

- Candidate consent/data-retention controls 

- Advanced analytics 

- Redis/cache 

- Background queues 

- Optional AI-assisted features 

## **35. Recommended Build Principle** 

Build a modular monolith first. Do not add microservices, Redis, queues, or AI until the core recruitment workflow is correct. Implement every feature from requirements → database design → API contract → business rules → validation → tests → documentation. 

HireFlow Backend PRD • Version 1.0 

