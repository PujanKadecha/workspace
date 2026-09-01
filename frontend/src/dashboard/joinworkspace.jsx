export default function JoinWorkspace({ joinLink, setJoinLink, onJoin }) {
  return (
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
        onSubmit={onJoin}
        style={{ display: "flex", gap: "10px", flexGrow: 1, maxWidth: "500px" }}
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
  );
}
