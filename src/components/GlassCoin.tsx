import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, MeshTransmissionMaterial, GradientTexture } from "@react-three/drei";
import { useSpring, a } from "@react-spring/three";
import { useRef, Suspense, useEffect, useMemo } from "react";
import * as THREE from "three";

function Background() {
  const frontMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const scrollState = useRef({
    top: 0,
    height: typeof window !== "undefined" ? window.innerHeight : 1,
  });

  useEffect(() => {
    const findScroller = (): HTMLElement | Window => {
      const candidates = document.querySelectorAll<HTMLElement>(".overflow-y-auto");
      for (const el of candidates) {
        if (el.scrollHeight > el.clientHeight) return el;
      }
      return window;
    };

    const scroller = findScroller();

    const update = () => {
      if (scroller === window) {
        scrollState.current.top = window.scrollY;
        scrollState.current.height = window.innerHeight;
      } else {
        const el = scroller as HTMLElement;
        scrollState.current.top = el.scrollTop;
        scrollState.current.height = el.clientHeight;
      }
    };

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useFrame(() => {
    if (!frontMatRef.current) return;
    // Hero is 110vh — fully fade to light by the time hero ends.
    const { top, height } = scrollState.current;
    const progress = THREE.MathUtils.clamp(top / (height * 1.1), 0, 1);
    frontMatRef.current.opacity = THREE.MathUtils.lerp(frontMatRef.current.opacity, progress, 0.1);
  });

  // Rotate plane +45° so GradientTexture (top→bottom) reads as "to bottom right"
  // (last color — the light one — lands in the bottom-right corner)
  const diagonal: [number, number, number] = [0, 0, Math.PI / 4];

  return (
    <>
      {/* Back plane — dark hero gradient (light glow rises higher from bottom-right) */}
      <mesh position={[0, 0, -10]} rotation={diagonal}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial depthWrite={false}>
          <GradientTexture
            stops={[0, 0.26, 0.48, 0.68, 0.82, 1]}
            colors={["#000000", "#01030A", "#06294A", "#3279A0", "#B4D3DF", "#EEF3F1"]}
          />
        </meshBasicMaterial>
      </mesh>

      {/* Front plane — light section gradient (to bottom right), fades in on scroll */}
      <mesh position={[0, 0, -9.9]} rotation={diagonal}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial ref={frontMatRef} depthWrite={false} transparent opacity={0}>
          <GradientTexture
            stops={[0, 0.35, 0.7, 1]}
            colors={["#CCDAE4", "#FDF8E3", "#F9F5EA", "#F8F4F1"]}
          />
        </meshBasicMaterial>
      </mesh>
    </>
  );
}

function Coin({ baseScale = 1 }: { baseScale?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const pointer = useRef({ x: 0, y: 0 });

  const { scale } = useSpring({
    from: { scale: 0 },
    to: { scale: baseScale },
    config: { mass: 1.2, tension: 180, friction: 14 },
  });

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = THREE.MathUtils.lerp(
      ref.current.rotation.x,
      pointer.current.y * 0.5,
      0.1,
    );
    ref.current.rotation.y = THREE.MathUtils.lerp(
      ref.current.rotation.y,
      pointer.current.x * Math.PI,
      0.1,
    );
    ref.current.rotation.z = THREE.MathUtils.lerp(
      ref.current.rotation.z,
      state.clock.elapsedTime * 0.5,
      0.1,
    );
  });

  const heartGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0;
    const y = 0;
    shape.moveTo(x, y);
    shape.bezierCurveTo(x, y, x - 0.5, y + 0.5, x - 1, y + 0.5);
    shape.bezierCurveTo(x - 2, y + 0.5, x - 2, y - 0.75, x - 2, y - 0.75);
    shape.bezierCurveTo(x - 2, y - 1.7, x - 1, y - 2.4, x, y - 3.2);
    shape.bezierCurveTo(x + 1, y - 2.4, x + 2, y - 1.7, x + 2, y - 0.75);
    shape.bezierCurveTo(x + 2, y - 0.75, x + 2, y + 0.5, x + 1, y + 0.5);
    shape.bezierCurveTo(x + 0.5, y + 0.5, x, y, x, y);

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.4,
      bevelEnabled: true,
      bevelThickness: 0.15,
      bevelSize: 0.15,
      bevelSegments: 8,
      curveSegments: 64,
    });
    geometry.center();
    return geometry;
  }, []);

  return (
    <a.mesh ref={ref} scale={scale} geometry={heartGeometry} rotation={[Math.PI, 0, 0]}>
      <MeshTransmissionMaterial
        thickness={0.2}
        roughness={0}
        transmission={1}
        ior={1.2}
        chromaticAberration={0.02}
        backside={true}
      />
    </a.mesh>
  );
}

export default function GlassCoin({ coinScale = 1 }: { coinScale?: number }) {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0, 7], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent", pointerEvents: "none" }}
    >
      <Suspense fallback={null}>
        <Background />
        <ambientLight intensity={0.4} />
        <pointLight position={[4, 3, 5]} intensity={60} color="#ffffff" />
        <pointLight position={[-5, -2, 3]} intensity={20} color="#88b8ff" />
        <spotLight position={[3, 4, 4]} angle={0.4} penumbra={1} intensity={40} />
        <directionalLight position={[0, 0, 5]} intensity={3} color="#ffffff" />
        <Coin baseScale={coinScale} />
        <Environment preset="studio" />
      </Suspense>
    </Canvas>
  );
}
