import { Environment, SpotLight } from "@react-three/drei";

export default function Lights() {
    return (
        <>
            <ambientLight intensity={0.2} />
            <SpotLight
                position={[5, 5, 5]}
                angle={0.25}
                penumbra={1}
                intensity={2}
                castShadow
                shadow-mapSize={[1024, 1024]}
            />
            <Environment preset="studio" />
        </>
    );
}
