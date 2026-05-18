# TaskFlow — Task Management System

A full-stack task management web application built with **Node.js**, **Express**, **MongoDB**, and **React**. Features JWT authentication, role-based access control, and a clean professional dashboard UI.

---

## 🚀 Features

- **Secure Authentication** — Register & login with bcrypt-hashed passwords and JWT tokens
- **Role-Based Access Control** — `user` (own tasks) and `admin` (all tasks) roles
- **Full Task CRUD** — Create, view, edit, and delete tasks
- **Task Fields** — Title, description, status, priority, due date
- **Protected Routes** — JWT middleware guards all task endpoints
- **Input Validation** — Server-side validation via `express-validator`
- **API Documentation** — Swagger UI at `/api/docs`
- **Responsive UI** — Clean dashboard, sidebar, task cards, modals
- **Pagination & Filters** — Filter by status, priority; paginated results

---

## 🏗️ Tech Stack

| Layer     | Technology                              |
|-----------|----------------------------------------|
| Backend   | Node.js, Express.js, MongoDB, Mongoose |
| Auth      | JWT, bcryptjs                           |
| Validation| express-validator                       |
| API Docs  | Swagger UI (OpenAPI 3.0)               |
| Frontend  | React 18, Vite, React Router v6        |
| Styling   | Tailwind CSS                            |
| HTTP      | Axios                                   |

---

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── controllers/
│   │   ├── auth.controller.js    # Register, Login, GetMe
│   │   └── task.controller.js    # CRUD operations
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT protect, adminOnly
│   │   ├── error.middleware.js   # Global error handler
│   │   └── validation.middleware.js  # Input validation
│   ├── models/
│   │   ├── User.model.js         # User schema
│   │   └── Task.model.js         # Task schema
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── task.routes.js
│   ├── utils/
│   │   ├── jwt.utils.js          # Token generation/verify
│   │   ├── response.utils.js     # Consistent API responses
│   │   └── swagger.yaml          # OpenAPI documentation
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx         # Sidebar + Navbar
    │   │   ├── TaskCard.jsx       # Task display card
    │   │   └── TaskModal.jsx      # Create/Edit modal
    │   ├── context/
    │   │   └── AuthContext.jsx    # Auth state management
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   └── TasksPage.jsx
    │   ├── services/
    │   │   ├── api.js             # Axios instance
    │   │   └── task.service.js    # Task API calls
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    └── vite.config.js
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

Start the backend:

```bash
npm run dev      # Development (nodemon)
npm start        # Production
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔌 API Reference

Base URL: `http://localhost:5000/api/v1`

### Auth Endpoints

| Method | Endpoint             | Access  | Description         |
|--------|----------------------|---------|---------------------|
| POST   | `/auth/register`     | Public  | Register new user   |
| POST   | `/auth/login`        | Public  | Login & get token   |
| GET    | `/auth/me`           | Private | Get current user    |

### Task Endpoints

| Method | Endpoint         | Access  | Description                       |
|--------|------------------|---------|-----------------------------------|
| GET    | `/tasks`         | Private | Get tasks (own / all for admin)   |
| POST   | `/tasks`         | Private | Create a new task                 |
| PUT    | `/tasks/:id`     | Private | Update task (owner or admin)      |
| DELETE | `/tasks/:id`     | Private | Delete task (owner or admin)      |

### Query Parameters for GET /tasks

| Param      | Values                          |
|------------|---------------------------------|
| `status`   | `todo`, `in-progress`, `completed` |
| `priority` | `low`, `medium`, `high`         |
| `page`     | Integer (default: 1)            |
| `limit`    | Integer (default: 10)           |

### Example Request

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"pass123"}'

# Create task (with token)
curl -X POST http://localhost:5000/api/v1/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Build API","priority":"high","status":"todo"}'
```

### Response Format

All responses follow this structure:

```json
{
  "success": true,
  "message": "Tasks fetched successfully.",
  "data": { ... }
}
```

---

## 📚 API Documentation (Swagger)

Visit: `http://localhost:5000/api/docs`

---

## 🔐 Authentication Flow

1. User registers → password is hashed with bcrypt → JWT issued
2. JWT is stored in `localStorage` on the frontend
3. Every protected request sends `Authorization: Bearer <token>`
4. JWT middleware verifies token, attaches user to `req.user`
5. Role check: admin sees all tasks, users see only their own

---

## 🛡️ Security Features

- ✅ Passwords hashed with `bcryptjs` (salt rounds: 10)
- ✅ JWT signed with a secret key, expires in 7 days
- ✅ Middleware protects all task routes
- ✅ Role-based access: users cannot access others' tasks
- ✅ Input validation on all endpoints
- ✅ Global error handler prevents stack trace leaks in production
- ✅ MongoDB injection prevented via Mongoose schema validation

---

## 🌐 Environment Variables

| Variable     | Description              | Example                          |
|--------------|--------------------------|----------------------------------|
| `PORT`       | Server port              | `5000`                           |
| `MONGO_URI`  | MongoDB connection string| `mongodb://localhost:27017/taskflow` |
| `JWT_SECRET` | JWT signing secret       | `super_secret_key`               |
| `JWT_EXPIRE` | Token expiry             | `7d`                             |
| `NODE_ENV`   | Environment              | `development` / `production`     |

---

## 👤 Default Roles

| Role  | Permissions                                      |
|-------|--------------------------------------------------|
| user  | Create, view, edit, delete **own** tasks only    |
| admin | Full access to **all** tasks                     |

---

## 📝 License

MIT © 2024 TaskFlow
