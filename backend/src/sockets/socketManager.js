const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const setupSockets = (io) => {
  io.use((socket, next) => {
    let token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token ||
      (socket.handshake.headers?.authorization &&
        socket.handshake.headers.authorization.split(" ")[1]);
    if (!token) {
      return next(new Error("Authentication Error: Token Missing"));
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error("Authentication Error: Invalid Token"));
      }
      socket.user = decoded;
      next();
    });
  });

  handleConnections(io);
};

const handleConnections = (io) => {
  io.on("connection", (socket) => {
    socket.on("join-document", async (documentId, clientName) => {
      try {
        const document = await prisma.document.findUnique({
          where: { id: documentId },
        });

        if (!document) {
          return socket.emit("error", "Document not found");
        }
        socket.join(documentId);
        socket.emit("load-document", document.content);
        socket.data.documentId = documentId;
        socket.data.name = clientName || socket.user?.name || "Unknown User";
        const sockets = await io.in(documentId).fetchSockets();
        const activeUserNames = sockets.map((s) => s.data.name);

        io.to(documentId).emit("active-users-updated", activeUserNames);
      } catch (error) {
        socket.emit("error", "Internal server error while joining room");
      }
    });

    socket.on("send-changes", async (documentId, content) => {
      socket.to(documentId).emit("receive-changes", content);

      try {
        await prisma.document.update({
          where: { id: documentId },
          data: { content },
        });
      } catch (error) {
        console.error("Failed to save document:", error);
      }
    });

    socket.on("disconnect", async () => {
      if (socket.data.documentId) {
        const docId = socket.data.documentId;

        const sockets = await io.in(docId).fetchSockets();
        const activeUserNames = sockets.map((s) => s.data.name);

        io.to(docId).emit("active-users-updated", activeUserNames);
      }
    });
  });
};

module.exports = setupSockets;
