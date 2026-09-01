import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../config";

export default function Dashboard() {
  const [workspaces, setWorkspaces] = useState([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [joinLink, setJoinLink] = useState("");

  const [addingDocTo, setAddingDocTo] = useState(null);
  const [newDocTitle, setNewDocTitle] = useState("");
  const navigate = useNavigate();

  const token = () => localStorage.getItem("workspace_token");

  const fetchWorkspaces = async () => {
    if (!token()) return navigate("/login");
    try {
      const res = await fetch(`${API_URL}/api/workspaces`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) setWorkspaces(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    await fetch(`${API_URL}/api/workspaces`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`,
      },
      body: JSON.stringify({ name: newWorkspaceName }),
    });
    setNewWorkspaceName("");
    fetchWorkspaces();
  };

  const handleDeleteWorkspace = async (workspaceId, workspaceName) => {
    if (
      !window.confirm(
        `Delete workspace "${workspaceName}" and ALL its documents? `,
      )
    )
      return;
    const res = await fetch(`${API_URL}/api/workspaces/${workspaceId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (res.ok) {
      fetchWorkspaces();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to delete workspace");
    }
  };

  const handleAddDocument = async (e, workspaceId) => {
    e.preventDefault();
    const res = await fetch(
      `${API_URL}/api/workspaces/${workspaceId}/documents`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ title: newDocTitle }),
      },
    );
    if (res.ok) {
      setAddingDocTo(null);
      setNewDocTitle("");
      fetchWorkspaces();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to create document");
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!joinLink.trim()) return;
    const documentId = joinLink.split("/").pop();
    navigate(`/document/${documentId}`);
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px",
        }}
      >
        <h1 style={{ fontSize: "28px", color: "#111827" }}>My Workspaces</h1>
        <button
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          className="btn-danger"
        >
          Logout
        </button>
      </header>

      <div
        style={{
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div>
          <h3 style={{ margin: 0, color: "#1e3a8a", fontSize: "16px" }}>
            Got an invite link?
          </h3>
          <p style={{ margin: "4px 0 0", color: "#3b82f6", fontSize: "14px" }}>
            Paste it here to join a collaborative document.
          </p>
        </div>
        <form
          onSubmit={handleJoin}
          style={{
            display: "flex",
            gap: "10px",
            flexGrow: 1,
            maxWidth: "500px",
          }}
        >
          <input
            type="text"
            placeholder="Paste link or Document ID..."
            value={joinLink}
            onChange={(e) => setJoinLink(e.target.value)}
            style={{ flexGrow: 1 }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ background: "#2563eb" }}
          >
            Join
          </button>
        </form>
      </div>

      <form
        onSubmit={handleCreate}
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "40px",
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <input
          type="text"
          placeholder="New workspace name..."
          value={newWorkspaceName}
          onChange={(e) => setNewWorkspaceName(e.target.value)}
        />
        <button
          type="submit"
          className="btn-primary"
          style={{ whiteSpace: "nowrap" }}
        >
          + Create Workspace
        </button>
      </form>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        {workspaces.map((ws) => (
          <div
            key={ws.id}
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ fontSize: "18px", margin: 0, color: "#374151" }}>
                📁 {ws.name}
              </h3>
              <button
                onClick={() => handleDeleteWorkspace(ws.id, ws.name)}
                title="Delete workspace"
                style={{
                  background: "#fee2e2",
                  color: "#dc2626",
                  border: "1px solid #fca5a5",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                  transition: "all 0.2s",
                }}
              >
                🗑 Delete
              </button>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {ws.documents?.map((doc) => (
                <Link
                  key={doc.id}
                  to={`/document/${doc.id}`}
                  style={{
                    display: "block",
                    padding: "10px 12px",
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    textDecoration: "none",
                    color: "#2563eb",
                    fontWeight: "500",
                    fontSize: "14px",
                    transition: "border-color 0.2s",
                  }}
                >
                  📄 {doc.title || "Untitled Document"}
                </Link>
              ))}
            </div>

            {addingDocTo === ws.id ? (
              <form
                onSubmit={(e) => handleAddDocument(e, ws.id)}
                style={{ display: "flex", gap: "8px", marginTop: "4px" }}
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="Document title..."
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  style={{
                    flexGrow: 1,
                    padding: "7px 10px",
                    fontSize: "13px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    padding: "7px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddingDocTo(null);
                    setNewDocTitle("");
                  }}
                  style={{
                    background: "#f3f4f6",
                    color: "#374151",
                    border: "1px solid #d1d5db",
                    padding: "7px 10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  ✕
                </button>
              </form>
            ) : (
              <button
                onClick={() => {
                  setAddingDocTo(ws.id);
                  setNewDocTitle("");
                }}
                style={{
                  background: "transparent",
                  color: "#6b7280",
                  border: "1px dashed #d1d5db",
                  padding: "8px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                  textAlign: "center",
                  transition: "all 0.2s",
                }}
              >
                + Add Document
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
