import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef } from "react";

function OrbitingSphere() {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    
    if (mesh.current) {
      mesh.current.rotation.y += 0.012;
      mesh.current.rotation.x += 0.006;
    }
    
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#6366f1" wireframe roughness={0.3} metalness={0.15} />
      <pointLight position={[5, 5, 5]} />
    </mesh>
  );
}

export function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 6] }}>
      <ambientLight intensity={0.45} />
      <pointLight position={[5, 5, 5]} />
      <OrbitingSphere />
    </Canvas>
  );
}

export default HeroScene;

