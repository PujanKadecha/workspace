import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { API_URL, SOCKET_URL } from "../config";
import { MODULES, FORMATS } from "../config/editor.config.js";
import EditorHeader from "../headers/editor.header.jsx";

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
        },
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
    if (!window.confirm("Delete this document?")) return;
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
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.log("Failed to copy URL", err);
    }
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
      <EditorHeader
        activeUsers={activeUsers}
        isOwner={isOwner}
        isConnected={isConnected}
        saving={saving}
        saved={saved}
        savingToDash={savingToDash}
        deleting={deleting}
        copied={copied}
        onBack={() => navigate("/dashboard")}
        onSave={handleSave}
        onSaveToDashboard={handleSaveToDashboard}
        onShare={handleShare}
        onDelete={handleDelete}
      />

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
