import { Link } from "react-router-dom";

export default function WorkspaceCard({
  workspace,
  isAddingDoc,
  newDocTitle,
  setNewDocTitle,
  onStartAddDoc,
  onCancelAddDoc,
  onAddDocument,
  onDeleteWorkspace,
}) {
  return (
    <div
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
          📁 {workspace.name}
        </h3>
        <button
          onClick={() => onDeleteWorkspace(workspace.id, workspace.name)}
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

      {/* Document List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {workspace.documents?.map((doc) => (
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

      {/* Add Document Inline Form */}
      {isAddingDoc ? (
        <form
          onSubmit={(e) => onAddDocument(e, workspace.id)}
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
            onClick={onCancelAddDoc}
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
          onClick={onStartAddDoc}
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
  );
}
