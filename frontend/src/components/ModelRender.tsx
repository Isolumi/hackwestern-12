import { Suspense, useEffect } from 'react';
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

interface CameraControllerProps {
    movementVector: [number, number, number, number];
}

function CameraController({ movementVector }: CameraControllerProps) {
    const { camera } = useThree();
    const MOVEMENT_SPEED = 0.1;
    const ROTATION_SPEED = 0.03;

    useEffect(() => {
        camera.position.set(0, 0, 0);
        camera.rotation.set(0, 0, 0);
    }, [camera]);

    useFrame(() => {
        const [x, y, z, t] = movementVector;

        // Relative movement (local space)
        // x=1 means Left, so we move negative on local X (Right is positive)
        camera.translateX(-x * MOVEMENT_SPEED);
        camera.translateZ(-y * MOVEMENT_SPEED);

        // Rotation (y-axis only)
        // -1 is left (positive rotation), 1 is right (negative rotation)
        camera.rotation.y += t * ROTATION_SPEED;
        camera.rotation.x = 0;
        camera.rotation.z = 0;
    });

    return null;
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
    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <Canvas
                gl={{ alpha: true }}
                camera={{ far: 100000, position: [0, 5, 5] }}
            >
                <Suspense fallback={null}>
                    <CameraController movementVector={movementVector} />
                    <ambientLight intensity={0.3} />
                    <directionalLight position={[500, 500, 500]} intensity={2} castShadow />
                    {models.map((model, index) => (
                        <Model key={index} filepath={model.filepath} position={model.position} />
                    ))}
                </Suspense>
            </Canvas>
        </div>
    );
}