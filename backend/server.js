require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");

const { register, login } = require("./src/controllers/auth.controllers");
const { authenticationToken } = require("./src/middlewares/auth.middleware");
const {
  createWorkspace,
  getUserWorkspace,
  deleteDocument,
  deleteWorkspace,
  createDocument,
} = require("./src/controllers/workspace.controller");
const setupSockets = require("./src/sockets/socketManager");
const PORT = process.env.PORT || 5050;

const app = express();
const server = http.createServer(app);
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
}));
app.use(express.json());

//----------SocketIO------------
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
//--------------------------

//-----------Redis----------
const redisUrl = process.env.REDIS_URL;
const pubClient = createClient({ url: redisUrl });
const subClient = pubClient.duplicate();

pubClient.on("error", (err) => console.log("Redis Pub Error", err));
subClient.on("error", (err) => console.log("Redis Sub Error", err));
//--------------------------

//-------------Routes---------------
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);
app.post("/api/workspaces", authenticationToken, createWorkspace);
app.get("/api/workspaces", authenticationToken, getUserWorkspace);
app.get("/api/protected", authenticationToken, (req, res) => {
  res.json({ message: `Access Granted For ID : ${req.user.id}` });
});
app.delete("/api/documents/:documentId", authenticationToken, deleteDocument);
app.delete("/api/workspaces/:workspaceId", authenticationToken, deleteWorkspace);
app.post("/api/workspaces/:workspaceId/documents", authenticationToken, createDocument);
//-------------------------------------

//----------Server---------------------

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


Promise.all([pubClient.connect(), subClient.connect()])
  .then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    console.log("Redis Adapter connected successfully");
    setupSockets(io);
  })
  .catch((err) => {
    console.error("Redis connection failed — real-time collab disabled:", err.message);
    
    setupSockets(io);
  });

//-------------------------------------
