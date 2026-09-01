require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");
const routes = require("./src/routes");
const setupSockets = require("./src/sockets/socketManager");
const PORT = process.env.PORT || 5050;

const app = express();
const server = http.createServer(app);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  }),
);
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
app.use("/api", routes);
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
    console.error(
      "Redis connection failed — real-time collab disabled:",
      err.message,
    );

    setupSockets(io);
  });

//-------------------------------------
