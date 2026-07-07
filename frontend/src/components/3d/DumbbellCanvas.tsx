"use client";
import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  Float,
  Sparkles,
  ContactShadows,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";

/* ─── Easing helpers ─────────────────────────────── */
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const easeOut3 = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const easeOut5 = (t: number) => 1 - Math.pow(1 - clamp01(t), 5);
const easeInOut3 = (t: number) => {
  t = clamp01(t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const norm = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

// Preload once at module level so the model is ready before first render
useGLTF.preload("/models/hero.glb");

// Adjust if the model appears too large or too small in the scene
const MODEL_SCALE = 0.005;
// Change this to move the desktop rotation center.
const DESKTOP_ROTATION_PIVOT: [number, number, number] = [-1.1, 0, 0];
// Global offset applied to the whole 3D animation (positive x = right)
const GLOBAL_ANIMATION_OFFSET: [number, number, number] = [1.15, 0, 0];
// Keep the model itself centered while the parent group handles the orbit.
const DESKTOP_PIVOT_OFFSET: [number, number, number] = [0, 0, 0];
// Tweak this for mobile if the object feels like it rotates around the wrong point.
const MOBILE_PIVOT_OFFSET: [number, number, number] = [0.01, 0, 0];
// Move the mobile object farther from the camera so it fits better on small screens.
const MOBILE_CAMERA_POSITION: [number, number, number] = [0, 0, 13];
const MOBILE_MODEL_POSITION: [number, number, number] = [0, 0, 0];

/* ─── GLTF hero model ─────────────────────────────── */
function HeroModel({
  position = [0, 0, 0],
  pivotOffset = [0, 0, 0],
}: {
  position?: [number, number, number];
  pivotOffset?: [number, number, number];
}) {
  const { scene } = useGLTF("/models/hero.glb");
  const cloned = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const center = new THREE.Vector3();
    box.getCenter(center);
    clone.position.sub(center);
    clone.position.x += pivotOffset[0];
    clone.position.y += pivotOffset[1];
    clone.position.z += pivotOffset[2];
    return clone;
  }, [scene, pivotOffset]);

  return <primitive object={cloned} scale={MODEL_SCALE} position={position} />;
}

/* ─── Scroll-driven rig (desktop) ────────────────── */
function ScrollRig({
  scrollRef,
  maxX,
}: {
  scrollRef: React.MutableRefObject<number>;
  maxX: number;
}) {
  const outer = useRef<THREE.Group>(null!);
  const inner = useRef<THREE.Group>(null!);
  const rot = useRef(0);
  const entryTime = useRef(0);
  // Interaction state
  const pointerDown = useRef(false); // true when pointer is pressed
  const dragging = useRef(false); // true when movement threshold exceeded
  const lastX = useRef(0);
  const vel = useRef(0);
  const moveAcc = useRef(0); // accumulated movement for threshold
  const releaseHandler = useRef<(() => void) | null>(null);
  const moveHandler = useRef<((event: PointerEvent) => void) | null>(null);

  useFrame((_, delta) => {
    entryTime.current = Math.min(entryTime.current + delta, 2.0);
    const entryT = Math.min(entryTime.current / 1.4, 1.0);
    const hasEntered = entryT >= 1.0;

    const t = scrollRef.current;
    const k = 1 - Math.pow(0.0015, delta);

    let tx = 3;
    let ty = -0.1;
    let tiltX = 0;
    let tiltZ = 0;
    let scale = 1;

    /*
     * Scene boundaries (AnimatePresence in ScrollStory):
     *   S1: 0.00–0.22  S2: 0.22–0.45  S3: 0.45–0.66  S4: 0.66–0.87  S5: 0.87–1.0
     *
     * Model rule: move BETWEEN scene boundaries so the dumbbell is
     * already at its destination when the new text card appears.
     *
     *  0.00–0.22  center   (S1 reading)
     *  0.22–0.30  center → right  (S1 exits, S2 enters)
     *  0.30–0.45  hold right  (S2 reading)
     *  0.45–0.53  right → left  (S2 exits, S3 enters)
     *  0.53–0.66  hold left  (S3 reading)
     *  0.66–0.74  left → right  (S3 exits, S4 enters)
     *  0.74–0.87  hold right  (S4 reading)
     *  0.87–0.96  right → center + zoom  (S4 exits, S5 enters)
     *  0.96–1.00  hold center zoomed  (S5 reading)
     */

    if (t < 0.22) {
      // S1: center, static
    } else if (t < 0.30) {
      // S1→S2: swing to right
      const p = easeInOut3(norm(t, 0.22, 0.30));
      tx = THREE.MathUtils.lerp(0, maxX, p);
      const arc = Math.sin(p * Math.PI);
      ty = -0.1 - arc * 1.3;
      tiltX = arc * 0.17;
      tiltZ = arc * -0.12;
    } else if (t < 0.45) {
      // S2 hold: model stays right
      tx = maxX;
    } else if (t < 0.53) {
      // S2→S3: right → left, deepest arc
      const p = easeInOut3(norm(t, 0.45, 0.53));
      tx = THREE.MathUtils.lerp(maxX, -maxX, p);
      const arc = Math.sin(p * Math.PI);
      ty = -0.1 - arc * 2.0;
      tiltX = arc * 0.22;
      tiltZ = arc * 0.15;
    } else if (t < 0.66) {
      // S3 hold: model stays left
      tx = -maxX;
    } else if (t < 0.74) {
      // S3→S4: left → right
      const p = easeInOut3(norm(t, 0.66, 0.74));
      tx = THREE.MathUtils.lerp(-maxX, maxX, p);
      const arc = Math.sin(p * Math.PI);
      ty = -0.1 - arc * 1.5;
      tiltX = arc * 0.18;
      tiltZ = arc * -0.12;
    } else if (t < 0.87) {
      // S4 hold: model stays right
      tx = maxX;
    } else {
      // S4→S5: return center + zoom
      const p = easeInOut3(norm(t, 0.87, 0.96));
      tx = THREE.MathUtils.lerp(maxX, 0, p);
      const arc = Math.sin(p * Math.PI);
      ty = -0.1 - arc * 0.8;
      scale = THREE.MathUtils.lerp(1, 1.28, easeOut3(norm(t, 0.87, 0.96)));
    }

    // Entrance: falls in from above over first 1.4 seconds
    const entryYOff = hasEntered ? 0 : THREE.MathUtils.lerp(4.2, 0, easeOut5(entryT));
    const entryScaleMul = hasEntered ? 1 : THREE.MathUtils.lerp(0.38, 1, easeOut3(entryT));
    const entryTiltX = hasEntered ? 0 : THREE.MathUtils.lerp(0.75, 0, easeOut3(entryT));

    outer.current.position.x = THREE.MathUtils.lerp(outer.current.position.x, tx + GLOBAL_ANIMATION_OFFSET[0], k);
    outer.current.position.y = THREE.MathUtils.lerp(outer.current.position.y, ty + entryYOff, k);
    const s = THREE.MathUtils.lerp(outer.current.scale.x, scale * entryScaleMul, k);
    outer.current.scale.setScalar(s);
    outer.current.rotation.x = THREE.MathUtils.lerp(outer.current.rotation.x, tiltX + entryTiltX, k);
    outer.current.rotation.z = THREE.MathUtils.lerp(outer.current.rotation.z, tiltZ, k);

    // Apply user-driven velocity + auto-rotation when not actively dragging
    if (!dragging.current) {
      // decay velocity over time
      vel.current *= Math.pow(0.0015, delta * 0.5);
      rot.current += vel.current * delta;
      // small automatic baseline rotation
      rot.current += delta * 0.42;
    }
    inner.current.rotation.y = rot.current;
    inner.current.rotation.z = Math.sin(rot.current * 0.5) * 0.06;
  });

  const handleDrag = (clientX: number) => {
    if (!pointerDown.current) return;
    const x = clientX;
    const dx = x - lastX.current;
    lastX.current = x;
    moveAcc.current += Math.abs(dx);
    // threshold (in pixels) before we treat this as an intentional drag
    const THRESH = 6;
    if (!dragging.current && moveAcc.current < THRESH) return;
    dragging.current = true;
    // convert pixels to rotation delta
    const rotDelta = (dx / window.innerWidth) * Math.PI * 1.6;
    rot.current += rotDelta;
    // set velocity so it continues after release
    vel.current = rotDelta * 60;
  };

  return (
    // JSX position/scale match the entry-animation start values so there's no pop on first frame
    <group ref={outer} position={[GLOBAL_ANIMATION_OFFSET[0], 4.1, GLOBAL_ANIMATION_OFFSET[2]]} scale={0.38} rotation={[0.75, 0, 0]}>
      <group ref={inner} position={DESKTOP_ROTATION_PIVOT}>
        <group position={[-DESKTOP_ROTATION_PIVOT[0], -DESKTOP_ROTATION_PIVOT[1], -DESKTOP_ROTATION_PIVOT[2]]}>
          <Suspense fallback={null}>
            <HeroModel position={[0, 0, 0]} pivotOffset={DESKTOP_PIVOT_OFFSET} />
          </Suspense>
        </group>
      </group>
      <ContactShadows
        position={[0, -1.15, 0]}
        opacity={0.4}
        scale={7}
        blur={3.0}
        far={1.8}
        color="#000000"
      />
        {/* Invisible interaction plane to capture pointer drag for rotation */}
        <mesh
          position={[0, 0, 10]}
          onPointerDown={(e) => {
            pointerDown.current = true;
            dragging.current = false;
            moveAcc.current = 0;
            lastX.current = (e.clientX ?? 0) as number;
            e.stopPropagation();

            const onMove = (event: PointerEvent) => {
              handleDrag(event.clientX ?? 0);
            };
            const onUp = () => {
              pointerDown.current = false;
              dragging.current = false;
              if (moveHandler.current) {
                window.removeEventListener('pointermove', moveHandler.current);
                moveHandler.current = null;
              }
              if (releaseHandler.current) {
                window.removeEventListener('pointerup', releaseHandler.current);
                window.removeEventListener('pointercancel', releaseHandler.current);
                releaseHandler.current = null;
              }
            };
            moveHandler.current = onMove;
            releaseHandler.current = onUp;
            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
            window.addEventListener('pointercancel', onUp);
          }}
          onPointerMove={(e) => {
            handleDrag(e.clientX ?? 0);
            e.stopPropagation();
          }}
        >
          <planeGeometry args={[40, 24]} />
          <meshBasicMaterial transparent opacity={0} depthTest={false} depthWrite={false} />
        </mesh>
    </group>
  );
}

/* ─── Gentle float rig (mobile) ──────────────────── */
function FloatRig({ centered = false }: { centered?: boolean }) {
  const inner = useRef<THREE.Group>(null!);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const vel = useRef(0);
  const pointerDown = useRef(false);
  const moveHandler = useRef<((event: PointerEvent) => void) | null>(null);
  const releaseHandler = useRef<(() => void) | null>(null);
  useFrame((_, delta) => {
    if (!dragging.current) {
      // baseline float rotation + decay velocity
      vel.current *= Math.pow(0.0015, delta * 0.5);
      inner.current.rotation.y += delta * 0.5 + vel.current * delta;
    }
    inner.current.rotation.z = Math.sin(inner.current.rotation.y * 0.5) * 0.06;
  });
  const handleDrag = (clientX: number) => {
    if (!pointerDown.current) return;
    const x = clientX;
    const dx = x - lastX.current;
    lastX.current = x;
    const rotDelta = (dx / window.innerWidth) * Math.PI * 1.6;
    inner.current.rotation.y += rotDelta;
    vel.current = rotDelta * 60;
  };

  return (
    <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.7}>
      <group position={GLOBAL_ANIMATION_OFFSET} scale={0.92}>
        <group ref={inner}>
          <Suspense fallback={null}>
            <HeroModel
              position={centered ? [1.248, 0, 0] : [0, 0, 0]}
              pivotOffset={centered ? MOBILE_PIVOT_OFFSET : DESKTOP_PIVOT_OFFSET}
            />
          </Suspense>
        </group>
        <mesh
          position={[0, 0, 10]}
          onPointerDown={(e) => {
            pointerDown.current = true;
            dragging.current = true;
            lastX.current = (e.clientX ?? 0) as number;
            e.stopPropagation();

            const onMove = (event: PointerEvent) => {
              handleDrag(event.clientX ?? 0);
            };
            const onUp = () => {
              pointerDown.current = false;
              dragging.current = false;
              if (moveHandler.current) {
                window.removeEventListener('pointermove', moveHandler.current);
                moveHandler.current = null;
              }
              if (releaseHandler.current) {
                window.removeEventListener('pointerup', releaseHandler.current);
                window.removeEventListener('pointercancel', releaseHandler.current);
                releaseHandler.current = null;
              }
            };
            moveHandler.current = onMove;
            releaseHandler.current = onUp;
            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
            window.addEventListener('pointercancel', onUp);
          }}
          onPointerMove={(e) => {
            handleDrag(e.clientX ?? 0);
            e.stopPropagation();
          }}
        >
          <planeGeometry args={[40, 24]} />
          <meshBasicMaterial transparent opacity={0} depthTest={false} depthWrite={false} />
        </mesh>
      </group>
    </Float>
  );
}

/* ─── Studio environment ──────────────────────────── */
function StudioEnvironment() {
  return (
    <Environment resolution={512} frames={1}>
      <Lightformer intensity={7}   color="#ffffff" position={[0, 5, 9]}    scale={[20, 14, 1]} />
      <Lightformer intensity={5}   color="#f2f8ff" position={[0, 0, 9]}    scale={[16, 12, 1]} />
      <Lightformer intensity={2.8} color="#cce4ff" position={[-10, 2, 3]}  rotation={[0, Math.PI / 2, 0]}  scale={[12, 9, 1]} />
      <Lightformer intensity={3.2} color="#ffffff" position={[10, 1, 2]}   rotation={[0, -Math.PI / 2, 0]} scale={[10, 8, 1]} />
      <Lightformer intensity={4.5} color="#fff6ee" position={[8, 4, -6]}   rotation={[0, -Math.PI / 3, 0]} scale={[10, 6, 1]} />
      <Lightformer intensity={4}   color="#ff2020" position={[-5, -4, 4]}  scale={[9, 7, 1]} />
      <Lightformer form="ring" intensity={4} color="#ffe5e5" position={[2, 8, -2]}   scale={[6, 6, 1]} />
      <Lightformer intensity={2.2} color="#ddeeff" position={[0, -7, 5]}   scale={[16, 10, 1]} />
    </Environment>
  );
}

/* ─── Particle dust ───────────────────────────────── */
function Dust({ count }: { count: number }) {
  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count]);
  const mat = useMemo(
    () => new THREE.PointsMaterial({ size: 0.022, color: "#ffffff", transparent: true, opacity: 0.22, sizeAttenuation: true }),
    []
  );
  const ref = useRef<THREE.Points>(null!);
  useFrame((s) => {
    ref.current.rotation.y = s.clock.elapsedTime * 0.012;
    ref.current.rotation.x = s.clock.elapsedTime * 0.005;
  });
  return <points ref={ref} geometry={geo} material={mat} />;
}

/* ─── Canvas export ──────────────────────────────── */
export interface DumbbellCanvasProps {
  scrollRef?: React.MutableRefObject<number>;
  isMobile?: boolean;
  variant?: "scroll" | "float";
  centered?: boolean;
}

export default function DumbbellCanvas({
  scrollRef,
  isMobile = false,
  variant = "scroll",
  centered = false,
}: DumbbellCanvasProps) {
  const dpr: [number, number] = isMobile ? [1, 1.5] : [1, 2];
  const dustCount = isMobile ? 200 : 450;
  const maxX = isMobile ? 1.7 : 3.4;

  return (
    <Canvas
      camera={{ position: isMobile ? MOBILE_CAMERA_POSITION : [0, 0, 11], fov: 50 }}
      dpr={dpr}
      gl={{ antialias: true, alpha: true, toneMappingExposure: 1.6 }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.28} />
      <directionalLight position={[4, 8, 8]}  intensity={4}   color="#ffffff" />
      <directionalLight position={[-4, 4, 7]} intensity={2}   color="#e4f0ff" />
      <pointLight position={[-5, 2, 4]}  intensity={9}   color="#dc2626" distance={24} />
      <pointLight position={[5, -2, 5]}  intensity={3.5} color="#ff7070" distance={20} />
      <spotLight position={[0, 14, 4]} angle={0.35} penumbra={0.85} intensity={5} color="#ffffff" />

      <StudioEnvironment />
      <Dust count={dustCount} />
      <Sparkles
        count={isMobile ? 30 : 70}
        scale={[16, 12, 8]}
        size={2.5}
        speed={0.28}
        opacity={0.55}
        color="#ff6060"
      />

      {variant === "float" || isMobile ? (
        <FloatRig centered={centered} />
      ) : (
        <ScrollRig scrollRef={scrollRef!} maxX={maxX} />
      )}
    </Canvas>
  );
}
