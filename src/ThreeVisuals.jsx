import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Chip({ type = 'processor' }) {
  const group = useRef();
  const { pointer } = useThree();
  const isServer = type === 'server';
  const isAccelerator = type === 'accelerator';
  useFrame((state, delta) => {
    if (!group.current || reducedMotion()) return;
    group.current.rotation.y += delta * 0.12;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -0.38 + pointer.y * 0.16, 0.035);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, pointer.x * 0.09, 0.035);
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.65) * 0.12;
  });
  return <group ref={group} rotation={[-0.38, -0.5, 0]}>
    {isServer ? <group>
      {[-1.3, 0, 1.3].map((y) => <group key={y} position={[0, y, 0]}>
        <mesh castShadow><boxGeometry args={[4.3, 0.9, 2.7]} /><meshStandardMaterial color="#25272d" metalness={0.85} roughness={0.25} /></mesh>
        <mesh position={[0, 0, 1.37]}><boxGeometry args={[3.9, 0.55, 0.04]} /><meshStandardMaterial color="#0b0c0f" metalness={0.5} /></mesh>
        {[-1.5, -1, -0.5, 0, 0.5, 1].map((x) => <mesh key={x} position={[x, 0, 1.41]}><boxGeometry args={[0.22, 0.12, 0.03]} /><meshBasicMaterial color={x === 1.5 ? '#ff3038' : '#727680'} /></mesh>)}
      </group>)}
    </group> : <group rotation={isAccelerator ? [0, 0, Math.PI / 2] : [0, 0, 0]}>
      <mesh castShadow><boxGeometry args={isAccelerator ? [2.7, 0.35, 4.1] : [4.2, 0.32, 4.2]} /><meshStandardMaterial color="#17181d" metalness={0.9} roughness={0.22} /></mesh>
      <mesh position={[0, 0.25, 0]} castShadow><boxGeometry args={isAccelerator ? [2.35, 0.24, 3.7] : [3.75, 0.22, 3.75]} /><meshStandardMaterial color="#a5a8b0" metalness={0.95} roughness={0.18} /></mesh>
      <mesh position={[0, 0.43, 0]}><boxGeometry args={isAccelerator ? [1.65, 0.18, 2.55] : [2.25, 0.2, 2.25]} /><meshStandardMaterial color="#111217" metalness={0.8} roughness={0.2} /></mesh>
      <mesh position={[0, 0.54, 0]}><boxGeometry args={[0.72, 0.035, 0.72]} /><meshStandardMaterial color="#e51c23" emissive="#e51c23" emissiveIntensity={1.4} /></mesh>
      {Array.from({ length: 7 }, (_, index) => {
        const offset = -1.5 + index * 0.5;
        return <group key={offset}>
          <mesh position={[offset, -0.24, 2.13]}><boxGeometry args={[0.14, 0.22, 0.4]} /><meshStandardMaterial color="#d9bd72" metalness={0.9} /></mesh>
          <mesh position={[offset, -0.24, -2.13]}><boxGeometry args={[0.14, 0.22, 0.4]} /><meshStandardMaterial color="#d9bd72" metalness={0.9} /></mesh>
        </group>;
      })}
    </group>}
    <pointLight position={[0, 0, 2]} color="#e51c23" intensity={12} distance={7} />
  </group>;
}

function Orbit({ radius = 3.2, speed = 0.15 }) {
  const ring = useRef();
  useFrame((_, delta) => { if (ring.current && !reducedMotion()) ring.current.rotation.z += delta * speed; });
  return <group ref={ring} rotation={[1.15, 0.2, 0]}>
    <mesh><torusGeometry args={[radius, 0.009, 8, 128]} /><meshBasicMaterial color="#e51c23" transparent opacity={0.45} /></mesh>
    <mesh position={[radius, 0, 0]}><sphereGeometry args={[0.065, 16, 16]} /><meshBasicMaterial color="#ff4b52" /></mesh>
  </group>;
}

export function ProductScene({ type = 'processor', className = '' }) {
  const host = useRef();
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '150px' });
    if (host.current) observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={host} className={`three-product-scene ${className}`} aria-label={`Interactive 3D ${type} visualization`}>
    {visible && <Canvas camera={{ position: [0, 1.2, 8], fov: 40 }} dpr={[1, 1.6]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} shadows>
      <ambientLight intensity={1.2} />
      <directionalLight position={[4, 6, 5]} intensity={4} color="#ffffff" castShadow />
      <directionalLight position={[-5, 0, 2]} intensity={3} color="#e51c23" />
      <Chip type={type} />
      <Orbit /><Orbit radius={3.65} speed={-0.1} />
    </Canvas>}
  </div>;
}

function Network() {
  const group = useRef();
  const points = useMemo(() => Array.from({ length: 34 }, (_, index) => [Math.sin(index * 2.17) * (3 + index % 4), Math.cos(index * 1.73) * 3, -2 - (index % 6)]), []);
  const lineGeometry = useMemo(() => {
    const positions = [];
    points.forEach((point, index) => { const next = points[(index + 5) % points.length]; positions.push(...point, ...next); });
    return new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  }, [points]);
  useFrame((state) => { if (group.current && !reducedMotion()) group.current.rotation.z = state.clock.elapsedTime * 0.012; });
  return <group ref={group}>
    <lineSegments geometry={lineGeometry}><lineBasicMaterial color="#e51c23" transparent opacity={0.13} /></lineSegments>
    {points.map((point, index) => <mesh key={index} position={point}><sphereGeometry args={[index % 5 === 0 ? 0.045 : 0.022, 8, 8]} /><meshBasicMaterial color={index % 5 === 0 ? '#e51c23' : '#777b86'} transparent opacity={0.5} /></mesh>)}
  </group>;
}

export default function ThreeBackground() {
  return <div className="three-background" aria-hidden="true"><Canvas camera={{ position: [0, 0, 8], fov: 55 }} dpr={[1, 1.25]} gl={{ antialias: false, alpha: true }}><Network /></Canvas></div>;
}
