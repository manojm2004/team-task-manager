# ⚡ TaskFlow — Team Task Manager

A full-stack Team Task Manager with role-based access control, built with **React + Express + PostgreSQL + Prisma**.

## 🚀 Live Demo
**[https://your-app.railway.app](https://your-app.railway.app)**

## 🧰 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS (Glassmorphism dark theme) |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT + bcryptjs |
| Deploy | Railway |

## ✨ Features

- **Authentication** — Signup/Login with JWT tokens
- **Projects** — Create, edit, delete projects
- **Tasks** — Kanban board (To Do / In Progress / Done), priority levels, due dates, assignees
- **Teams** — Invite members, manage roles (Admin / Member)
- **Dashboard** — Stats, overdue alerts, upcoming tasks, project progress
- **RBAC** — Admins can manage everything; Members can create/update their own tasks

## 🗂 Project Structure

```
team-task-manager/
├── backend/
│   ├── prisma/schema.prisma     # DB schema
│   ├── src/
│   │   ├── middleware/          # auth.js, rbac.js
│   │   ├── routes/              # auth, projects, tasks, users
│   │   └── index.js             # Express entry
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/                 # Axios API calls
    │   ├── components/          # Navbar, TaskCard, Modals
    │   ├── context/             # AuthContext
    │   ├── pages/               # Landing, Auth, Dashboard, Projects
    │   └── App.jsx
    └── package.json
```

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL running locally

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/team-task-manager.git
cd team-task-manager

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
```

### 3. Run Database Migrations

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Start Development Servers

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Frontend → http://localhost:5173  
Backend API → http://localhost:5000

## 🚂 Deploy to Railway

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add a **PostgreSQL** plugin to the project
4. Set environment variables:
   - `DATABASE_URL` (auto-set by Railway PostgreSQL plugin)
   - `JWT_SECRET` → any random string
   - `NODE_ENV` → `production`
   - `FRONTEND_URL` → your Railway app URL
5. Railway will auto-detect `railway.toml` and deploy ✅

## 🔐 API Endpoints

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | JWT |
| GET | `/api/projects` | JWT |
| POST | `/api/projects` | JWT |
| GET | `/api/projects/:id` | Member |
| PUT | `/api/projects/:id` | Admin |
| DELETE | `/api/projects/:id` | Owner |
| POST | `/api/projects/:id/members` | Admin |
| GET | `/api/projects/:id/tasks` | Member |
| POST | `/api/projects/:id/tasks` | Member |
| PUT | `/api/projects/:id/tasks/:taskId` | Admin/Creator |
| PATCH | `/api/projects/:id/tasks/:taskId/status` | Assignee/Admin |
| DELETE | `/api/projects/:id/tasks/:taskId` | Admin |
| GET | `/api/users/search?q=` | JWT |
| GET | `/api/users/dashboard` | JWT |

## 📄 License
MIT
