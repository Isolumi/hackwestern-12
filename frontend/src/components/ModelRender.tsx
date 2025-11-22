import { Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import * as THREE from 'three';

function Model() {
    const geometry = useLoader(PLYLoader, '/model.ply') as THREE.BufferGeometry;
    
    const hasColors = geometry.hasAttribute('color');
    
    const isPointCloud = !geometry.index;
    
    // For meshes, compute normals if they don't exist (needed for lighting)
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

export default function ModelRender() {
    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <Canvas
                gl={{ alpha: true }}
                camera={{ far: 100000 }}
            >
                <Suspense fallback={null}>
                    <PerspectiveCamera makeDefault position={[0, 0, 1000]} far={100000} />
                    <ambientLight intensity={0.3} />
                    <directionalLight position={[500, 500, 500]} intensity={2} castShadow />
                    <Model />
                    <OrbitControls enableDamping dampingFactor={0.05} />
                </Suspense>
            </Canvas>
        </div>
    );
}