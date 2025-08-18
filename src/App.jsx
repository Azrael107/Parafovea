import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Icosahedron from "./components/Scene/Icosahedron";

export default function App() {
    return (
        <Canvas
            camera={{ position: [0, 0, 5], fov: 75 }}
            style={{
                background: "#111118",
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
            }}
        >
            <ambientLight intensity={0.2} />
            <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
            <pointLight position={[-5, -5, -5]} color="#00aaff" intensity={20} distance={10} />
            <Icosahedron />
            <OrbitControls />
        </Canvas>
    );
}
