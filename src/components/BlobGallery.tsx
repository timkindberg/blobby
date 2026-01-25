import { useState } from "react";
import { Blob } from "./Blob";
import { generateBlob } from "../lib/blobGenerator";
import type { BlobConfig } from "../lib/blobGenerator";

const SAMPLE_NAMES = [
  "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank",
  "Grace", "Henry", "Ivy", "Jack", "Kate", "Leo",
  "Mia", "Noah", "Olivia", "Pete", "Quinn", "Rose",
];

type AnimState = "idle" | "climbing" | "falling" | "celebrating";

/**
 * Gallery to preview blob creatures with different names and animation states.
 */
export function BlobGallery() {
  const [animState, setAnimState] = useState<AnimState>("idle");
  const [customName, setCustomName] = useState("");
  const [customBlobs, setCustomBlobs] = useState<BlobConfig[]>([]);

  const sampleBlobs = SAMPLE_NAMES.map(generateBlob);

  function addCustomBlob() {
    if (customName.trim()) {
      setCustomBlobs([...customBlobs, generateBlob(customName.trim())]);
      setCustomName("");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Blob Gallery</h2>

      <div style={{ marginBottom: 20, display: "flex", gap: 8 }}>
        <label>Animation: </label>
        {(["idle", "climbing", "falling", "celebrating"] as const).map((state) => (
          <button
            key={state}
            onClick={() => setAnimState(state)}
            style={{
              background: animState === state ? "#4f46e5" : "#e0e7ff",
              color: animState === state ? "white" : "#3730a3",
            }}
          >
            {state}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 20, display: "flex", gap: 8 }}>
        <input
          type="text"
          placeholder="Enter a name..."
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustomBlob()}
          style={{ flex: 1, marginBottom: 0 }}
        />
        <button onClick={addCustomBlob}>Add Blob</button>
      </div>

      {customBlobs.length > 0 && (
        <>
          <h3>Your Blobs</h3>
          <div className="blob-gallery">
            {customBlobs.map((config) => (
              <div key={config.seed} className="blob-card">
                <Blob config={config} size={80} state={animState} />
                <span>{config.name}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <h3>Sample Blobs</h3>
      <div className="blob-gallery">
        {sampleBlobs.map((config) => (
          <div key={config.seed} className="blob-card">
            <Blob config={config} size={80} state={animState} />
            <span>{config.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
