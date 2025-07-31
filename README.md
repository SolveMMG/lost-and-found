# USIU Lost and Found

A modern full-stack web application built for United States International University (USIU) to help students and staff report, search, and claim lost or found items efficiently.

> **Find what you’ve lost. Help others find theirs.**

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- Report lost or found items with images and contact details
- Search and filter items by category, date, and keywords
- Claim found items with automatic status tracking
- Admin dashboard to verify, match, and resolve items
- Secure JWT-based user authentication and role management
- Notification system for item matches and claim status updates
- Clean, responsive, USIU-branded UI built with modern frontend tools

---

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js, Prisma ORM
- **Database:** PostgreSQL
- **Authentication:** JSON Web Tokens (JWT)
- **Image Uploads:** Multer (Express middleware)
- **Deployment:**
  - Backend hosted on Render
  - Frontend hosted on Vercel

---

## Screenshots

> *Insert UI screenshots here: homepage, item detail, report form, admin dashboard, etc.*

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm (v9+)
- PostgreSQL instance (local or cloud-hosted: e.g. Supabase, Render, Aiven)

### Backend Setup

```bash
git clone https://github.com/your-org/usiu-lost-and-found.git
cd usiu-lost-and-found/backend
npm install
```

Create a `.env` file using `.env.example`:

```bash
cp .env.example .env
```

Update `.env` with your PostgreSQL URL and JWT secret.

Run database migrations and seed initial data:

```bash
npx prisma migrate dev --name init
node prisma/seed.js
```

Start the backend:

```bash
npm run dev
```

Default backend runs at: `http://localhost:10000`

### Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend/` root:

```bash
VITE_API_URL=http://localhost:10000
```

Start the frontend dev server:

```bash
npm run dev
```

Frontend runs at: `http://localhost:8080`

---

## Deployment

### Backend (Render)

- Deploy the backend as a web service
- Set environment variables via the Render dashboard

### Frontend (Vercel)

- Deploy directly from GitHub
- Set `VITE_API_URL` in Vercel environment settings

---

## Project Structure

```
usiu-lost-and-found/
├── backend/
│   ├── index.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── images/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── items.js
│   │   └── upload.js
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── ...
│   ├── public/
│   └── package.json
└── README.md
```

---

## API Endpoints

### Authentication

- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive a JWT token

### Items

- `GET /api/items` — Retrieve all reported items
- `POST /api/items` — Submit a new lost/found item
- `PATCH /api/items/:id/status` — Update item status (admin only)
- `PATCH /api/items/:id/verify` — Verify and assign ownership (admin only)
- `POST /api/items/:id/claim` — Submit a claim on an item

### Images

- `POST /api/upload/images` — Upload item images

---

## Contributing

1. Fork the repository
2. Create a new feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit your changes:
   ```bash
   git commit -am 'Add new feature'
   ```
4. Push the branch:
   ```bash
   git push origin feature/your-feature
   ```
5. Open a pull request to the `main` branch

---

## License

This project is licensed under the **MIT License**.

---

