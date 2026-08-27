import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { API_URL, SOCKET_URL } from "../config";

export default function Editor() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [content, setContent] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("workspace_token");
    if (!token) return navigate("/login");

    let myname = "Guest_" + Math.floor(Math.random() * 1000);
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.name) myname = payload.name;
    } catch (e) {
      console.log("Could not Get name from Token");
    }

    const newSocket = io(SOCKET_URL, { query: { token } });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      newSocket.emit("join-document", documentId, myname);
    });

    newSocket.on("disconnect", () => setIsConnected(false));
    newSocket.on("load-document", (initial) => setContent(initial || ""));
    newSocket.on("receive-changes", (newContent) => setContent(newContent));

    newSocket.on("active-users-updated", (usersArray) => {
      setActiveUsers(usersArray);
    });

    return () => newSocket.disconnect();
  }, [documentId, navigate]);

  const handleChange = (value, delta, source) => {
    setContent(value);
    if (socket && source === "user") {
      socket.emit("send-changes", documentId, value);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this document? This cannot be undone.")) return;
    const token = localStorage.getItem("workspace_token");
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/documents/${documentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        navigate("/dashboard");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete document");
        setDeleting(false);
      }
    } catch (err) {
      alert("Network error while deleting");
      setDeleting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f9fafb",
      }}
    >
      <header
        style={{
          background: "white",
          padding: "16px 24px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              background: "transparent",
              border: "1px solid #d1d5db",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            ← Back
          </button>
          <h2 style={{ fontSize: "18px", color: "#111827", margin: 0 }}>
            Document Editor
          </h2>

          <div
            style={{
              background: "#eff6ff",
              color: "#1e40af",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
             {activeUsers.join(", ")}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <button
            onClick={handleShare}
            style={{
              background: copied ? "#10b981" : "#f3f4f6",
              color: copied ? "white" : "#374151",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "all 0.2s",
            }}
          >
            {copied ? "✓ Copied Link" : "🔗 Share"}
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              background: deleting ? "#9ca3af" : "#fee2e2",
              color: deleting ? "white" : "#dc2626",
              border: "1px solid #fca5a5",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: deleting ? "not-allowed" : "pointer",
              fontWeight: "600",
              transition: "all 0.2s",
            }}
          >
            {deleting ? "Deleting…" : "🗑 Delete"}
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              fontWeight: "500",
              color: isConnected ? "#10b981" : "#ef4444",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: isConnected ? "#10b981" : "#ef4444",
              }}
            ></div>
            {isConnected ? "Live Sync Active" : "Disconnected"}
          </div>
        </div>
      </header>

      <div
        style={{
          flexGrow: 1,
          padding: "24px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1000px",
            background: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <ReactQuill
            theme="snow"
            value={content}
            onChange={handleChange}
            style={{ height: "calc(100vh - 180px)", border: "none" }}
          />
        </div>
      </div>
    </div>
  );
}
