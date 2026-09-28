# HireFlow

HireFlow is a full-stack recruitment platform designed to connect job seekers and recruiters in a smooth hiring experience. It supports candidate onboarding, job publishing, application tracking, resume management, interviews, and recruiter evaluation workflows.

The project is split into two main parts:
- Frontend: React + Vite
- Backend: Node.js + Express + MongoDB

This repository contains the complete working project for a hiring management system with separate experiences for:
- Candidates
- Recruiters
- Admins (backend role-based access)

---

## Project Overview

HireFlow helps organizations streamline recruitment by allowing:

- Candidates to create profiles, upload resumes, search jobs, and apply
- Recruiters to post jobs, review applicants, and manage hiring stages
- Admins to manage system-level access, users, and company-related data
- Users to receive role-based access and secure authentication

The app is designed to simulate a real-world hiring flow where candidates move from job discovery to application submission and recruiter evaluation.

---

## Why This Project Exists

Traditional recruitment workflows are often fragmented across multiple tools and manual steps. HireFlow centralizes these activities into a single platform where:
- candidates can discover jobs easily
- recruiters can manage their hiring pipeline
- companies can manage roles and applicants
- the system enforces secure access using authentication and role-based authorization

---

## Core Features

### Candidate Features
- Sign up / login
- Candidate profile creation
- Resume upload and resume management
- Search and view available jobs
- Apply to jobs
- Track application progress
- View hiring updates and application status

### Recruiter Features
- Recruiter login and account access
- Create and manage jobs
- Review applicant list
- Evaluate candidate suitability
- Manage recruitment pipeline
- View application data and profile details

### Admin / System Features
- Role-based authorization
- User management
- Company-level data handling
- Protected backend routes
- Centralized API logic

### Technical Features
- REST API backend
- JWT-based authentication
- MongoDB database
- File upload support
- Role-based access control (RBAC)
- React SPA frontend with protected routes
- Modular code structure

---

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS
- React Router
- Context API for auth state

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Multer (file upload support)
- Role-based middleware

---

## Folder Structure

```text
HireFlow/
├── README.md
├── HireFlow-frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── CandidadateRoute.jsx
│   │   ├── RecruiterRoutes.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── API/
│   │   │   ├── candidate/
│   │   │   ├── helper-components/
│   │   │   ├── recruiter/
│   │   │   ├── reactbits/
│   │   │   └── ui/
│   │   └── context/
│   │       └── AuthContext.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── utils/
│   ├── app.js
│   ├── package.json
│   ├── .env
│   ├── .env.example
│   └── README.md
└── ...