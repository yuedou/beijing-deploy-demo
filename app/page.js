'use client'
import * as THREE from 'three'
import { useState, useRef, Suspense, useMemo, MutableRefObject } from 'react'
import { Canvas, useThree, useFrame, useLoader } from '@react-three/fiber'
import { Reflector, CameraShake, OrbitControls, useTexture } from '@react-three/drei'
import { KernelSize } from 'postprocessing'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { SVGLoader } from 'three/examples/jsm/Addons.js'
import styles from './page.module.css'

// Import statements

function Triangle({ color, position = [0, 0, 0], scale = 1, rotation = [0, 0, 0] }) {
  const ref = useRef();

  const [r] = useState(() => Math.random() * 10000);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = -1.75 + Math.sin(state.clock.elapsedTime + r) / 10;
    }
  });

  const { paths: [path] } = useLoader(SVGLoader, '/triangle.svg');
  const geom = useMemo(() => SVGLoader.pointsToStroke(path.subPaths[0].getPoints(), path.userData?.style), []);

  return (
    <group ref={ref} position={position} rotation={rotation} scale={[scale, scale, scale]}>
      <mesh geometry={geom}>
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Rig({ children }) {
  const ref = useRef();
  const vec = new THREE.Vector3();
  const { camera, mouse } = useThree();

  useFrame(() => {
    if (ref.current) {
      camera.position.lerp(vec.set(mouse.x * 2, 0, 3.5), 0.05);
      ref.current.position.lerp(vec.set(mouse.x * 1, mouse.y * 0.1, 0), 0.1);
      ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, (-mouse.x * Math.PI) / 20, 0.1);
    }
  });

  return <group ref={ref}>{children}</group>;
}

export default function App() {
  return (
    <main className={styles.main}>
    <Canvas className={styles.canvas}  dpr={[1, 1.5]} camera={{ position: [0, 0, 15] }}>
        <color attach="background" args={['black']} />
        <ambientLight />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
        <Suspense fallback={null}>
          <Rig>
            <Triangle color="#ff2060" scale={0.009} rotation={[0, 0, Math.PI / 3]} />
            <Triangle color="cyan" scale={0.009} position={[2, 0, -2]} rotation={[0, 0, Math.PI / 3]} />
            <Triangle color="orange" scale={0.009} position={[-2, 0, -2]} rotation={[0, 0, Math.PI / 3]} />
            <Triangle color="white" scale={0.009} position={[0, 2, -10]} rotation={[0, 0, Math.PI / 3]} />
          </Rig>
          <EffectComposer multisampling={8}>
            <Bloom kernelSize={3} luminanceThreshold={0} luminanceSmoothing={0.4} intensity={0.6} />
            <Bloom kernelSize={KernelSize.HUGE} luminanceThreshold={0} luminanceSmoothing={0} intensity={0.5} />
          </EffectComposer>
        </Suspense>
        <CameraShake yawFrequency={0.2} pitchFrequency={0.2} rollFrequency={0.2} />
      </Canvas>
      <video className={styles.video} muted autoPlay src='pexels_videos_4098 (2160p).mp4'></video>
    </main>
  );
}
