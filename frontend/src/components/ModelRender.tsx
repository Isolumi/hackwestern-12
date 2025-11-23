import { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import * as THREE from 'three';

export interface ModelData {
    filepath: string;
    position: [number, number, number];
}

interface ModelProps {
    filepath: string;
    position?: [number, number, number];
}

function Model({ filepath, position = [0, 0, 0] }: ModelProps) {
    const geometry = useLoader(PLYLoader, filepath) as THREE.BufferGeometry;

    const hasColors = geometry.hasAttribute('color');

    const isPointCloud = !geometry.index;

    // For meshes, compute normals if they don't exist (needed for lighting)
    if (!isPointCloud && !geometry.hasAttribute('normal')) {
        geometry.computeVertexNormals();
    }

    if (isPointCloud) {
        return (
            <points geometry={geometry} position={position}>
                <pointsMaterial
                    size={0.01}
                    color={hasColors ? undefined : 0xffffff}
                    vertexColors={hasColors}
                />
            </points>
        );
    } else {
        return (
            <mesh geometry={geometry} position={position}>
                <meshStandardMaterial
                    color={hasColors ? undefined : 0xffffff}
                    vertexColors={hasColors}
                    flatShading={false}
                />
            </mesh>
        );
    }
}

interface SceneControllerProps {
    movementVector: [number, number, number, number];
    pose: string;
    grab: [number, number, number, number];
    onModeChange: (mode: string) => void;
}

function SceneController({ movementVector, pose, grab, onModeChange }: SceneControllerProps) {
    const { camera } = useThree();
    const [mode, setMode] = useState<'CAMERA' | 'OBJECT'>('CAMERA');
    const canToggle = useRef(true);
    const sphereRef = useRef<THREE.Mesh>(null);

    useEffect(() => {
        onModeChange(mode);
    }, [mode, onModeChange]);

    const MOVEMENT_SPEED = 3;
    const ROTATION_SPEED = 0.03;

    useEffect(() => {
        camera.position.set(0, 0, 0);
        camera.rotation.set(0, 0, 0);
    }, [camera]);

    useFrame(() => {
        // Mode Switching Logic
        if (pose === "O") {
            if (canToggle.current) {
                setMode(prev => prev === 'CAMERA' ? 'OBJECT' : 'CAMERA');
                canToggle.current = false;
            }
        } else if (pose === "-") {
            canToggle.current = true;
        }

        if (mode === 'CAMERA') {
            const [x, y, z, t] = movementVector;

            camera.translateX(-x * MOVEMENT_SPEED);
            camera.translateZ(-y * MOVEMENT_SPEED);
            camera.rotation.y += t * ROTATION_SPEED;
            camera.rotation.x = 0;
            camera.rotation.z = 0;
        } else {
            // Object Logic
            if (sphereRef.current) {
                const [gx, gy, gz] = grab;
                // Position relative to camera (local space)
                const offset = new THREE.Vector3((-1.5)*gx+1, (-1.5)*gy+0.5, (1.5)*gz);
                offset.applyEuler(camera.rotation);
                sphereRef.current.position.copy(camera.position).add(offset);
            }
        }
    });

    return (
        <>
            {mode === 'OBJECT' && (
                <mesh ref={sphereRef}>
                    <sphereGeometry args={[0.1, 32, 32]} />
                    <meshStandardMaterial color="red" />
                </mesh>
            )}
        </>
    );
}

interface ModelRenderProps {
    movementVector?: [number, number, number, number];
    models?: ModelData[];
    pose?: string;
    grab?: [number, number, number, number];
}

export default function ModelRender({ 
        movementVector = [0, 0, 0, 0],
        models = [{ filepath: '/model.ply', position: [0, 0, 0] }],
        pose = "-",
        grab = [0, 0, 0, 0] }: ModelRenderProps) {
    const [debugMode, setDebugMode] = useState("CAMERA");

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <Canvas
                gl={{ alpha: true }}
                camera={{ far: 100000, position: [0, 5, 5] }}
            >
                <Suspense fallback={null}>
                    <SceneController movementVector={movementVector} pose={pose} grab={grab} onModeChange={setDebugMode} />
                    <ambientLight intensity={0.3} />
                    <directionalLight position={[500, 500, 500]} intensity={2} castShadow />
                    {models.map((model, index) => (
                        <Model key={index} filepath={model.filepath} position={model.position} />
                    ))}
                </Suspense>
            </Canvas>
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold',
                pointerEvents: 'none',
                textShadow: '1px 1px 2px black',
                zIndex: 100
            }}>
                MODE: {debugMode}
            </div>
        </div>
    );
}