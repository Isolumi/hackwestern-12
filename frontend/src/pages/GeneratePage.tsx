import { useState, useEffect, Suspense } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Center } from "@react-three/drei";
import { Model } from "../components/ModelRender";

export default function GeneratePage() {
  const [stage, setStage] = useState<"WORLD" | "OBJECT">("WORLD");
  const [files, setFiles] = useState<string[]>([]);
  const [selectedWorld, setSelectedWorld] = useState<string | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<Array<{ file: string; position: [number, number, number]; id: number }>>([]);
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

    // Pass just filenames for now to match previous structure, or update /world to handle positions
    const objectFilenames = selectedObjects.map(obj => obj.file);
    navigate("/world", { state: { backgroundColor, currentPrompt, selectedWorld, selectedObjects: objectFilenames } });
  };

  const handleReset = () => {
    setStage("WORLD");
    setSelectedWorld(null);
    setSelectedObjects([]);
    setCurrentPrompt("");
  };

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const handleWorldClick = (file: string) => setSelectedWorld(file);
  
  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, file: string) => {
    e.dataTransfer.setData("application/x-model-file", file);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (stage !== "OBJECT") return;

    const file = e.dataTransfer.getData("application/x-model-file");
    if (file) {
      // For now, just adding at center. 
      // Future improvement: Use raycasting to place where mouse is.
      const newObject = {
        file,
        position: [Math.random() * 2 - 1, Math.random() * 2 - 1, 0] as [number, number, number], // Randomize slightly to see multiple
        id: Date.now()
      };
      setSelectedObjects(prev => [...prev, newObject]);
    }
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
        .sidebar-item { background-color:#3a3a3a; padding:0.75rem 1rem; border-radius:8px; color:#e5e5e5; font-size:0.875rem; cursor:pointer; transition:background-color 0.2s ease; margin-bottom:0.5rem; user-select: none; }
        .sidebar-item:hover { background-color:#4a4a4a; }
        .sidebar-item.selected { background-color:#5FE3F0; color:black; }
        .sidebar-item.draggable { cursor: grab; }
        .sidebar-item.draggable:active { cursor: grabbing; }
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
                {stage === "WORLD" ? "Select World" : "Drag Objects"}
              </h2>
              {files.length === 0 && <div style={{ color: "#777" }}>No files found</div>}
              {files.map((file) => (
                <div
                  key={file}
                  draggable={stage === "OBJECT"}
                  onDragStart={(e) => handleDragStart(e, file)}
                  className={`sidebar-item ${stage === "WORLD"
                      ? selectedWorld === file ? "selected" : ""
                      : "draggable"
                    }`}
                  onClick={() => {
                    if (stage === "WORLD") handleWorldClick(file);
                  }}
                >
                  {file}
                </div>
              ))}
              {stage === "OBJECT" && (
                <div style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#aaa" }}>
                  Drag and drop objects into the scene.
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="controls-section">
              <button className="control-button primary" onClick={handleSave}>
                {stage === "WORLD" ? "Next: Add Objects" : "Enter World!"}
              </button>
              <button className="control-button secondary" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>

          <div 
            className={`canvas-container ${isFullscreen ? "fullscreen" : ""}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* RENDER CANVAS FOR BOTH STAGES IF WORLD IS SELECTED */}
            {selectedWorld ? (
              <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <Suspense fallback={null}>
                  {/* Only show world model if in WORLD stage */}
                  {stage === "WORLD" && (
                    <Center>
                      <Model filepath={`/worlds/${selectedWorld}`} />
                    </Center>
                  )}
                  
                  {/* RENDER DROPPED OBJECTS */}
                  {stage === "OBJECT" && selectedObjects.map((obj) => (
                    <group key={obj.id} position={obj.position}>
                       {/* Using a smaller scale for objects relative to world, can be adjusted */}
                       <Model filepath={`/objects/${obj.file}`} scale={0.5} />
                    </group>
                  ))}
                </Suspense>
                <OrbitControls enableZoom={stage === "OBJECT"} enablePan={stage === "OBJECT"} />
              </Canvas>
            ) : (
              <div style={{ color: "#777", display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                No world selected
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
