export default function EditorHeader({
  activeUsers,
  isOwner,
  isConnected,
  saving,
  saved,
  savingToDash,
  deleting,
  copied,
  onBack,
  onSave,
  onSaveToDashboard,
  onShare,
  onDelete,
}) {
  return (
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
          onClick={onBack}
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

        {activeUsers.length > 0 && (
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
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {isOwner && (
          <button
            onClick={onSave}
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
            }}
          >
            {saving ? "Saving…" : saved ? "✓ Saved!" : "💾 Save"}
          </button>
        )}

        {isOwner === false && (
          <button
            onClick={onSaveToDashboard}
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
          onClick={onShare}
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
          onClick={onDelete}
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
          />
          {isConnected ? "Live Sync Active" : "Disconnected"}
        </div>
      </div>
    </header>
  );
}
