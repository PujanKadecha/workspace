# 🧠 Collaborative Workspace

A **real-time collaborative document editor** built with React, Node.js, Socket.IO, PostgreSQL (Prisma), and Redis. Multiple users can edit the same document simultaneously and see each other's changes live.

---

## 📸 Screenshots

### Login
![Login Page](./screenshots/login.png)

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Editor — Full Toolbar
![Editor](./screenshots/editor.png)

### Editor — Bold & Normal Text with Save
![Editor with content](./screenshots/editor_saved.png)

### Dashboard with Documents
![Dashboard with documents](./screenshots/dashboard_with_docs.png)

---

## ✨ Features

- 🔐 **JWT Authentication** — Register & login with secure token-based auth (8h expiry)
- 📁 **Workspaces** — Create and manage multiple workspaces
- 📄 **Documents** — Create multiple documents inside workspaces
- ✍️ **Rich Text Editor** — Full formatting toolbar: Bold, Italic, Underline, Strike, Blockquote, Lists, Indent, Colors, Alignment, Links & Images
- ⚡ **Real-time Collaboration** — Live document sync via Socket.IO — all users see changes instantly
- 👥 **Active User Presence** — See who else is editing the document in real time
- 💾 **Manual Save** — Owner can explicitly save the document with a visual "✓ Saved!" confirmation
- 📥 **Save to Dashboard** — Shared users can copy a document to their own workspace
- 🔗 **Share Link** — Copy a direct link to any document to invite collaborators
- 🗑️ **Delete** — Delete documents or entire workspaces
- 📡 **Redis Pub/Sub** — Scales real-time collab across multiple server instances
- 🛡️ **Route Protection** — All API routes protected with JWT middleware

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + Vite | UI framework & build tool |
| React Router v7 | Client-side routing |
| React Quill New | Rich text editor |
| Socket.IO Client | Real-time communication |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| Socket.IO | WebSocket server for real-time sync |
| Prisma ORM | Database access layer |
| PostgreSQL | Primary database |
| Redis + @socket.io/redis-adapter | Multi-instance socket sync |
| JWT (jsonwebtoken) | Authentication tokens |
| bcryptjs | Password hashing |

---

## 🗂️ Project Structure

```
collaborative-workspace/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controllers.js       # Register & login
│   │   │   └── workspace.controller.js   # Workspaces, documents, save
│   │   ├── lib/
│   │   │   └── prisma.js                 # Prisma client instance
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js        # JWT verification
│   │   └── sockets/
│   │       └── socketManager.js          # Socket.IO event handlers
│   └── server.js                         # Express + Socket.IO entry point
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx
│       │   └── Editor.jsx
│       ├── config.js              # API & Socket URL config
│       └── App.jsx                # Routes
│
└── screenshots/                   # App screenshots
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- PostgreSQL database
- Redis server (optional — app works without it, Redis enables multi-instance scaling)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/collaborative-workspace.git
cd collaborative-workspace
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/collab_db"
JWT_SECRET="your-super-secret-jwt-key"
REDIS_URL="redis://localhost:6379"
CORS_ORIGIN="http://localhost:5173"
PORT=5050
```

Run Prisma migrations:
```bash
npx prisma migrate dev
```

Start the backend:
```bash
node server.js
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in `/frontend`:
```env
VITE_API_URL=http://localhost:5050
VITE_SOCKET_URL=http://localhost:5050
```

Start the frontend:
```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create new user account |
| `POST` | `/api/auth/login` | Login and receive JWT token |

### Workspaces
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/workspaces` | ✅ | Get all workspaces for the logged-in user |
| `POST` | `/api/workspaces` | ✅ | Create a new workspace |
| `DELETE` | `/api/workspaces/:workspaceId` | ✅ | Delete a workspace and all its documents |

### Documents
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/workspaces/:workspaceId/documents` | ✅ | Create a document in a workspace |
| `DELETE` | `/api/documents/:documentId` | ✅ | Delete a document (owner only) |
| `PUT` | `/api/documents/:documentId/save` | ✅ | Manually save document content (owner only) |
| `POST` | `/api/documents/:documentId/save-to-dashboard` | ✅ | Copy a shared document to the user's own workspace |
| `GET` | `/api/documents/:documentId/owner` | ✅ | Get the owner ID of a document's workspace |

---

## 🔄 Socket.IO Events

### Client → Server
| Event | Payload | Description |
|---|---|---|
| `join-document` | `(documentId, userName)` | Join a document room and load its content |
| `send-changes` | `(documentId, content)` | Broadcast content changes to other users in the room |

### Server → Client
| Event | Payload | Description |
|---|---|---|
| `load-document` | `content` | Initial document content sent on join |
| `receive-changes` | `content` | Live content update from another user |
| `active-users-updated` | `string[]` | Updated list of active users in the document |
| `error` | `message` | Error message (e.g. document not found) |

---

## 🗄️ Database Schema

```prisma
model User {
  id         String      @id @default(uuid())
  email      String      @unique
  password   String
  name       String
  workspaces Workspace[]
}

model Workspace {
  id        String     @id @default(uuid())
  name      String
  ownerId   String
  owner     User       @relation(fields: [ownerId], references: [id])
  documents Document[]
}

model Document {
  id          String    @id @default(uuid())
  title       String    @default("Untitled Document")
  content     String    @default("")
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
}
```

---

## 🚀 How Real-time Collaboration Works

```
User A (Server 1)          Redis Pub/Sub          User B (Server 2)
──────────────────         ─────────────          ──────────────────
Types in editor
      │
socket.emit("send-changes")
      │
      └──► pubClient.publish() ──────────────────► subClient receives
                                                         │
                                                   io.to(room).emit("receive-changes")
                                                         │
                                                   User B editor updates ✓
```

Redis makes this work even when users are connected to **different server instances** — essential for production deployments with load balancing.

---

## 📝 License

MIT — feel free to use, modify, and distribute.
