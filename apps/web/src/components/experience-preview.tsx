'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, RoundedBox } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface ExperiencePreviewProps {
  selectedId: string;
  comparisonId: string;
}

function SofaModel({ comparisonId }: { comparisonId: string }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.25;
  });

  const palette = comparisonId === 'warm' ? ['#c97d4a', '#f6e0b8'] : comparisonId === 'premium' ? ['#f8fafc', '#94a3b8'] : ['#8b5cf6', '#c084fc'];

  return (
    <group ref={groupRef} position={[0, 0.7, 0]}>
      <RoundedBox args={[2.2, 0.9, 1.1]} radius={0.12}>
        <meshStandardMaterial color={palette[0]} roughness={0.4} metalness={0.2} />
      </RoundedBox>
      <RoundedBox position={[0, 0.5, -0.65]} args={[2.0, 0.5, 0.2]} radius={0.08}>
        <meshStandardMaterial color={palette[1]} roughness={0.3} metalness={0.1} />
      </RoundedBox>
      <RoundedBox position={[0.95, 0.35, 0]} args={[0.2, 0.7, 0.9]} radius={0.08}>
        <meshStandardMaterial color={palette[1]} roughness={0.3} />
      </RoundedBox>
      <RoundedBox position={[-0.95, 0.35, 0]} args={[0.2, 0.7, 0.9]} radius={0.08}>
        <meshStandardMaterial color={palette[1]} roughness={0.3} />
      </RoundedBox>
    </group>
  );
}

function PoolModel({ comparisonId }: { comparisonId: string }) {
  const poolRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!poolRef.current) return;
    poolRef.current.position.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.04;
  });

  const poolColor = comparisonId === 'warm' ? '#f59e0b' : comparisonId === 'premium' ? '#e2e8f0' : '#38bdf8';
  const rimColor = comparisonId === 'warm' ? '#7c2d12' : comparisonId === 'premium' ? '#334155' : '#0f172a';

  return (
    <group ref={poolRef} position={[0, 0.1, 0]}>
      <RoundedBox args={[3.4, 0.25, 2.2]} radius={0.08}>
        <meshStandardMaterial color={poolColor} transparent opacity={0.85} roughness={0.1} metalness={0.2} />
      </RoundedBox>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[3.2, 0.05, 2.0]} />
        <meshStandardMaterial color={rimColor} emissive={comparisonId === 'premium' ? '#0f172a' : '#0f766e'} emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

function FloorSurface({ selectedId, comparisonId }: { selectedId: string; comparisonId: string }) {
  const floorMaterial = useMemo(() => {
    const baseColor = selectedId === 'floor' ? '#e2e8f0' : '#4b5563';
    const color = comparisonId === 'warm' ? '#b45309' : comparisonId === 'premium' ? '#f8fafc' : baseColor;
    return new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
  }, [comparisonId, selectedId]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[12, 12]} />
      <primitive object={floorMaterial} attach="material" />
    </mesh>
  );
}

export function ExperiencePreview({ selectedId, comparisonId }: ExperiencePreviewProps) {
  const showSofa = selectedId === 'sofa';
  const showPool = selectedId === 'pool';
  const showFloor = selectedId === 'floor';

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-sm font-medium text-slate-200">Visualização 3D</p>
          <p className="text-xs text-slate-400">MVP inicial • navegação simples</p>
        </div>
        <div className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
          AR disponível em dispositivos compatíveis
        </div>
      </div>

      <div className="relative h-[480px] w-full">
        <Canvas camera={{ position: [6, 4, 7], fov: 40 }} shadows>
          <ambientLight intensity={0.8} />
          <directionalLight position={[6, 10, 4]} intensity={1.7} castShadow />
          <pointLight position={[-4, 4, -3]} intensity={1.1} />
          <Environment preset="city" />

          {showSofa && (
            <Float speed={1.3} rotationIntensity={0.15} floatIntensity={0.35}>
              <SofaModel comparisonId={comparisonId} />
            </Float>
          )}

          {showPool && (
            <Float speed={1.1} rotationIntensity={0.05} floatIntensity={0.15}>
              <PoolModel comparisonId={comparisonId} />
            </Float>
          )}

          <FloorSurface selectedId={selectedId} comparisonId={comparisonId} />
          <OrbitControls enablePan={false} maxDistance={14} minDistance={4} />
        </Canvas>
      </div>
    </div>
  );
}
