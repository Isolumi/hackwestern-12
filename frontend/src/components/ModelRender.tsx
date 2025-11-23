import { Suspense, useEffect } from 'react';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import * as THREE from 'three';

function Model() {
    const geometry = useLoader(PLYLoader, '/model.ply') as THREE.BufferGeometry;

    const hasColors = geometry.hasAttribute('color');

    const isPointCloud = !geometry.index;
    
    if (!isPointCloud && !geometry.hasAttribute('normal')) {
        geometry.computeVertexNormals();
    }

    if (isPointCloud) {
        return (
            <points geometry={geometry}>
                <pointsMaterial
                    size={0.01}
                    color={hasColors ? undefined : 0xffffff}
                    vertexColors={hasColors}
                />
            </points>
        );
    } else {
        return (
            <mesh geometry={geometry}>
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
    const MOVEMENT_SPEED = 5;
    const ROTATION_SPEED = 0.05;

    useEffect(() => {
        camera.position.set(0, 100, 0);
        camera.rotation.set(0, 0, 0);
    }, [camera]);

    useFrame(() => {
        const [x, y, z, t] = movementVector;

        // Global movement
        camera.position.x -= x * MOVEMENT_SPEED;
        camera.position.y += y * MOVEMENT_SPEED;
        camera.position.z += z * MOVEMENT_SPEED;

        // Rotation (y-axis only)
        // -1 is left (positive rotation), 1 is right (negative rotation)
        camera.rotation.y += t * ROTATION_SPEED;
        
        // Ensure no other rotation
        camera.rotation.x = 0;
        camera.rotation.z = 0;
    });

    return null;
}

interface ModelRenderProps {
    movementVector?: [number, number, number, number];
}

export default function ModelRender({ movementVector = [0, 0, 0, 0] }: ModelRenderProps) {
    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <Canvas
                gl={{ alpha: true }}
                camera={{ far: 100000, position: [0, 0, 0] }}
            >
                <Suspense fallback={null}>
                    <CameraController movementVector={movementVector} />
                    <ambientLight intensity={0.3} />
                    <directionalLight position={[500, 500, 500]} intensity={2} castShadow />
                    <Model />
                </Suspense>
            </Canvas>
        </div>
    );
}