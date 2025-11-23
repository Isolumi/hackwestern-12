import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function GeneratePage() {
  const [stage, setStage] = useState<"WORLD" | "OBJECT">("WORLD");
  const [files, setFiles] = useState<string[]>([]);
  const [selectedWorld, setSelectedWorld] = useState<string | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const backgroundColor =
    location.state?.backgroundColor ||
    "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)";

  const initialPromptFromNav = location.state?.prompt || "";
  useEffect(() => {
    setCurrentPrompt(initialPromptFromNav);
  }, [initialPromptFromNav]);

  // Load files for current stage
  useEffect(() => {
    if (stage === "WORLD") {
      setFiles(["Myhal.ply"]);
    } else {
      setFiles(["HackWesternHorse.ply", "UofTHacksMoose.ply"]);
    }
  }, [stage]);

  const handleSave = () => {
    if (stage === "WORLD") {
      if (!selectedWorld) {
        alert("Please select a world before continuing.");
        return;
      }
      setStage("OBJECT");
      return;
    }

    console.log("Prompt:", currentPrompt);
    console.log("Selected world:", selectedWorld);
    console.log("Selected objects:", selectedObjects);

    navigate("/world", { state: { backgroundColor, currentPrompt } });
  };

  const handleReset = () => {
    setStage("WORLD");
    setSelectedWorld(null);
    setSelectedObjects([]);
    setCurrentPrompt("");
  };

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const handleWorldClick = (file: string) => setSelectedWorld(file);
  const handleObjectClick = (file: string) => {
    setSelectedObjects((prev) =>
      prev.includes(file)
        ? prev.filter((f) => f !== file)
        : [...prev, file]
    );
  };

  return (
    <>
      <style>{`
        .viewer-container { min-height:100vh; display:flex; flex-direction:column; }
        .viewer-content { flex:1; display:flex; padding:2rem; gap:2rem; }
        .canvas-container { flex:1; background-color:#2a2a2a; border-radius:12px; overflow:hidden; position:relative; min-height:600px; transition:all 0.3s ease; color:#e5e5e5; padding:1rem; }
        .canvas-container.fullscreen { position:fixed; top:0; left:0; right:0; bottom:0; width:100vw; height:100vh; z-index:1000; border-radius:0; }
        .sidebar { width:300px; background-color:#2a2a2a; border-radius:12px; padding:1.5rem; display:flex; flex-direction:column; gap:1.5rem; }
        .sidebar-title { font-size:1.125rem; font-weight:600; color:#86F5FF; margin:0; }
        .sidebar-item { background-color:#3a3a3a; padding:0.75rem 1rem; border-radius:8px; color:#e5e5e5; font-size:0.875rem; cursor:pointer; transition:background-color 0.2s ease; margin-bottom:0.5rem; }
        .sidebar-item:hover { background-color:#4a4a4a; }
        .sidebar-item.selected { background-color:#5FE3F0; color:black; }
        .controls-section { margin-top:auto; display:flex; flex-direction:column; gap:0.75rem; padding-bottom:1.5rem; }
        .control-button { padding:0.75rem 1rem; border-radius:8px; border:none; font-size:0.875rem; font-weight:500; cursor:pointer; transition:all 0.2s ease; }
        .control-button.primary { background-color:#86F5FF; color:black; }
        .control-button.primary:hover { background-color:#5FE3F0; }
        .control-button.secondary { background-color:#3a3a3a; color:#e5e5e5; }
        .control-button.secondary:hover { background-color:#4a4a4a; }
      `}</style>

      <div className="viewer-container" style={{ background: backgroundColor }}>
        <div className="viewer-content">
          <div className="sidebar">
            {/* File List */}
            <div className="sidebar-section">
              <h2 className="sidebar-title" style={{ marginBottom: "0.5rem" }}>
                {stage === "WORLD" ? "Select World" : "Select Objects"}
              </h2>
              {files.length === 0 && <div style={{ color: "#777" }}>No files found</div>}
              {files.map((file) => (
                <div
                  key={file}
                  className={`sidebar-item ${stage === "WORLD"
                      ? selectedWorld === file
                        ? "selected"
                        : ""
                      : selectedObjects.includes(file)
                        ? "selected"
                        : ""
                    }`}
                  onClick={() =>
                    stage === "WORLD" ? handleWorldClick(file) : handleObjectClick(file)
                  }
                >
                  {file}
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="controls-section">
              <button className="control-button primary" onClick={handleSave}>
                {stage === "WORLD" ? "Select Objects" : "Enter World!"}
              </button>
              <button className="control-button secondary" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>

          <div className={`canvas-container ${isFullscreen ? "fullscreen" : ""}`}>
            {selectedWorld ? (
              <>
                <div><strong>World:</strong> {selectedWorld}</div>
                {selectedObjects.length > 0 && (
                  <div style={{ marginTop: "1rem" }}>
                    <strong>Objects:</strong> {selectedObjects.join(", ")}
                  </div>
                )}
              </>
            ) : (
              <div style={{ color: "#777" }}>No world selected</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
