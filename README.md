# 🎯 InternTrack — Attendance & Task Tracker

A production-ready full-stack MERN application for managing intern attendance, tasks, feedback, and performance reporting.

website is live (https://intern-tracker-three.vercel.app/)

---

## 🚀 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, React Router v6, Recharts |
| Styling    | Custom CSS Design System (no library deps) |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB Atlas + Mongoose ODM        |
| Auth       | JWT + bcryptjs                      |
| Deployment | Vercel (FE) · Render (BE) · Atlas (DB) |

---

## 📁 Project Structure

```
intern-tracker/
├── backend/
│   ├── config/         # DB connection
│   ├── controllers/    # authController, attendanceController, taskController, userController, reportController
│   ├── middleware/      # auth.js (JWT protect + authorize)
│   ├── models/         # User, Attendance, Task
│   ├── routes/         # authRoutes, userRoutes, attendanceRoutes, taskRoutes, reportRoutes
│   ├── .env.example
│   └── server.js
└── frontend/
    └── src/
        ├── context/    # AuthContext, ToastContext
        ├── pages/
        │   ├── auth/   # Login, Register
        │   ├── admin/  # Dashboard, Tasks, Interns, Attendance, Reports
        │   └── intern/ # Dashboard, Tasks, Attendance, Profile
        ├── components/shared/  # Sidebar
        ├── services/   # axios api.js
        ├── App.js      # Router + Protected Routes
        └── index.css   # Full design system (tokens, components)
```

---

## ⚙️ Setup & Run

### 1. Clone & Install

```bash
# Backend
cd backend
npm install
cp .env.example .env      # Fill in MONGO_URI and JWT_SECRET

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/intern-tracker
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### 3. Run Locally

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd backend && npm run dev

# Terminal 2 — Frontend (http://localhost:3000)
cd frontend && npm start
```

---

## 🔐 API Reference

### Auth  `/api/auth`
| Method | Route              | Access | Description          |
|--------|--------------------|--------|----------------------|
| POST   | `/register`        | Public | Create account       |
| POST   | `/login`           | Public | Login & get JWT      |
| GET    | `/me`              | Auth   | Current user         |
| PUT    | `/update-profile`  | Auth   | Update profile       |
| PUT    | `/change-password` | Auth   | Change password      |

### Attendance  `/api/attendance`
| Method | Route      | Access | Description             |
|--------|------------|--------|-------------------------|
| POST   | `/checkin` | Intern | Check in for today      |
| PUT    | `/checkout`| Intern | Check out for today     |
| GET    | `/my`      | Intern | Own attendance history  |
| GET    | `/today`   | Intern | Today's status          |
| GET    | `/all`     | Admin  | All intern attendance   |
| POST   | `/mark`    | Admin  | Manual entry            |

### Tasks  `/api/tasks`
| Method | Route           | Access | Description             |
|--------|-----------------|--------|-------------------------|
| POST   | `/`             | Admin  | Create task             |
| GET    | `/`             | Admin  | All tasks (filterable)  |
| GET    | `/my`           | Intern | Own tasks               |
| GET    | `/:id`          | Auth   | Single task             |
| PUT    | `/:id`          | Admin  | Edit task               |
| POST   | `/:id/submit`   | Intern | Submit work             |
| PUT    | `/:id/review`   | Admin  | Approve / reject        |
| DELETE | `/:id`          | Admin  | Soft delete             |

### Users  `/api/users`  *(Admin only)*
| Method | Route                | Description              |
|--------|----------------------|--------------------------|
| GET    | `/`                  | List all users           |
| GET    | `/:id`               | User + stats             |
| PUT    | `/:id`               | Update user              |
| DELETE | `/:id`               | Deactivate user          |
| GET    | `/dashboard-stats`   | Admin dashboard metrics  |

### Reports  `/api/reports`  *(Admin only)*
| Method | Route            | Description              |
|--------|------------------|--------------------------|
| GET    | `/overview`      | All-intern summary table |
| GET    | `/intern/:id`    | Per-intern report        |

---

## 🧑‍💼 Roles

| Feature                    | Admin | Intern |
|----------------------------|-------|--------|
| View all interns            | ✅    | ❌     |
| Assign & review tasks       | ✅    | ❌     |
| Mark attendance manually    | ✅    | ❌     |
| View reports & analytics    | ✅    | ❌     |
| Check in / out              | ❌    | ✅     |
| Submit task work            | ❌    | ✅     |
| View own attendance history | ❌    | ✅     |
| Edit own profile            | ❌    | ✅     |

---

## 🚢 Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Deploy /build folder to Vercel
# Set REACT_APP_API_URL=https://your-backend.onrender.com/api
```

### Backend → Render
- Build command: `npm install`
- Start command: `node server.js`
- Add all `.env` variables in the Render dashboard

### Database → MongoDB Atlas
- Create a free M0 cluster
- Whitelist `0.0.0.0/0` for Render IPs
- Copy the connection string to `MONGO_URI`

---

## ✅ Evaluation Checklist

- [x] Complete CRUD — Users, Tasks, Attendance
- [x] JWT Authentication & bcrypt password hashing
- [x] Role-Based Access Control (Admin / Intern)
- [x] Protected Routes (frontend & backend)
- [x] Responsive UI with custom design system
- [x] Input validation (express-validator + frontend)
- [x] Soft delete (users & tasks)
- [x] Analytics — Recharts bar & radar charts
- [x] Attendance heatmap calendar
- [x] MongoDB Atlas integration
- [x] Environment-based configuration
- [x] Clean API architecture (MVC pattern)
- [x] GitHub-ready (meaningful file structure)

---

## 🎨 UI Design System

The frontend uses a hand-crafted dark design system (`index.css`) with:
- CSS custom properties (tokens) for consistent theming
- Space Grotesk display font + Inter body font
- Component classes: `.card`, `.stat-card`, `.badge`, `.btn`, `.table-wrap`, `.modal`, `.timeline`, `.progress-bar-*`
- Animated check-in ring widget, calendar heatmap, toast notifications
- Fully responsive grid layout

---

*Built with the MERN stack — MongoDB · Express · React · Node.js*
