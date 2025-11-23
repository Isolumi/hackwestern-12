import { Suspense, useEffect, useState, useRef, forwardRef } from 'react';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import * as THREE from 'three';

const CONFIG = {
    MODEL: {
        POINT_SIZE: 0.01,
        DEFAULT_COLOR: 0xffffff,
    },
    CONTROLS: {
        MOVEMENT_SPEED: 0.05,
        ROTATION_SPEED: 0.03,
        GRAB_THRESHOLD: 10.0,
    },
    SPHERE: {
        X_SCALE: -1.5,
        X_OFFSET: 1,
        Y_SCALE: -1.5,
        Y_OFFSET: 0.5,
        Z_SCALE: 1.5,
    },
    CAMERA: {
        INITIAL_POSITION: [0, 0, 0] as [number, number, number],
    }
};

export interface ModelData {
    filepath: string;
    position: [number, number, number];
    isEnvironment?: boolean;
}

interface ModelProps {
    filepath: string;
    position?: [number, number, number];
}

const Model = forwardRef<THREE.Object3D, ModelProps>(({ filepath, position = [0, 0, 0] }, ref) => {
    const geometry = useLoader(PLYLoader, filepath) as THREE.BufferGeometry;

    const hasColors = geometry.hasAttribute('color');

    const isPointCloud = !geometry.index;

    // For meshes, compute normals if they don't exist (needed for lighting)
    if (!isPointCloud && !geometry.hasAttribute('normal')) {
        geometry.computeVertexNormals();
    }
    
    if (isPointCloud) {
        return (
            <points geometry={geometry} position={position} ref={ref as any}>
                <pointsMaterial
                    size={CONFIG.MODEL.POINT_SIZE}
                    color={hasColors ? undefined : CONFIG.MODEL.DEFAULT_COLOR}
                    vertexColors={hasColors}
                />
            </points>
        );
    } else {
        return (
            <mesh geometry={geometry} position={position} ref={ref as any}>
                <meshStandardMaterial
                    color={hasColors ? undefined : CONFIG.MODEL.DEFAULT_COLOR}
                    vertexColors={hasColors}
                    flatShading={false}
                />
            </mesh>
        );
    }
});

interface SceneControllerProps {
    movementVector: [number, number, number, number];
    pose: string;
    grab: [number, number, number, number];
    onModeChange: (mode: string) => void;
    onDebugInfo: (info: string) => void;
    modelRefs: React.MutableRefObject<(THREE.Object3D | null)[]>;
    models: ModelData[];
}

function SceneController({ movementVector, pose, grab, onModeChange, onDebugInfo, modelRefs, models }: SceneControllerProps) {
    const { camera } = useThree();
    const [mode, setMode] = useState<'CAMERA' | 'OBJECT'>('CAMERA');
    const canToggle = useRef(true);
    const sphereRef = useRef<THREE.Mesh>(null);

    useEffect(() => {
        onModeChange(mode);
    }, [mode, onModeChange]);

    useEffect(() => {
        onModeChange(mode);
    }, [mode, onModeChange]);

    useEffect(() => {
        camera.position.set(...CONFIG.CAMERA.INITIAL_POSITION);
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

            camera.translateX(-x * CONFIG.CONTROLS.MOVEMENT_SPEED);
            camera.translateZ(-y * CONFIG.CONTROLS.MOVEMENT_SPEED);
            camera.rotation.y += t * CONFIG.CONTROLS.ROTATION_SPEED;
            camera.rotation.x = 0;
            camera.rotation.z = 0;
        } else {
            // Object Logic
            if (sphereRef.current) {
                const [gx, gy, gz] = grab;
                // Position relative to camera (local space)
                const offset = new THREE.Vector3(
                    CONFIG.SPHERE.X_SCALE * gx + CONFIG.SPHERE.X_OFFSET,
                    CONFIG.SPHERE.Y_SCALE * gy + CONFIG.SPHERE.Y_OFFSET,
                    CONFIG.SPHERE.Z_SCALE * gz
                );
                offset.applyEuler(camera.rotation);
                sphereRef.current.position.copy(camera.position).add(offset);

                // Grabbing Logic
                if (grab[3] === 1) {
                    let closestModel: THREE.Object3D | null = null;
                    let minDistance = Infinity;

                    modelRefs.current.forEach((model, index) => {
                        if (model && !models[index]?.isEnvironment) {
                            const distance = model.position.distanceTo(sphereRef.current!.position);
                            if (distance < minDistance) {
                                minDistance = distance;
                                closestModel = model;
                            }
                        }
                    });

                    if (closestModel && minDistance < CONFIG.CONTROLS.GRAB_THRESHOLD) {
                        (closestModel as THREE.Object3D).position.copy(sphereRef.current.position);
                    }
                    
                    onDebugInfo(`Grab: ${grab[3]}, Dist: ${minDistance.toFixed(2)}, Models: ${modelRefs.current.length}`);
                } else {
                     onDebugInfo(`Grab: ${grab[3]} (No Stick)`);
                }
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
    const [debugInfo, setDebugInfo] = useState("");
    const modelRefs = useRef<(THREE.Object3D | null)[]>([]);

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <Canvas
                gl={{ alpha: true }}
                camera={{ far: 100000, position: [0, 5, 5] }}
            >
                <Suspense fallback={null}>
                    <SceneController movementVector={movementVector} pose={pose} grab={grab} onModeChange={setDebugMode} onDebugInfo={setDebugInfo} modelRefs={modelRefs} models={models} />
                    <ambientLight intensity={0.3} />
                    <directionalLight position={[500, 500, 500]} intensity={2} castShadow />
                    {models.map((model, index) => (
                        <Model 
                            key={index} 
                            filepath={model.filepath} 
                            position={model.position} 
                            ref={(el) => { modelRefs.current[index] = el; }}
                        />
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
                MODE: {debugMode} <br/>
                {debugInfo}
            </div>
        </div>
    );
}