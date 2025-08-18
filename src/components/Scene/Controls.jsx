import { OrbitControls } from "@react-three/drei";

export default function Controls() {
    return (
        <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.05}
            maxPolarAngle={Math.PI / 2}
            minDistance={3}
            maxDistance={10}
        />
    );
}
