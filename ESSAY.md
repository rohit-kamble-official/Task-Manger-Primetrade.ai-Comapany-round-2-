# TaskFlow: Building a Secure, Role-Based Task Management System

## Project Essay — Backend Developer Internship Assignment

---

## Introduction

TaskFlow is a full-stack Task Management System I designed and built as part of a backend developer internship assignment. The goal was to create a production-ready web application that demonstrates core backend engineering skills: RESTful API design, secure authentication, role-based authorization, database modeling, and clean code architecture — paired with a professional, responsive frontend interface.

The project challenged me to think not just about writing working code, but about building a system that is maintainable, scalable, and secure — principles that are critical in any real-world software environment.

---

## Problem Statement

Teams and individuals often struggle to track their tasks effectively. While many enterprise solutions exist, the goal of this project was to build a clean, beginner-friendly task manager from scratch that demonstrates strong fundamentals: user authentication, protected routes, data persistence, and role-based permissions. The system needed to be intuitive for end users while exposing a well-structured API for potential future integrations.

---

## Technical Architecture

### Backend Design

The backend follows the **MVC (Model-View-Controller)** architectural pattern, which cleanly separates business logic, data access, and routing. I chose Node.js with Express.js for the server layer because of its lightweight, non-blocking I/O model — well suited for REST APIs handling concurrent requests.

**Database**: MongoDB was selected as the primary database, accessed through the Mongoose ODM. MongoDB's flexible schema aligns well with task data, which may evolve over time (adding fields like tags, attachments, etc.). Mongoose adds schema validation and indexing capabilities that enforce data consistency at the application level.

**Authentication**: Security is implemented via JSON Web Tokens (JWT). When a user registers or logs in, the server signs a JWT with a secret key and returns it to the client. Every subsequent protected request must include this token in the `Authorization: Bearer <token>` header. On the server, an `auth.middleware.js` intercepts the request, verifies the token, and attaches the decoded user to the request context before passing it to the controller.

Passwords are never stored in plain text. I used `bcryptjs` with a salt factor of 10, which is the industry-recommended minimum for balancing security and performance. This means even if the database is compromised, passwords cannot be trivially reversed.

**Role-Based Access Control (RBAC)**: The system defines two roles: `user` and `admin`. Standard users can only create, view, update, and delete their own tasks. Admin users have visibility and control over all tasks in the system. This is enforced in the task controller by checking `req.user.role` and conditionally filtering the database query — users get `{ user: req.user._id }` as a filter, while admins query with no user restriction.

**Input Validation**: All incoming request data is validated server-side using `express-validator`. This prevents invalid or malicious data from reaching the database. Errors are caught early and returned in a consistent format before any business logic executes.

**Error Handling**: A centralized error handler middleware captures all unhandled errors, normalizes Mongoose-specific errors (validation errors, duplicate key errors, CastErrors), and returns clean JSON responses. In production mode, stack traces are hidden from the client.

### API Design

The API follows RESTful conventions with a versioned base path (`/api/v1`). All responses use a consistent envelope structure:

```json
{
  "success": true,
  "message": "Human-readable description",
  "data": { ... }
}
```

This consistency makes the API predictable for frontend consumers and third-party integrators. The task endpoints support server-side pagination and filtering by `status` and `priority`, ensuring the API remains performant as data scales.

### Frontend Architecture

The frontend is a Single Page Application (SPA) built with React 18 and Vite. I used React Router v6 for client-side routing with protected route guards that redirect unauthenticated users to the login page.

Authentication state is managed globally via React Context API, avoiding prop drilling and keeping auth logic centralized. Axios is configured with a request interceptor that automatically attaches the JWT from localStorage to every API call, and a response interceptor that handles 401 errors by clearing the token and redirecting to login.

The UI follows a dashboard layout pattern with a fixed sidebar for navigation and a top navbar showing the current date and user role. Components are composed into pages: Login, Register, Dashboard, and Tasks. The Dashboard provides an at-a-glance view with task statistics, progress bars, overdue alerts, and a recent activity list. The Tasks page features a filterable, searchable, paginated grid of task cards with inline edit/delete actions and a modal form for creating and editing tasks.

---

## Key Engineering Decisions

**Why JWT over sessions?** JWTs are stateless, meaning the server doesn't need to store session data. This simplifies horizontal scaling — any server instance can verify a token without querying a session store. The trade-off is that tokens cannot be invalidated before expiry, but for the scope of this project, this is an acceptable design decision.

**Why MongoDB over SQL?** Task management data is a natural fit for document-based storage. Tasks can evolve in structure, and MongoDB's query capabilities are more than sufficient for the filtering and pagination requirements here. Mongoose adds a schema layer that provides the type safety benefits without the rigidity of SQL.

**Why Tailwind CSS?** Tailwind's utility-first approach significantly accelerates UI development without sacrificing customization. It eliminates the need for a separate CSS file per component and keeps styling co-located with markup. The resulting bundle is small because Tailwind purges unused classes at build time.

**Consistent API Responses**: A dedicated `response.utils.js` module centralizes the `sendSuccess` and `sendError` helpers. This prevents inconsistent response shapes across controllers and makes the API contract predictable and documentable.

---

## Challenges and Solutions

**Challenge: Enforcing ownership on task updates**
When a user sends a PUT or DELETE request, I need to ensure they only modify their own tasks. The solution was to first fetch the task by ID, then compare `task.user.toString()` with `req.user._id.toString()` before allowing the operation. Admins bypass this check via a role check. This prevents horizontal privilege escalation.

**Challenge: Token expiry UX**
When a JWT expires, the API returns a 401. The Axios response interceptor catches this globally, clears the token from localStorage, and redirects the user to the login page — providing a seamless session-expiry experience without any component needing to handle it individually.

**Challenge: Admin vs User data scoping**
Rather than writing separate endpoints for admins and users, I used a single query builder approach in the task controller. If the user is an admin, the query object stays empty (`{}`). If they're a regular user, `{ user: req.user._id }` is added. This keeps the codebase DRY while correctly scoping data per role.

---

## API Documentation

The project includes full Swagger (OpenAPI 3.0) documentation accessible at `/api/docs`. Each endpoint is documented with its request body schema, query parameters, authentication requirements, and possible response codes. This makes the API immediately usable by other developers without reading the source code — an important professional practice.

---

## What I Learned

This project deepened my understanding of several key backend engineering concepts:

- **Middleware composition**: Building a chain of middleware (authentication → validation → controller) taught me how Express handles the request-response lifecycle and how to write modular, reusable middleware.
- **Security-first thinking**: Implementing bcrypt, JWT, RBAC, and input validation showed me that security isn't an afterthought — it needs to be baked into the architecture from the start.
- **Separation of concerns**: Keeping controllers, models, routes, middleware, and utilities in separate layers made the codebase significantly easier to reason about and extend.
- **API consistency**: Standardizing response shapes and error handling early prevented a category of bugs and confusion that would have emerged as the API grew.
- **Frontend-backend integration**: Working across the full stack — Axios interceptors, React Context for auth state, protected routing — gave me a clearer picture of how frontend and backend systems communicate and where common failure points arise.

---

## Future Improvements

If I were to extend TaskFlow further, I would consider:

- **Refresh Tokens**: Implement a short-lived access token + long-lived refresh token pattern for improved security.
- **Task Comments & Attachments**: Add a comments sub-document to tasks for collaboration.
- **Email Notifications**: Send due-date reminders via a mail service like SendGrid.
- **Team/Project Grouping**: Group tasks under projects and assign tasks to team members.
- **Rate Limiting**: Add `express-rate-limit` to protect auth endpoints from brute-force attacks.
- **Unit & Integration Tests**: Add Jest + Supertest for automated API testing.
- **Deployment**: Containerize with Docker and deploy backend to Railway or Render, frontend to Vercel.

---

## Conclusion

TaskFlow demonstrates a complete, production-oriented full-stack application built from first principles. It covers the core backend competencies expected of a backend developer: database modeling, RESTful API design, authentication, authorization, validation, error handling, and API documentation — combined with a clean, functional frontend that puts these APIs to practical use.

The project is structured to be readable, maintainable, and extensible — reflecting how I approach software engineering: with clarity, consistency, and an eye toward long-term quality.

---

*Built by [Rohit Kamble]*
