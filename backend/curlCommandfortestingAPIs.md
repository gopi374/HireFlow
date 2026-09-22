# HireFlow ATS — Complete curl.exe API Testing Guide

Base URL: `http://localhost:5000/api/v1`

---

## 1. System Health & Info

### Check API Health
```bash
curl.exe -X GET http://localhost:5000/health
```

### Check Server Status
```bash
curl.exe -X GET http://localhost:5000/
```

---

## 2. Authentication

### Register Candidate
```bash
curl.exe -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Candidate",
    "email": "candidate@example.com",
    "password": "Password123!",
    "role": "CANDIDATE",
    "phone": "+1234567890"
  }'
```

### Register Recruiter
```bash
curl.exe -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Recruiter",
    "email": "recruiter@example.com",
    "password": "Password123!",
    "role": "RECRUITER",
    "phone": "+1987654321"
  }'
```

### Register Admin
```bash
curl.exe -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Platform Admin",
    "email": "admin@example.com",
    "password": "AdminPassword123!",
    "role": "ADMIN"
  }'
```

### Login
```bash
curl.exe -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "candidate@example.com",
    "password": "Password123!"
  }'
```

### Refresh Access Token
```bash
curl.exe -X POST http://localhost:5000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<YOUR_REFRESH_TOKEN>"
  }'
```

### Get Authenticated User Profile (Me)
```bash
curl.exe -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

### Change Password
```bash
curl.exe -X PUT http://localhost:5000/api/v1/auth/change-password \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "Password123!",
    "newPassword": "NewPassword123!"
  }'
```

### Logout
```bash
curl.exe -X POST http://localhost:5000/api/v1/auth/logout \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<YOUR_REFRESH_TOKEN>"
  }'
```

---

## 3. User & Candidate Profile

### Update Basic User Info
```bash
curl.exe -X PATCH http://localhost:5000/api/v1/users/me \
  -H "Authorization: Bearer <CANDIDATE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "+1122334455"
  }'
```

### Update Candidate Detailed Profile
```bash
curl.exe -X PATCH http://localhost:5000/api/v1/users/me/candidate-profile \
  -H "Authorization: Bearer <CANDIDATE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "headline": "Senior Fullstack Developer",
    "summary": "5+ years experienced Node.js & React developer.",
    "location": "San Francisco, CA",
    "skills": ["javascript", "typescript", "nodejs", "react", "mongodb"],
    "experience": [
      {
        "title": "Backend Engineer",
        "company": "Tech Corp",
        "location": "Remote",
        "startDate": "2022-01-01",
        "current": true,
        "description": "Building scalable microservices and ATS workflows."
      }
    ],
    "education": [
      {
        "institution": "State University",
        "degree": "B.S.",
        "fieldOfStudy": "Computer Science",
        "startYear": 2017,
        "endYear": 2021
      }
    ],
    "links": {
      "github": "https://github.com/johndoe",
      "linkedin": "https://linkedin.com/in/johndoe",
      "portfolio": "https://johndoe.dev"
    }
  }'
```

### Upload Resume (Multipart Form Data)
```bash
curl.exe -X POST http://localhost:5000/api/v1/users/me/resume \
  -H "Authorization: Bearer <CANDIDATE_TOKEN>" \
  -F "resume=@/path/to/your/resume.pdf"
```

### Toggle Save / Bookmark Job
```bash
curl.exe -X POST http://localhost:5000/api/v1/users/jobs/<JOB_ID>/save \
  -H "Authorization: Bearer <CANDIDATE_TOKEN>"
```

### Get My Applications (Candidate)
```bash
curl.exe -X GET "http://localhost:5000/api/v1/users/me/applications?page=1&limit=10" \
  -H "Authorization: Bearer <CANDIDATE_TOKEN>"
```

### Get My Scheduled Interviews (Candidate)
```bash
curl.exe -X GET "http://localhost:5000/api/v1/users/me/interviews?page=1&limit=10" \
  -H "Authorization: Bearer <CANDIDATE_TOKEN>"
```

---

## 4. Companies

### Create Company (Recruiter / Admin)
```bash
curl.exe -X POST http://localhost:5000/api/v1/companies \
  -H "Authorization: Bearer <RECRUITER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Innovations",
    "description": "Leading cloud software provider",
    "website": "https://acme.com",
    "location": "New York, NY",
    "industry": "Software & Technology",
    "size": "50-200"
  }'
```

### List Companies (Public)
```bash
curl.exe -X GET "http://localhost:5000/api/v1/companies?page=1&limit=10&search=Acme"
```

### Get Company Details (Public)
```bash
curl.exe -X GET http://localhost:5000/api/v1/companies/<COMPANY_ID>
```

### Update Company (Recruiter / Admin)
```bash
curl.exe -X PATCH http://localhost:5000/api/v1/companies/<COMPANY_ID> \
  -H "Authorization: Bearer <RECRUITER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated global cloud software solutions provider",
    "size": "200-500"
  }'
```

### Request Company Verification (Recruiter)
```bash
curl.exe -X POST http://localhost:5000/api/v1/companies/<COMPANY_ID>/verification \
  -H "Authorization: Bearer <RECRUITER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "documents": ["https://storage.example.com/biz-reg-doc.pdf"],
    "notes": "Official incorporation certificate attached."
  }'
```

---

## 5. Jobs

### Create Job Draft (Recruiter)
```bash
curl.exe -X POST http://localhost:5000/api/v1/jobs \
  -H "Authorization: Bearer <RECRUITER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Backend Developer",
    "companyId": "<COMPANY_ID>",
    "description": "We are seeking a seasoned Node.js developer.",
    "responsibilities": ["Design REST APIs", "Maintain DB performance"],
    "requirements": ["3+ years Node.js experience", "MongoDB expertise"],
    "skills": ["nodejs", "mongodb", "typescript", "express"],
    "location": "Remote",
    "workMode": "REMOTE",
    "employmentType": "FULL_TIME",
    "experience": { "min": 3, "max": 6 },
    "salary": { "min": 90000, "max": 130000, "currency": "USD" },
    "deadline": "2026-12-31T23:59:59Z",
    "status": "DRAFT"
  }'
```

### Publish Job (Recruiter)
```bash
curl.exe -X POST http://localhost:5000/api/v1/jobs/<JOB_ID>/publish \
  -H "Authorization: Bearer <RECRUITER_TOKEN>"
```

### Search & Filter Jobs (Public)
```bash
curl.exe -X GET "http://localhost:5000/api/v1/jobs?search=Backend&location=Remote&workMode=REMOTE&employmentType=FULL_TIME&skills=nodejs,mongodb&page=1&limit=10"
```

### Get Job by ID (Public)
```bash
curl.exe -X GET http://localhost:5000/api/v1/jobs/<JOB_ID>
```

### Update Job (Recruiter)
```bash
curl.exe -X PATCH http://localhost:5000/api/v1/jobs/<JOB_ID> \
  -H "Authorization: Bearer <RECRUITER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "salary": { "min": 95000, "max": 140000, "currency": "USD" }
  }'
```

### Close Job (Recruiter)
```bash
curl.exe -X POST http://localhost:5000/api/v1/jobs/<JOB_ID>/close \
  -H "Authorization: Bearer <RECRUITER_TOKEN>"
```

### Delete Job (Recruiter / Admin)
```bash
curl.exe -X DELETE http://localhost:5000/api/v1/jobs/<JOB_ID> \
  -H "Authorization: Bearer <RECRUITER_TOKEN>"
```

---

## 6. Applications

### Candidate Apply to Job
```bash
curl.exe -X POST http://localhost:5000/api/v1/jobs/<JOB_ID>/apply \
  -H "Authorization: Bearer <CANDIDATE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "resumeUrl": "/uploads/resume-sample.pdf",
    "coverLetter": "I am excited to apply for this backend developer position.",
    "answers": [
      { "question": "Years of Node.js experience?", "answer": "4 years" }
    ]
  }'
```

### Recruiter View Applications for Job
```bash
curl.exe -X GET "http://localhost:5000/api/v1/jobs/<JOB_ID>/applications?status=APPLIED&page=1&limit=10" \
  -H "Authorization: Bearer <RECRUITER_TOKEN>"
```

### Get Application Details
```bash
curl.exe -X GET http://localhost:5000/api/v1/applications/<APPLICATION_ID> \
  -H "Authorization: Bearer <RECRUITER_OR_CANDIDATE_TOKEN>"
```

### Update Application Status (Recruiter Pipeline Progression)
*Allowed Transitions:* `APPLIED` → `SCREENING` → `SHORTLISTED` → `INTERVIEW` → `SELECTED` / `REJECTED`
```bash
curl.exe -X PATCH http://localhost:5000/api/v1/applications/<APPLICATION_ID>/status \
  -H "Authorization: Bearer <RECRUITER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SHORTLISTED",
    "reason": "Strong portfolio and relevant experience"
  }'
```

### Add Recruiter Internal Note
```bash
curl.exe -X POST http://localhost:5000/api/v1/applications/<APPLICATION_ID>/notes \
  -H "Authorization: Bearer <RECRUITER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "note": "Passed initial resume screening with flying colors. Recommend for technical round."
  }'
```

### Candidate Withdraw Application
```bash
curl.exe -X POST http://localhost:5000/api/v1/applications/<APPLICATION_ID>/withdraw \
  -H "Authorization: Bearer <CANDIDATE_TOKEN>"
```

---

## 7. Interviews

### Schedule Interview (Recruiter)
```bash
curl.exe -X POST http://localhost:5000/api/v1/interviews \
  -H "Authorization: Bearer <RECRUITER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "<APPLICATION_ID>",
    "scheduledAt": "2026-10-15T14:00:00Z",
    "durationMinutes": 60,
    "type": "TECHNICAL",
    "mode": "ONLINE",
    "meetingUrl": "https://meet.google.com/abc-defg-hij"
  }'
```

### List Interviews
```bash
curl.exe -X GET "http://localhost:5000/api/v1/interviews?status=SCHEDULED&page=1&limit=10" \
  -H "Authorization: Bearer <USER_TOKEN>"
```

### Get Interview Details
```bash
curl.exe -X GET http://localhost:5000/api/v1/interviews/<INTERVIEW_ID> \
  -H "Authorization: Bearer <USER_TOKEN>"
```

### Reschedule / Update Interview (Recruiter)
```bash
curl.exe -X PATCH http://localhost:5000/api/v1/interviews/<INTERVIEW_ID> \
  -H "Authorization: Bearer <RECRUITER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduledAt": "2026-10-16T15:30:00Z",
    "status": "RESCHEDULED"
  }'
```

### Cancel Interview (Recruiter)
```bash
curl.exe -X POST http://localhost:5000/api/v1/interviews/<INTERVIEW_ID>/cancel \
  -H "Authorization: Bearer <RECRUITER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Interviewer schedule conflict. Will reschedule shortly."
  }'
```

### Submit Interview Evaluation (Recruiter)
```bash
curl.exe -X POST http://localhost:5000/api/v1/interviews/<INTERVIEW_ID>/evaluation \
  -H "Authorization: Bearer <RECRUITER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "feedback": "Exceptional problem-solving skills and clean code practices.",
    "strengths": ["System Design", "Node.js concurrency", "Communication"],
    "weaknesses": ["None notable"],
    "decision": "STRONG_HIRE",
    "shareableWithCandidate": true,
    "candidateFeedback": "Great technical performance during coding session!"
  }'
```

---

## 8. Notifications

### Get My Notifications
```bash
curl.exe -X GET "http://localhost:5000/api/v1/notifications?page=1&limit=10" \
  -H "Authorization: Bearer <USER_TOKEN>"
```

### Mark Notification as Read
```bash
curl.exe -X PATCH http://localhost:5000/api/v1/notifications/<NOTIFICATION_ID>/read \
  -H "Authorization: Bearer <USER_TOKEN>"
```

### Mark All Notifications as Read
```bash
curl.exe -X PATCH http://localhost:5000/api/v1/notifications/read-all \
  -H "Authorization: Bearer <USER_TOKEN>"
```

---

## 9. Admin & Moderation

### Get Platform Statistics
```bash
curl.exe -X GET http://localhost:5000/api/v1/admin/stats \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Search & List Users
```bash
curl.exe -X GET "http://localhost:5000/api/v1/admin/users?role=CANDIDATE&status=ACTIVE&page=1&limit=10" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Suspend / Reactivate User
```bash
curl.exe -X PATCH http://localhost:5000/api/v1/admin/users/<USER_ID>/status \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SUSPENDED"
  }'
```

### Verify / Reject Company
```bash
curl.exe -X PATCH http://localhost:5000/api/v1/admin/companies/<COMPANY_ID>/verification \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "verificationStatus": "VERIFIED",
    "verificationNotes": "Company registration verified successfully."
  }'
```

### View Platform Audit Logs
```bash
curl.exe -X GET "http://localhost:5000/api/v1/admin/audit-logs?entityType=Job&page=1&limit=20" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```
