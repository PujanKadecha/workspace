import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { API_URL, SOCKET_URL } from "../config";

const MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["link", "image"],
    ["clean"],
  ],
};

const FORMATS = [
  "header",
  "bold", "italic", "underline", "strike", "blockquote",
  "list", "bullet", "indent",
  "color", "background",
  "align",
  "link", "image",
];

export default function Editor() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [content, setContent] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingToDash, setSavingToDash] = useState(false);
  const [isOwner, setIsOwner] = useState(null); 
  const contentRef = useState(null); 

  useEffect(() => {
    const token = localStorage.getItem("workspace_token");
    if (!token) return navigate("/login");

    
    let myname = "Guest_" + Math.floor(Math.random() * 1000);
    let myId = null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.name) myname = payload.name;
      if (payload.id) myId = payload.id;
    } catch (e) {
      console.log("Could not Get name from Token");
    }

    
    fetch(`${API_URL}/api/documents/${documentId}/owner`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setIsOwner(myId && data.ownerId === myId);
      })
      .catch(() => setIsOwner(false));

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

  
  const handleSave = async () => {
    const token = localStorage.getItem("workspace_token");
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/documents/${documentId}/save`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save");
      }
    } catch {
      alert("Network error while saving");
    } finally {
      setSaving(false);
    }
  };

  
  const handleSaveToDashboard = async () => {
    const token = localStorage.getItem("workspace_token");
    setSavingToDash(true);
    try {
      const res = await fetch(
        `${API_URL}/api/documents/${documentId}/save-to-dashboard`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("✅ Document saved to your dashboard!");
      } else {
        alert(data.error || "Failed to save to dashboard");
      }
    } catch {
      alert("Network error");
    } finally {
      setSavingToDash(false);
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
            gap: "10px",
          }}
        >
          {/* Save button — owner only */}
          {isOwner && (
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: saved ? "#10b981" : saving ? "#d1fae5" : "#ecfdf5",
                color: saved ? "white" : "#059669",
                border: "1px solid #6ee7b7",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: saving ? "not-allowed" : "pointer",
                fontWeight: "600",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {saving ? "Saving…" : saved ? "✓ Saved!" : "💾 Save"}
            </button>
          )}

          {/* Save to Dashboard — shown to guests/shared users */}
          {isOwner === false && (
            <button
              onClick={handleSaveToDashboard}
              disabled={savingToDash}
              style={{
                background: savingToDash ? "#dbeafe" : "#eff6ff",
                color: "#1d4ed8",
                border: "1px solid #93c5fd",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: savingToDash ? "not-allowed" : "pointer",
                fontWeight: "600",
                transition: "all 0.2s",
              }}
            >
              {savingToDash ? "Saving…" : "📥 Save to My Dashboard"}
            </button>
          )}

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
            modules={MODULES}
            formats={FORMATS}
            style={{ height: "calc(100vh - 180px)", border: "none" }}
          />
        </div>
      </div>
    </div>
  );
}
