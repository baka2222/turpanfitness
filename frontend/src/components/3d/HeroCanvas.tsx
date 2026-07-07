"use client";
import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Torus, Sphere, Float, MeshDistortMaterial, Stars, useGLTF } from "@react-three/drei";
import * as THREE from "three";

useGLTF.preload("/models/hero.glb");

function RedRing({ position, scale, speed, rotAxis }: {
  position: [number, number, number];
  scale: number;
  speed: number;
  rotAxis: [number, number, number];
}) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    ref.current.rotation.x += delta * speed * rotAxis[0];
    ref.current.rotation.y += delta * speed * rotAxis[1];
    ref.current.rotation.z += delta * speed * rotAxis[2];
  });
  return (
    <Torus ref={ref} position={position} args={[1, 0.03, 16, 100]} scale={scale}>
      <meshStandardMaterial
        color="#dc2626"
        emissive="#dc2626"
        emissiveIntensity={0.6}
        roughness={0.2}
        metalness={0.8}
      />
    </Torus>
  );
}

function GlowingSphere({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
  });
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere ref={ref} position={position} args={[0.5, 32, 32]}>
        <MeshDistortMaterial
          color="#1a0000"
          emissive="#dc2626"
          emissiveIntensity={0.3}
          distort={0.4}
          speed={2}
          roughness={0}
          metalness={1}
        />
      </Sphere>
    </Float>
  );
}

function ParticleField() {
  const count = 600;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, []);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  const mat = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.025,
        color: "#ffffff",
        transparent: true,
        opacity: 0.4,
        sizeAttenuation: true,
      }),
    []
  );

  const ref = useRef<THREE.Points>(null!);
  useFrame((state) => {
    ref.current.rotation.y = state.clock.elapsedTime * 0.02;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
  });

  return <points ref={ref} geometry={geo} material={mat} />;
}

function Model() {
  const { scene } = useGLTF("/models/hero.glb");
  return <primitive object={scene} position={[0, -1, 0]} scale={2.2} />;
}

function Scene() {
  // Interaction state for dragging the hero model
  const pointerDown = useRef(false);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const vel = useRef(0);
  const rot = useRef(0);
  const moveAcc = useRef(0);
  const releaseHandler = useRef<(() => void) | null>(null);
  // Small wrapper to apply rotation via ref to the primitive
  const modelRef = useRef<THREE.Group>(null!);
  useFrame((_, delta) => {
    if (!dragging.current) {
      // apply decay to velocity and inertial rotation
      vel.current *= Math.pow(0.0015, delta * 0.5);
      rot.current += vel.current * delta;
      // baseline slow rotation
      rot.current += delta * 0.42;
    }
    // gentle re-center when not interacting
    if (!dragging.current) {
      rot.current = THREE.MathUtils.lerp(rot.current, 0, Math.min(1, delta * 0.6));
    }
    if (modelRef.current) {
      modelRef.current.rotation.y = rot.current;
      modelRef.current.rotation.z = Math.sin(rot.current * 0.5) * 0.03;
    }
  });
  return (
    <>
      <color attach="background" args={["#050505"]} />
      <ambientLight intensity={0.1} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
      <pointLight position={[-5, -3, 2]} intensity={2} color="#dc2626" />
      <pointLight position={[0, 0, 3]} intensity={0.5} color="#dc2626" />

      <Stars radius={80} depth={50} count={1500} factor={3} saturation={0} fade speed={0.5} />
      <ParticleField />

      <Suspense fallback={null}>
        <group ref={modelRef}>
          <Model />
          <mesh
            position={[0, 0, 6]}
            onPointerDown={(e) => {
              pointerDown.current = true;
              dragging.current = false;
              moveAcc.current = 0;
              lastX.current = (e.clientX ?? 0) as number;
              const onUp = () => {
                pointerDown.current = false;
                dragging.current = false;
                if (releaseHandler.current) {
                  window.removeEventListener('pointerup', releaseHandler.current);
                  releaseHandler.current = null;
                }
              };
              releaseHandler.current = onUp;
              window.addEventListener('pointerup', onUp);
              e.stopPropagation();
            }}
            onPointerMove={(e) => {
              if (!pointerDown.current) return;
              const x = (e.clientX ?? 0) as number;
              const dx = x - lastX.current;
              lastX.current = x;
              moveAcc.current += Math.abs(dx);
              const THRESH = 6;
              if (!dragging.current && moveAcc.current < THRESH) return;
              dragging.current = true;
              const rotDelta = (dx / window.innerWidth) * Math.PI * 1.6;
              rot.current += rotDelta;
              vel.current = rotDelta * 60;
              e.stopPropagation();
            }}
          >
            <planeGeometry args={[40, 24]} />
            <meshBasicMaterial transparent opacity={0} depthTest={false} depthWrite={false} />
          </mesh>
        </group>
      </Suspense>
    </>
  );
}

export default function HeroCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false }}
      style={{ background: "#050505" }}
    >
      <Scene />
    </Canvas>
  );
}
