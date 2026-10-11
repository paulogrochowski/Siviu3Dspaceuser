'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bounds, Environment, OrbitControls, RoundedBox, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

type ProductId = 'sofa' | 'luminaria' | 'mesa' | 'planta';

function Sofa({ finish }: { finish: string }) {
  const colors: Record<string, string> = {
    Original: '#64748b',
    Claro: '#cbd5e1',
    Escuro: '#1e293b',
    Quente: '#9a6b45',
  };
  const color = colors[finish] ?? colors.Original;

  return (
    <group position={[-0.9, 0.65, 0.2]}>
      <RoundedBox args={[2.5, 0.7, 1.05]} radius={0.12} castShadow>
        <meshStandardMaterial color={color} roughness={0.72} />
      </RoundedBox>
      <RoundedBox position={[0, 0.55, -0.42]} args={[2.4, 0.75, 0.22]} radius={0.08} castShadow>
        <meshStandardMaterial color={color} roughness={0.78} />
      </RoundedBox>
      <RoundedBox position={[-1.08, 0.25, 0]} args={[0.18, 0.55, 0.95]} radius={0.06} castShadow>
        <meshStandardMaterial color={color} roughness={0.78} />
      </RoundedBox>
      <RoundedBox position={[1.08, 0.25, 0]} args={[0.18, 0.55, 0.95]} radius={0.06} castShadow>
        <meshStandardMaterial color={color} roughness={0.78} />
      </RoundedBox>
    </group>
  );
}

function Table() {
  return (
    <group position={[1.5, 0.45, 0.2]}>
      <RoundedBox args={[1.5, 0.18, 0.95]} radius={0.06} castShadow>
        <meshStandardMaterial color="#a8794b" roughness={0.55} />
      </RoundedBox>
      {[-0.58, 0.58].flatMap((x) =>
        [-0.33, 0.33].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, -0.42, z]} castShadow>
            <cylinderGeometry args={[0.07, 0.09, 0.8, 16]} />
            <meshStandardMaterial color="#5b4635" roughness={0.7} />
          </mesh>
        )),
      )}
    </group>
  );
}

function Lamp() {
  return (
    <group position={[0.8, 2.45, -1.1]}>
      <mesh position={[0, -0.55, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.045, 1.1, 16]} />
        <meshStandardMaterial color="#30343b" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, -1.08, 0]} castShadow>
        <sphereGeometry args={[0.26, 24, 16]} />
        <meshStandardMaterial color="#f6e7b5" emissive="#f6d76e" emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

function Plant() {
  return (
    <group position={[-2.2, 0.55, -1.1]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.35, 0.28, 0.55, 24]} />
        <meshStandardMaterial color="#9a6b45" roughness={0.8} />
      </mesh>
      {[0, 1, 2, 3, 4].map((index) => (
        <mesh
          key={index}
          position={[
            Math.cos(index * 1.2) * 0.18,
            0.65 + (index % 2) * 0.16,
            Math.sin(index * 1.2) * 0.18,
          ]}
          rotation={[0.2, index * 0.7, -0.25]}
          castShadow
        >
          <sphereGeometry args={[0.28, 16, 12]} />
          <meshStandardMaterial color="#3f7d52" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function RoomModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);

  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });

  return <primitive object={scene} />;
}

function ProductLayer({ placed, finish }: { placed: ProductId[]; finish: string }) {
  return (
    <group>
      {placed.includes('sofa') && <Sofa finish={finish} />}
      {placed.includes('mesa') && <Table />}
      {placed.includes('luminaria') && <Lamp />}
      {placed.includes('planta') && <Plant />}
    </group>
  );
}

export function ExperienceScene({
  environmentModelUrl,
  placed,
  selected,
  finish,
}: {
  environmentModelUrl: string;
  placed: ProductId[];
  selected: ProductId | null;
  finish: string;
}) {
  return (
    <div className="relative h-[560px] w-full">
      <Canvas shadows camera={{ position: [5, 3.2, 6], fov: 48 }}>
        <color attach="background" args={['#090b10']} />
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[4, 7, 5]}
          intensity={1.7}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <Environment preset="apartment" />

        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.2}>
            <RoomModel url={environmentModelUrl} />
            <ProductLayer placed={placed} finish={finish} />
          </Bounds>
        </Suspense>

        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={1}
          maxDistance={30}
          minPolarAngle={0.18}
          maxPolarAngle={Math.PI - 0.18}
        />
      </Canvas>

      <div className="pointer-events-none absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
        <div className="rounded-2xl border border-white/10 bg-black/55 px-3 py-2 backdrop-blur-xl">
          <p className="text-xs font-medium text-white">Ambiente reconstruído</p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Modelo 3D real gerado a partir da foto
          </p>
        </div>
        <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-[11px] text-cyan-100">
          {selected ? 'Produto selecionado' : 'Explore o ambiente'}
        </div>
      </div>
    </div>
  );
}
