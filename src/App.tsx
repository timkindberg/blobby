import { useState } from "react";
import { HostView } from "./views/HostView";
import { PlayerView } from "./views/PlayerView";
import { BlobGallery } from "./components/BlobGallery";

type Mode = "select" | "host" | "player" | "blobs";

export function App() {
  const [mode, setMode] = useState<Mode>("select");

  if (mode === "host") {
    return <HostView onBack={() => setMode("select")} />;
  }

  if (mode === "player") {
    return <PlayerView onBack={() => setMode("select")} />;
  }

  if (mode === "blobs") {
    return (
      <div>
        <button onClick={() => setMode("select")} style={{ margin: 20 }}>← Back</button>
        <BlobGallery />
      </div>
    );
  }

  return (
    <div className="app">
      <h1>Survyay!</h1>
      <p>A fun real-time survey tool</p>
      <div className="mode-select">
        <button onClick={() => setMode("host")}>Host a Session</button>
        <button onClick={() => setMode("player")}>Join as Player</button>
        <button onClick={() => setMode("blobs")} style={{ background: "#10b981" }}>
          🧪 Blob Gallery
        </button>
      </div>
    </div>
  );
}
