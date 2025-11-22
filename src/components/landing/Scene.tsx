"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Float } from "@react-three/drei";
import { useState, useRef } from "react";
import * as random from "maath/random/dist/maath-random.esm";
import * as THREE from "three";

function Stars(props: any) {
    const ref = useRef<THREE.Points>(null!);
    const [sphere] = useState(() => random.inSphere(new Float32Array(5000), { radius: 1.5 }));

    useFrame((state, delta) => {
        ref.current.rotation.x -= delta / 10;
        ref.current.rotation.y -= delta / 15;
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#ffa0e0"
                    size={0.005}
                    sizeAttenuation={true}
                    depthWrite={false}
                />
            </Points>
        </group>
    );
}

function AnimatedShape() {
    const meshRef = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        // Check if window is defined (client-side)
        if (typeof window === 'undefined') return;

        const scrollY = window.scrollY;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const scrollProgress = maxScroll > 0 ? scrollY / maxScroll : 0;

        // Base rotation + scroll influence
        meshRef.current.rotation.x = time * 0.2 + scrollY * 0.002;
        meshRef.current.rotation.y = time * 0.3 + scrollY * 0.002;

        // Scroll reaction - move forward/backward and distort
        // Move closer as you scroll (z increases towards camera at 5)
        meshRef.current.position.z = Math.sin(time * 0.5) * 0.5 + (scrollProgress * 3);
        meshRef.current.scale.setScalar(1 + scrollProgress * 0.5);
    });

    return (
        <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
            <mesh ref={meshRef} scale={1.2}>
                <torusKnotGeometry args={[1, 0.3, 128, 16]} />
                <meshStandardMaterial
                    color="#6366f1"
                    wireframe
                    emissive="#4f46e5"
                    emissiveIntensity={2}
                    transparent
                    opacity={0.3}
                />
            </mesh>
        </Float>
    );
}

export default function Scene() {
    return (
        <div className="fixed inset-0 -z-10 h-full w-full pointer-events-none">
            <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={2} />
                <pointLight position={[-10, -10, -10]} color="#4f46e5" intensity={2} />
                <Stars />
                <AnimatedShape />
            </Canvas>
        </div>
    );
}
