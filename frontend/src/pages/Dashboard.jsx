import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import JoinWorkspace from "../dashboard/joinworkspace";
import WorkspaceCard from "../dashboard/workspaceCard";

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
        `Delete workspace "${workspaceName}" and ALL its documents?`,
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

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
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
        <button onClick={handleLogout} className="btn-danger">
          Logout
        </button>
      </header>

      <JoinWorkspace
        joinLink={joinLink}
        setJoinLink={setJoinLink}
        onJoin={handleJoin}
      />

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
          <WorkspaceCard
            key={ws.id}
            workspace={ws}
            isAddingDoc={addingDocTo === ws.id}
            newDocTitle={newDocTitle}
            setNewDocTitle={setNewDocTitle}
            onStartAddDoc={() => {
              setAddingDocTo(ws.id);
              setNewDocTitle("");
            }}
            onCancelAddDoc={() => {
              setAddingDocTo(null);
              setNewDocTitle("");
            }}
            onAddDocument={handleAddDocument}
            onDeleteWorkspace={handleDeleteWorkspace}
          />
        ))}
      </div>
    </div>
  );
}
