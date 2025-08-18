import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function Icosahedron() {
    const meshRef = useRef();

    useFrame((state, delta) => {
        meshRef.current.rotation.x += delta * 0.5;
        meshRef.current.rotation.y += delta * 0.75;
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2;
    });

    return (
        <mesh ref={meshRef} castShadow receiveShadow>
            <icosahedronGeometry args={[1.5, 1]} />
            <meshPhysicalMaterial
                color="#00aaff"
                emissive="#0044ff" // Brighter emissive
                emissiveIntensity={1.5} // Increased from 0.5
                metalness={0.8}
                roughness={0.2}
            />
        </mesh>
    );
}
