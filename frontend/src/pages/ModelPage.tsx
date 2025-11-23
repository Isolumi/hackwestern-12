import { useState } from "react";
import ModelRender, { type ModelData } from "../components/ModelRender";
import PoseDetector from "../components/PoseDetector";

export default function ModelPage() {
    const [movementVector, setMovementVector] = useState<[number, number, number, number]>([0, 0, 0, 0]);
    const [pose, setPose] = useState<string>("-");
    const [grab, setGrab] = useState<number[]>([0, 0, 0, 0]);

    const [models, setModels] = useState<ModelData[]>([
        { filepath: '/HackWesternHorseNewNew.ply', position: [0, 0, 0], isEnvironment: true },
        { filepath: '/splat.ply', position: [1, 0, 0], scale: 1 },
        { filepath: '/moose.ply', position: [-1, 0, 0], scale: 1 },
    ]);

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
            <ModelRender 
                movementVector={movementVector} 
                models={models}
                pose={pose}
                grab={grab as [number, number, number, number]}
            />
            <div style={{ 
                position: 'absolute', 
                bottom: 20, 
                right: 20, 
                width: '320px', 
                height: '240px', 
                border: '2px solid white', 
                borderRadius: '8px', 
                overflow: 'hidden',
                zIndex: 10 
            }}>
                <PoseDetector onMovementChange={setMovementVector} onPoseChange={setPose} onGrabChange={setGrab}/>
            </div>
        </div>
    );
}
