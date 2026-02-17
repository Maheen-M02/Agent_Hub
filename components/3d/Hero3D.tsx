'use client';

import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { FloatingOrb, ParticleField, RotatingGroup } from './Scene3D';
import { Suspense } from 'react';

export function Hero3D() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <Canvas 
        style={{ pointerEvents: 'none' }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} />
          
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
          <directionalLight position={[-10, -10, -5]} intensity={0.8} color="#8b5cf6" />
          <pointLight position={[5, 5, 5]} intensity={1} color="#3b82f6" />
          <pointLight position={[-5, -5, 5]} intensity={0.8} color="#06b6d4" />
          <spotLight position={[0, 10, 0]} intensity={0.5} angle={0.3} penumbra={1} color="#a855f7" />
          
          <RotatingGroup>
            <FloatingOrb position={[-2, 1, 0]} color="#8b5cf6" speed={1} />
            <FloatingOrb position={[2, -1, -2]} color="#3b82f6" speed={0.8} />
            <FloatingOrb position={[0, 2, -1]} color="#06b6d4" speed={1.2} />
          </RotatingGroup>
          
          <ParticleField />
        </Suspense>
      </Canvas>
    </div>
  );
}
