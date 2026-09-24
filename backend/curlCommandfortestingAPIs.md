# HireFlow ATS — Complete API Testing Guide

Base URL: `http://localhost:5000/api/v1`

> [!TIP]
> **For Windows PowerShell Users:**
> - In PowerShell, `\` is NOT the line-continuation character (PowerShell uses backtick `` ` ``).
> - Also, double quotes inside JSON must be escaped `\"` when using `curl.exe`.
> - **Recommended in PowerShell:** Use `Invoke-RestMethod` (`irm`) or the single-line `curl.exe` commands below!

---

## 1. System Health & Info

### Check API Health
**PowerShell:**
```powershell
irm http://localhost:5000/health
# or with curl.exe:
curl.exe -X GET http://localhost:5000/health
```

**Bash / macOS:**
```bash
curl -X GET http://localhost:5000/health
```

---

## 2. Authentication

### Register Candidate
**PowerShell (irm - Recommended):**
```powershell
irm http://localhost:5000/api/v1/auth/register -Method Post -ContentType "application/json" -Body '{"name":"John Candidate","email":"candidate@example.com","password":"Password123!","role":"CANDIDATE","phone":"+1234567890"}'
```
**PowerShell (curl.exe):**
```powershell
curl.exe -X POST http://localhost:5000/api/v1/auth/register -H "Content-Type: application/json" -d "{\"name\":\"John Candidate\",\"email\":\"candidate@example.com\",\"password\":\"Password123!\",\"role\":\"CANDIDATE\",\"phone\":\"+1234567890\"}"
```
**Bash:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Candidate",
    "email": "candidate@example.com",
    "password": "Password123!",
    "role": "CANDIDATE",
    "phone": "+1234567890"
  }'
```

---

### Register Recruiter
**PowerShell (irm):**
```powershell
irm http://localhost:5000/api/v1/auth/register -Method Post -ContentType "application/json" -Body '{"name":"Sarah Recruiter","email":"recruiter@example.com","password":"Password123!","role":"RECRUITER","phone":"+1987654321"}'
```
**Bash:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Recruiter",
    "email": "recruiter@example.com",
    "password": "Password123!",
    "role": "RECRUITER",
    "phone": "+1987654321"
  }'
```

---

### Register Admin
**PowerShell (irm):**
```powershell
irm http://localhost:5000/api/v1/auth/register -Method Post -ContentType "application/json" -Body '{"name":"Platform Admin","email":"admin@example.com","password":"AdminPassword123!","role":"ADMIN"}'
```
**Bash:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Platform Admin",
    "email": "admin@example.com",
    "password": "AdminPassword123!",
    "role": "ADMIN"
  }'
```

---

### Login

> [!NOTE]
> The response returns `token` (access token) and `tokens.refreshToken` directly on the response object.

**PowerShell (irm) — Save tokens for later requests:**
```powershell
$res = irm http://localhost:5000/api/v1/auth/login -Method Post -ContentType "application/json" -Body '{"email":"candidate@example.com","password":"Password123!"}'
$token = $res.token
$refreshToken = $res.tokens.refreshToken
$res
```
**PowerShell (curl.exe):**
```powershell
curl.exe -X POST http://localhost:5000/api/v1/auth/login -H "Content-Type: application/json" -d "{\"email\":\"candidate@example.com\",\"password\":\"Password123!\"}"
```
**Bash:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "candidate@example.com",
    "password": "Password123!"
  }'
```

---

### Refresh Access Token
**PowerShell (irm):**
```powershell
$newTokens = irm http://localhost:5000/api/v1/auth/refresh -Method Post -ContentType "application/json" -Body "{`"refreshToken`":`"$refreshToken`"}"
$token = $newTokens.token
$newTokens
```
**PowerShell (curl.exe):**
```powershell
curl.exe -X POST http://localhost:5000/api/v1/auth/refresh -H "Content-Type: application/json" -d "{\"refreshToken\":\"<YOUR_REFRESH_TOKEN>\"}"
```
**Bash:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<YOUR_REFRESH_TOKEN>"}'
```

---

### Get Authenticated User Profile (Me)
**PowerShell:**
```powershell
irm http://localhost:5000/api/v1/auth/me -Headers @{ Authorization = "Bearer $token" }
# or curl.exe:
curl.exe -X GET http://localhost:5000/api/v1/auth/me -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```
**Bash:**
```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

---

### Change Password
**PowerShell:**
```powershell
irm http://localhost:5000/api/v1/auth/change-password -Method Put -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body '{"currentPassword":"Password123!","newPassword":"NewPassword123!"}'
```
**PowerShell (curl.exe):**
```powershell
curl.exe -X PUT http://localhost:5000/api/v1/auth/change-password -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" -H "Content-Type: application/json" -d "{\"currentPassword\":\"Password123!\",\"newPassword\":\"NewPassword123!\"}"
```
**Bash:**
```bash
curl -X PUT http://localhost:5000/api/v1/auth/change-password \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "Password123!",
    "newPassword": "NewPassword123!"
  }'
```

---

### Logout
**PowerShell:**
```powershell
irm http://localhost:5000/api/v1/auth/logout -Method Post -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body "{`"refreshToken`":`"$refreshToken`"}"
```
**PowerShell (curl.exe):**
```powershell
curl.exe -X POST http://localhost:5000/api/v1/auth/logout -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" -H "Content-Type: application/json" -d "{\"refreshToken\":\"<YOUR_REFRESH_TOKEN>\"}"
```
**Bash:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<YOUR_REFRESH_TOKEN>"}'
```

---

## 3. User & Candidate Profile

### Update Basic User Info
**PowerShell:**
```powershell
irm http://localhost:5000/api/v1/users/me -Method Patch -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body '{"name":"John Doe","phone":"+1122334455"}'
```
**Bash:**
```bash
curl -X PATCH http://localhost:5000/api/v1/users/me \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "phone": "+1122334455"}'
```

---

### Update Candidate Detailed Profile
**PowerShell:**
```powershell
irm http://localhost:5000/api/v1/users/me/candidate-profile -Method Patch -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body '{"headline":"Senior Fullstack Developer","summary":"5+ years experienced developer","location":"San Francisco, CA","skills":["javascript","typescript","nodejs","mongodb"]}'
```
**Bash:**
```bash
curl -X PATCH http://localhost:5000/api/v1/users/me/candidate-profile \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "headline": "Senior Fullstack Developer",
    "summary": "5+ years experienced developer",
    "location": "San Francisco, CA",
    "skills": ["javascript", "typescript", "nodejs", "mongodb"]
  }'
```

---

### Upload Resume
**PowerShell (curl.exe):**
```powershell
curl.exe -X POST http://localhost:5000/api/v1/users/me/resume -H "Authorization: Bearer <CANDIDATE_TOKEN>" -F "resume=@C:\path\to\your\resume.pdf"
```
**Bash:**
```bash
curl -X POST http://localhost:5000/api/v1/users/me/resume \
  -H "Authorization: Bearer <CANDIDATE_TOKEN>" \
  -F "resume=@/path/to/resume.pdf"
```

---

### Toggle Save / Bookmark Job
**PowerShell:**
```powershell
irm http://localhost:5000/api/v1/users/jobs/<JOB_ID>/save -Method Post -Headers @{ Authorization = "Bearer $token" }
```
**Bash:**
```bash
curl -X POST http://localhost:5000/api/v1/users/jobs/<JOB_ID>/save \
  -H "Authorization: Bearer <CANDIDATE_TOKEN>"
```

---

### Get My Applications
**PowerShell:**
```powershell
irm "http://localhost:5000/api/v1/users/me/applications?page=1&limit=10" -Headers @{ Authorization = "Bearer $token" }
```
**Bash:**
```bash
curl "http://localhost:5000/api/v1/users/me/applications?page=1&limit=10" \
  -H "Authorization: Bearer <CANDIDATE_TOKEN>"
```

---

### Get My Interviews
**PowerShell:**
```powershell
irm "http://localhost:5000/api/v1/users/me/interviews?page=1&limit=10" -Headers @{ Authorization = "Bearer $token" }
```
**Bash:**
```bash
curl "http://localhost:5000/api/v1/users/me/interviews?page=1&limit=10" \
  -H "Authorization: Bearer <CANDIDATE_TOKEN>"
```

---

## 4. Companies

### Create Company (Recruiter / Admin)
**PowerShell:**
```powershell
$company = irm http://localhost:5000/api/v1/companies -Method Post -Headers @{ Authorization = "Bearer $recruiterToken" } -ContentType "application/json" -Body '{"name":"Acme Innovations","description":"Leading tech company","website":"https://acme.com","location":"New York, NY","industry":"Technology","size":"50-200"}'
$companyId = $company.company._id
$company
```
**Bash:**
```bash
curl -X POST http://localhost:5000/api/v1/companies \
  -H "Authorization: Bearer <RECRUITER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Innovations",
    "description": "Leading tech company",
    "website": "https://acme.com",
    "location": "New York, NY",
    "industry": "Technology",
    "size": "50-200"
  }'
```

---

### List Companies (Public)
**PowerShell:**
```powershell
irm "http://localhost:5000/api/v1/companies?page=1&limit=10&search=Acme"
```
**Bash:**
```bash
curl "http://localhost:5000/api/v1/companies?page=1&limit=10&search=Acme"
```

---

### Get Company Details (Public)
**PowerShell:**
```powershell
irm http://localhost:5000/api/v1/companies/<COMPANY_ID>
```
**Bash:**
```bash
curl http://localhost:5000/api/v1/companies/<COMPANY_ID>
```

---

### Update Company (Recruiter / Admin)
**PowerShell:**
```powershell
irm http://localhost:5000/api/v1/companies/<COMPANY_ID> -Method Patch -Headers @{ Authorization = "Bearer $recruiterToken" } -ContentType "application/json" -Body '{"size":"200-500"}'
```
**Bash:**
```bash
curl -X PATCH http://localhost:5000/api/v1/companies/<COMPANY_ID> \
  -H "Authorization: Bearer <RECRUITER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"size": "200-500"}'
```

---

### Request Company Verification (Recruiter)
**PowerShell:**
```powershell
irm http://localhost:5000/api/v1/companies/<COMPANY_ID>/verification -Method Post -Headers @{ Authorization = "Bearer $recruiterToken" } -ContentType "application/json" -Body '{"documents":["https://example.com/doc.pdf"],"notes":"Incorporation certificate attached."}'
```
**Bash:**
```bash
curl -X POST http://localhost:5000/api/v1/companies/<COMPANY_ID>/verification \
  -H "Authorization: Bearer <RECRUITER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"documents": ["https://example.com/doc.pdf"], "notes": "Incorporation certificate attached."}'
```

---

## 5. Jobs

### Create Job Draft (Recruiter)
**PowerShell:**
```powershell
$job = irm http://localhost:5000/api/v1/jobs -Method Post -Headers @{ Authorization = "Bearer $recruiterToken" } -ContentType "application/json" -Body "{\"title\":\"Senior Backend Developer\",\"companyId\":\"$companyId\",\"description\":\"We are seeking a seasoned Node.js developer.\",\"location\":\"Remote\",\"workMode\":\"REMOTE\",\"employmentType\":\"FULL_TIME\",\"skills\":[\"nodejs\",\"mongodb\",\"typescript\"],\"salary\":{\"min\":90000,\"max\":130000,\"currency\":\"USD\"}}"
$jobId = $job.job._id
$job
```
**Bash:**
```bash
curl -X POST http://localhost:5000/api/v1/jobs \
  -H "Authorization: Bearer <RECRUITER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Backend Developer",
    "companyId": "<COMPANY_ID>",
    "description": "We are seeking a seasoned Node.js developer.",
    "location": "Remote",
    "workMode": "REMOTE",
    "employmentType": "FULL_TIME",
    "skills": ["nodejs", "mongodb", "typescript"],
    "salary": {"min": 90000, "max": 130000, "currency": "USD"}
  }'
```

---

### Publish Job (Recruiter)
**PowerShell:**
```powershell
irm "http://localhost:5000/api/v1/jobs/$jobId/publish" -Method Post -Headers @{ Authorization = "Bearer $recruiterToken" }
```
**Bash:**
```bash
curl -X POST http://localhost:5000/api/v1/jobs/<JOB_ID>/publish \
  -H "Authorization: Bearer <RECRUITER_TOKEN>"
```

---

### Search & Filter Jobs (Public)
**PowerShell:**
```powershell
irm "http://localhost:5000/api/v1/jobs?search=Backend&location=Remote&workMode=REMOTE&employmentType=FULL_TIME&page=1&limit=10"
```
**Bash:**
```bash
curl "http://localhost:5000/api/v1/jobs?search=Backend&location=Remote&workMode=REMOTE&employmentType=FULL_TIME&page=1&limit=10"
```

---

### Get Job by ID (Public)
**PowerShell:**
```powershell
irm "http://localhost:5000/api/v1/jobs/$jobId"
```
**Bash:**
```bash
curl http://localhost:5000/api/v1/jobs/<JOB_ID>
```

---

### Update Job (Recruiter)
**PowerShell:**
```powershell
irm "http://localhost:5000/api/v1/jobs/$jobId" -Method Patch -Headers @{ Authorization = "Bearer $recruiterToken" } -ContentType "application/json" -Body '{"title":"Lead Backend Engineer","salary":{"min":100000,"max":150000,"currency":"USD"}}'
```
**Bash:**
```bash
curl -X PATCH http://localhost:5000/api/v1/jobs/<JOB_ID> \
  -H "Authorization: Bearer <RECRUITER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Lead Backend Engineer"}'
```

---

### Close Job (Recruiter)
**PowerShell:**
```powershell
irm "http://localhost:5000/api/v1/jobs/$jobId/close" -Method Post -Headers @{ Authorization = "Bearer $recruiterToken" }
```
**Bash:**
```bash
curl -X POST http://localhost:5000/api/v1/jobs/<JOB_ID>/close \
  -H "Authorization: Bearer <RECRUITER_TOKEN>"
```

---

### Delete Job (Recruiter / Admin)
**PowerShell:**
```powershell
irm "http://localhost:5000/api/v1/jobs/$jobId" -Method Delete -Headers @{ Authorization = "Bearer $recruiterToken" }
```
**Bash:**
```bash
curl -X DELETE http://localhost:5000/api/v1/jobs/<JOB_ID> \
  -H "Authorization: Bearer <RECRUITER_TOKEN>"
```

---

## 6. Applications

### Candidate Apply to Job
**PowerShell:**
```powershell
$app = irm "http://localhost:5000/api/v1/jobs/$jobId/apply" -Method Post -Headers @{ Authorization = "Bearer $candidateToken" } -ContentType "application/json" -Body '{"resumeUrl":"/uploads/resume-sample.pdf","coverLetter":"I am excited to apply for this backend developer position.","answers":[{"question":"Years of experience?","answer":"4 years"}]}'
$applicationId = $app.application._id
$app
```
**Bash:**
```bash
curl -X POST http://localhost:5000/api/v1/jobs/<JOB_ID>/apply \
  -H "Authorization: Bearer <CANDIDATE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "resumeUrl": "/uploads/resume-sample.pdf",
    "coverLetter": "I am excited to apply for this backend developer position.",
    "answers": [{"question": "Years of experience?", "answer": "4 years"}]
  }'
```

---

### Recruiter View Applications for Job
**PowerShell:**
```powershell
irm "http://localhost:5000/api/v1/jobs/$jobId/applications?page=1&limit=10" -Headers @{ Authorization = "Bearer $recruiterToken" }
```
**Bash:**
```bash
curl "http://localhost:5000/api/v1/jobs/<JOB_ID>/applications?page=1&limit=10" \
  -H "Authorization: Bearer <RECRUITER_TOKEN>"
```

---

### Get Application Details
**PowerShell:**
```powershell
irm "http://localhost:5000/api/v1/applications/$applicationId" -Headers @{ Authorization = "Bearer $recruiterToken" }
```
**Bash:**
```bash
curl http://localhost:5000/api/v1/applications/<APPLICATION_ID> \
  -H "Authorization: Bearer <RECRUITER_TOKEN>"
```

---

### Update Application Status (Recruiter Stage Pipeline)

*Allowed Transitions:* `APPLIED` → `SCREENING` → `SHORTLISTED` → `INTERVIEW` → `SELECTED` / `REJECTED`

**PowerShell:**
```powershell
irm "http://localhost:5000/api/v1/applications/$applicationId/status" -Method Patch -Headers @{ Authorization = "Bearer $recruiterToken" } -ContentType "application/json" -Body '{"status":"SHORTLISTED","reason":"Strong candidate profile"}'
```
**Bash:**
```bash
curl -X PATCH http://localhost:5000/api/v1/applications/<APPLICATION_ID>/status \
  -H "Authorization: Bearer <RECRUITER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status": "SHORTLISTED", "reason": "Strong candidate profile"}'
```

---

### Add Recruiter Note
**PowerShell:**
```powershell
irm "http://localhost:5000/api/v1/applications/$applicationId/notes" -Method Post -Headers @{ Authorization = "Bearer $recruiterToken" } -ContentType "application/json" -Body '{"note":"Passed initial screening. Candidate has strong Node.js knowledge."}'
```
**Bash:**
```bash
curl -X POST http://localhost:5000/api/v1/applications/<APPLICATION_ID>/notes \
  -H "Authorization: Bearer <RECRUITER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"note": "Passed initial screening. Strong Node.js knowledge."}'
```

---

### Candidate Withdraw Application
**PowerShell:**
```powershell
irm "http://localhost:5000/api/v1/applications/$applicationId/withdraw" -Method Post -Headers @{ Authorization = "Bearer $candidateToken" }
```
**Bash:**
```bash
curl -X POST http://localhost:5000/api/v1/applications/<APPLICATION_ID>/withdraw \
  -H "Authorization: Bearer <CANDIDATE_TOKEN>"
```

---

## 7. Interviews

### Schedule Interview (Recruiter)
**PowerShell:**
```powershell
$interview = irm http://localhost:5000/api/v1/interviews -Method Post -Headers @{ Authorization = "Bearer $recruiterToken" } -ContentType "application/json" -Body "{\"applicationId\":\"$applicationId\",\"scheduledAt\":\"2026-10-15T14:00:00Z\",\"durationMinutes\":60,\"type\":\"TECHNICAL\",\"mode\":\"ONLINE\",\"meetingUrl\":\"https://meet.google.com/abc-defg-hij\"}"
$interviewId = $interview.interview._id
$interview
```
**Bash:**
```bash
curl -X POST http://localhost:5000/api/v1/interviews \
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

---

### List Interviews
**PowerShell:**
```powershell
irm "http://localhost:5000/api/v1/interviews?status=SCHEDULED&page=1&limit=10" -Headers @{ Authorization = "Bearer $token" }
```
**Bash:**
```bash
curl "http://localhost:5000/api/v1/interviews?status=SCHEDULED&page=1&limit=10" \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

---

### Get Interview by ID
**PowerShell:**
```powershell
irm "http://localhost:5000/api/v1/interviews/$interviewId" -Headers @{ Authorization = "Bearer $token" }
```
**Bash:**
```bash
curl http://localhost:5000/api/v1/interviews/<INTERVIEW_ID> \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

---

### Reschedule / Update Interview (Recruiter)
**PowerShell:**
```powershell
irm "http://localhost:5000/api/v1/interviews/$interviewId" -Method Patch -Headers @{ Authorization = "Bearer $recruiterToken" } -ContentType "application/json" -Body '{"scheduledAt":"2026-10-16T15:30:00Z","status":"RESCHEDULED"}'
```
**Bash:**
```bash
curl -X PATCH http://localhost:5000/api/v1/interviews/<INTERVIEW_ID> \
  -H "Authorization: Bearer <RECRUITER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"scheduledAt": "2026-10-16T15:30:00Z", "status": "RESCHEDULED"}'
```

---

### Submit Interview Evaluation (Recruiter)
**PowerShell:**
```powershell
irm "http://localhost:5000/api/v1/interviews/$interviewId/evaluation" -Method Post -Headers @{ Authorization = "Bearer $recruiterToken" } -ContentType "application/json" -Body '{"rating":5,"feedback":"Excellent problem-solving and system design skills.","decision":"STRONG_HIRE","shareableWithCandidate":true,"candidateFeedback":"Outstanding coding interview performance!"}'
```
**Bash:**
```bash
curl -X POST http://localhost:5000/api/v1/interviews/<INTERVIEW_ID>/evaluation \
  -H "Authorization: Bearer <RECRUITER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "feedback": "Excellent problem-solving and system design skills.",
    "decision": "STRONG_HIRE",
    "shareableWithCandidate": true,
    "candidateFeedback": "Outstanding coding interview performance!"
  }'
```

---

### Cancel Interview (Recruiter)
**PowerShell:**
```powershell
irm "http://localhost:5000/api/v1/interviews/$interviewId/cancel" -Method Post -Headers @{ Authorization = "Bearer $recruiterToken" } -ContentType "application/json" -Body '{"reason":"Schedule conflict"}'
```
**Bash:**
```bash
curl -X POST http://localhost:5000/api/v1/interviews/<INTERVIEW_ID>/cancel \
  -H "Authorization: Bearer <RECRUITER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Schedule conflict"}'
```

---

## 8. Notifications

### Get Notifications & Unread Count
**PowerShell:**
```powershell
irm "http://localhost:5000/api/v1/notifications?page=1&limit=10" -Headers @{ Authorization = "Bearer $token" }
```
**Bash:**
```bash
curl "http://localhost:5000/api/v1/notifications?page=1&limit=10" \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

---

### Mark Notification as Read
**PowerShell:**
```powershell
irm "http://localhost:5000/api/v1/notifications/<NOTIFICATION_ID>/read" -Method Patch -Headers @{ Authorization = "Bearer $token" }
```
**Bash:**
```bash
curl -X PATCH http://localhost:5000/api/v1/notifications/<NOTIFICATION_ID>/read \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

---

### Mark All Notifications as Read
**PowerShell:**
```powershell
irm http://localhost:5000/api/v1/notifications/read-all -Method Patch -Headers @{ Authorization = "Bearer $token" }
```
**Bash:**
```bash
curl -X PATCH http://localhost:5000/api/v1/notifications/read-all \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

---

## 9. Admin & Moderation

### Get Platform Statistics
**PowerShell:**
```powershell
irm http://localhost:5000/api/v1/admin/stats -Headers @{ Authorization = "Bearer $adminToken" }
```
**Bash:**
```bash
curl http://localhost:5000/api/v1/admin/stats \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

---

### Search & List Users
**PowerShell:**
```powershell
irm "http://localhost:5000/api/v1/admin/users?role=CANDIDATE&status=ACTIVE&page=1&limit=10" -Headers @{ Authorization = "Bearer $adminToken" }
```
**Bash:**
```bash
curl "http://localhost:5000/api/v1/admin/users?role=CANDIDATE&status=ACTIVE&page=1&limit=10" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

---

### Suspend / Reactivate User
**PowerShell:**
```powershell
irm http://localhost:5000/api/v1/admin/users/<USER_ID>/status -Method Patch -Headers @{ Authorization = "Bearer $adminToken" } -ContentType "application/json" -Body '{"status":"SUSPENDED"}'
```
**Bash:**
```bash
curl -X PATCH http://localhost:5000/api/v1/admin/users/<USER_ID>/status \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status": "SUSPENDED"}'
```

---

### Verify / Reject Company
**PowerShell:**
```powershell
irm http://localhost:5000/api/v1/admin/companies/<COMPANY_ID>/verification -Method Patch -Headers @{ Authorization = "Bearer $adminToken" } -ContentType "application/json" -Body '{"verificationStatus":"VERIFIED","verificationNotes":"Verification documents reviewed and accepted."}'
```
**Bash:**
```bash
curl -X PATCH http://localhost:5000/api/v1/admin/companies/<COMPANY_ID>/verification \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "verificationStatus": "VERIFIED",
    "verificationNotes": "Verification documents reviewed and accepted."
  }'
```
