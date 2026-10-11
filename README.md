# GuruKripa (गुरु कृपा) 🕊️

A modern, full-stack React and Node.js web application engineered with modular architecture, clean separation of concerns, and rich contemporary aesthetics.

---

## 🏗️ Architecture Overview

```text
GuruKripa/
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── App.jsx             # Interactive UI Dashboard & API Explorer
│   │   ├── App.css             # Glassmorphism & UI theme styles
│   │   ├── index.css           # Global typography & design system tokens
│   │   └── main.jsx            # React root mount
│   ├── vite.config.js          # Vite configuration with /api reverse proxy
│   └── package.json            # React 19, Lucide Icons, Vite
├── server/                     # Backend Application
│   ├── src/
│   │   ├── controllers/        # REST API business logic
│   │   ├── routes/             # Express route declarations
│   │   └── server.js           # Express app setup, CORS, and error handlers
│   ├── .env                    # Environment configurations
│   ├── .env.example            # Environment template
│   └── package.json            # Express 4, CORS, Dotenv
├── package.json                # Monorepo management scripts
└── .gitignore                  # Git ignore rules
```

---

## ⚡ Quick Start

### 1. Install Dependencies
Run the installation script to install dependencies for both client and server:

```bash
# In the GuruKripa directory:
npm run install:all
```

Or install them individually:
```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

### 2. Run in Development Mode

You can run both client and server simultaneously or individually:

#### Option A: Run Both Concurrently (Recommended)
```bash
npm run dev
```

#### Option B: Run Individually
```bash
# In terminal 1 (Express backend on http://localhost:5000):
npm run dev:server

# In terminal 2 (Vite React frontend on http://localhost:5173):
npm run dev:client
```

---

## 📡 API Endpoints

The Express server exposes the following endpoints:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check, uptime, and server timestamp |
| `GET` | `/api/info` | Application metadata and supported features |
| `GET` | `/api/services` | Initiatives, seva activities, and programs |
| `GET` | `/api/inquiries` | Retrieve submissions list |
| `POST` | `/api/inquiries` | Submit contact / seva inquiries |

---

## ⚙️ Configuration

### Server Environment Variables (`server/.env`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Vite Dev Proxy (`client/vite.config.js`)
All calls to `/api/*` from the React app are automatically proxied to `http://localhost:5000` during development, eliminating cross-origin CORS conflicts.
