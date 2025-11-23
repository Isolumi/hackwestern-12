import { useState } from "react";
import ModelRender from "../components/ModelRender";
import PoseDetector from "../components/PoseDetector";

export default function ModelPage() {
    const [movementVector, setMovementVector] = useState<[number, number, number, number]>([0, 0, 0, 0]);
    const [pose, setPose] = useState<string>("-");
    const [grab, setGrab] = useState<number[]>([0, 0, 0, 0]);

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
            <ModelRender movementVector={movementVector} models={[
                { filepath: '/model.ply', position: [0, 0, 0] }
            ]} />
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
