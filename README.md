# TaskFlow — Mini SaaS Task Manager

A production-ready, full-stack Task Management application built for the **Full Stack Developer Intern Screening Test**.

---

## 🚀 Features Implemented

### ✅ Authentication System
- **Signup & Login** with email and password
- **Password hashing** using `bcryptjs`
- **JWT-based authentication** with token expiry
- **Protected routes** — unauthenticated users are redirected to login

### ✅ Task Management (Multi-User)
- Each user can **Create, Read, Update, Delete** their own tasks
- Users **only see their own tasks** — no global task leakage
- **Toggle status**: Pending → Completed (and back)
- **Priority levels**: Low, Medium, High with visual color badges
- **Due dates** with calendar picker — schedule view groups tasks by date

### ✅ Backend Architecture
- **Node.js + Express** REST API
- Proper folder structure: `controllers/`, `routes/`, `models/`, `middleware/`
- **Error handling middleware** (`notFound` + `errorHandler`)
- **Input validation** on all endpoints
- **Auth middleware** (`protect`) using JWT Bearer tokens

### ✅ Frontend
- **React 19** with Vite
- **Tailwind CSS** for clean, responsive UI
- Proper **state management** with React Context API
- Full **API integration** with Axios + JWT interceptors

### ✅ Database
- **SQLite** via Sequelize ORM (zero-config local development)
- Proper **schema design**: UUID primary keys, ENUMs, relationships
- User ↔ Task relationship with `CASCADE` delete

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Auth | JWT, bcryptjs |
| ORM | Sequelize |
| Database | SQLite (local) |
| Frontend | React 19, Vite |
| Styling | Tailwind CSS v4 |
| HTTP Client | Axios |

---

## ⚙️ Setup Steps

### Prerequisites
- Node.js v18+
- npm

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd taskflow
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:
```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=30d
```

Start the backend:
```bash
npm run dev
```

### 3. Seed Sample Data (optional)
```bash
node seed.js
```
This creates sample users and tasks. Default credentials:
- **Email:** `raju@gmail.com` | **Password:** `password123`

### 4. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

### 5. Access the App
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
├── backend/
│   ├── config/
│   │   └── db.js              # Sequelize + SQLite connection
│   ├── controllers/
│   │   ├── authController.js  # Register & Login logic
│   │   └── taskController.js  # CRUD task logic
│   ├── data/
│   │   ├── sampleUsers.json   # Seed user data
│   │   └── sampleTasks.json   # Seed task data
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT protect middleware
│   │   └── errorMiddleware.js # Global error handler
│   ├── models/
│   │   ├── User.js            # User schema (bcrypt hook)
│   │   └── Task.js            # Task schema with priority + dueDate
│   ├── routes/
│   │   ├── authRoutes.js      # POST /signup, POST /login
│   │   └── taskRoutes.js      # GET/POST/PUT/DELETE /tasks
│   ├── seed.js                # Database seeder
│   └── server.js              # Express app entry point
│
└── frontend/
    └── src/
        ├── context/
        │   └── AuthContext.jsx  # Global auth state
        ├── pages/
        │   ├── DashboardPage.jsx # Main app UI
        │   ├── LoginPage.jsx
        │   └── SignupPage.jsx
        └── services/
            └── api.js           # Axios instance + JWT interceptor
```

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |

### Tasks (Protected — requires Bearer token)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | Get all tasks for logged-in user |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/:id` | Update task (status, title, priority, etc.) |
| DELETE | `/api/tasks/:id` | Delete a task |
